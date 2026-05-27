import { env } from "@/lib/env";
import { qualifyLead } from "@/lib/qualifyLead";
import { appendLeadLog } from "@/lib/sheets";
import { formatQualificationMessage, sendTelegramMessage } from "@/lib/telegram";
import { TelegramUpdate } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

function assertTelegramSecret(request: Request) {
  const expected = env.telegramWebhookSecret();
  const received = request.headers.get("x-telegram-bot-api-secret-token");
  if (!received || received !== expected) {
    throw new Error("Invalid Telegram webhook secret");
  }
}

function getTelegramUser(update: TelegramUpdate) {
  const from = update.message?.from;
  if (!from) return "unknown";
  return from.username ? `@${from.username}` : [from.first_name, from.last_name].filter(Boolean).join(" ") || String(from.id);
}

export async function POST(request: Request) {
  try {
    assertTelegramSecret(request);
    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;
    const chatId = message?.chat?.id;
    const text = message?.text?.trim();

    if (!chatId) return Response.json({ ok: true, ignored: "no_chat" });

    if (!text) {
      await sendTelegramMessage(chatId, "Envíame los datos del lead en texto libre para cualificarlo.");
      return Response.json({ ok: true, ignored: "no_text" });
    }

    if (text === "/start" || text === "/help") {
      await sendTelegramMessage(
        chatId,
        "Hola 👋 Envíame un lead en texto libre. Ejemplo:\n\nEmpresa de consultoría, 15 empleados, Madrid, quieren automatizar su proceso de ventas."
      );
      return Response.json({ ok: true, command: text });
    }

    const { result, model } = await qualifyLead(text);
    await sendTelegramMessage(chatId, formatQualificationMessage(result));

    await appendLeadLog({
      timestamp: new Date().toISOString(),
      telegramUser: getTelegramUser(update),
      chatId: String(chatId),
      leadText: text,
      decision: result.decision,
      score: result.score,
      reason: result.reason,
      sectorMatch: result.criteria.sector_match,
      employeeMatch: result.criteria.employee_match,
      locationMatch: result.criteria.location_match,
      interestMatch: result.criteria.interest_match,
      model,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error", error);
    return Response.json({ ok: false, error: "internal_error" }, { status: 200 });
  }
}

export async function GET() {
  return Response.json({
    ok: true,
    message: "Telegram webhook endpoint is alive. Use POST from Telegram.",
  });
}
