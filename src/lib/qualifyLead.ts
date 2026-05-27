import OpenAI from "openai";
import { env } from "./env";
import { buildLeadPrompt, ICP_SYSTEM_PROMPT } from "./prompt";
import { LeadQualification, LeadQualificationSchema } from "./types";

function client() {
  return new OpenAI({
    apiKey: env.openRouterApiKey(),
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": env.appUrl(),
      "X-Title": "Orbyn Lead Qualifier Bot",
    },
  });
}

function safeJsonParse(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("LLM response did not contain JSON");
    return JSON.parse(match[0]);
  }
}

async function classifyWithModel(leadText: string, model: string): Promise<LeadQualification> {
  const response = await client().chat.completions.create({
    model,
    temperature: 0,
    max_tokens: 350,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ICP_SYSTEM_PROMPT },
      { role: "user", content: buildLeadPrompt(leadText) },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");

  const parsed = safeJsonParse(content);
  return LeadQualificationSchema.parse(parsed);
}

export async function qualifyLead(leadText: string): Promise<{ result: LeadQualification; model: string }> {
  const primaryModel = env.openRouterModel();
  try {
    return { result: await classifyWithModel(leadText, primaryModel), model: primaryModel };
  } catch (primaryError) {
    const fallbackModel = env.openRouterFallbackModel();
    if (fallbackModel === primaryModel) throw primaryError;
    return { result: await classifyWithModel(leadText, fallbackModel), model: fallbackModel };
  }
}
