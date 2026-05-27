import { env } from "./env";
import { LeadQualification } from "./types";

export async function sendTelegramMessage(chatId: number | string, text: string) {
  const token = env.telegramBotToken();
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${body}`);
  }
}

export function formatQualificationMessage(result: LeadQualification) {
  const icon = result.decision === "cualificado" ? "✅" : "❌";
  const title = result.decision === "cualificado" ? "Lead cualificado" : "Lead no cualificado";

  return `${icon} <b>${title}</b>\n\n${escapeHtml(result.reason)}\n\n<b>Score:</b> ${result.score}/100`;
}

export function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
