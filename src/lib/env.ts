function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  telegramBotToken: () => requireEnv("TELEGRAM_BOT_TOKEN"),
  telegramWebhookSecret: () => requireEnv("TELEGRAM_WEBHOOK_SECRET"),
  openRouterApiKey: () => requireEnv("OPENROUTER_API_KEY"),
  openRouterModel: () => process.env.OPENROUTER_MODEL || "openai/gpt-4.1-nano",
  openRouterFallbackModel: () => process.env.OPENROUTER_FALLBACK_MODEL || "mistralai/mistral-nemo",
  appUrl: () => process.env.APP_URL || "http://localhost:3000",
  googleSheetId: () => requireEnv("GOOGLE_SHEET_ID"),
  googleClientEmail: () => requireEnv("GOOGLE_CLIENT_EMAIL"),
  googlePrivateKey: () => requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
};
