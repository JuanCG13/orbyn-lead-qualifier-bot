# Orbyn Lead Qualifier Bot

Telegram lead qualification agent built with **Next.js + TypeScript**, deployable on **Vercel**. It receives free-text leads in Telegram, qualifies them with an LLM through **OpenRouter**, replies in the same chat, and logs every lead to **Google Sheets**.

## What it does

1. Receives a Telegram message with lead data in free text.
2. Evaluates the lead against this ICP:
   - Services or consulting company.
   - Minimum 5 employees.
   - Spain or Latin America.
   - Interest in automation, AI, sales/process optimization, CRM, bots, reporting, or efficiency.
3. Replies in Telegram with `cualificado` or `no_cualificado`, a score, and a short reason.
4. Appends a row to Google Sheets with timestamp, lead text, decision, score, reasoning, criteria, and model used.

## Architecture

```text
Telegram Bot
  -> Telegram Webhook
  -> Vercel / Next.js Route Handler: /api/telegram
  -> OpenRouter LLM classification
  -> Google Sheets append row
  -> Telegram sendMessage response
```

## Model choice

Default model:

```env
OPENROUTER_MODEL=openai/gpt-4.1-nano
```

Why: for this task it is a strong quality/price option. In testing it returned valid structured JSON quickly and is significantly cheaper than `openai/gpt-4o-mini` on OpenRouter. A cheap fallback is configured:

```env
OPENROUTER_FALLBACK_MODEL=mistralai/mistral-nemo
```

## Environment variables

Copy `.env.example` and configure these values in Vercel:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
APP_URL=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4.1-nano
OPENROUTER_FALLBACK_MODEL=mistralai/mistral-nemo
GOOGLE_SHEET_ID=
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

Important: never commit real secrets. `.env*` files are ignored except `.env.example`.

## Telegram setup

1. Open Telegram and talk to `@BotFather`.
2. Run `/newbot` and create the bot.
3. Copy the bot token into `TELEGRAM_BOT_TOKEN`.
4. Generate a webhook secret:

```bash
openssl rand -hex 32
```

5. After deploying to Vercel, set the webhook:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=$APP_URL/api/telegram" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

6. Verify:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

## Google Sheets setup

1. Create a Google Sheet, for example: `Orbyn Lead Qualifier Logs`.
2. Copy the Sheet ID from the URL:

```text
https://docs.google.com/spreadsheets/d/<GOOGLE_SHEET_ID>/edit
```

3. In Google Cloud, create a Service Account.
4. Enable the Google Sheets API.
5. Create a JSON key for the service account.
6. Share the Google Sheet with the service account email as editor.
7. Put these values in Vercel:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

For Vercel, keep private key line breaks escaped as `\n`.

The app automatically creates/uses a sheet tab called `Leads` and writes these columns:

```text
Timestamp | Telegram User | Chat ID | Lead Text | Decision | Score | Reason | Sector Match | Employee Match | Location Match | Interest Match | Model
```

## Local development

```bash
npm install
npm run dev
```

Healthcheck:

```bash
curl http://localhost:3000/api/health
```

Build check:

```bash
npm run lint
npm run build
```

## Example Telegram inputs

Qualified:

```text
Empresa de consultoría, 15 empleados, Madrid, quieren automatizar su proceso de ventas.
```

```text
Agencia de marketing en México con 12 personas. Buscan usar IA para responder leads y mejorar seguimiento comercial.
```

Not qualified:

```text
Freelancer individual en Berlín quiere hacer una web personal.
```

```text
Tienda de ropa con 3 empleados en Francia, quiere cambiar el logo.
```

## Production improvements

1. Add strict structured-output validation, retries with backoff, and fallback behavior when the LLM provider fails or returns invalid JSON.
2. Harden prompt-injection defenses by separating system instructions from lead data, limiting input size, validating output, and ignoring attempts to alter qualification rules.
3. Control cost and abuse with per-chat rate limits, token/cost logging, cheap classification models, usage alerts, and optional queue-based async processing.

## Delivery checklist

- Telegram bot username.
- Public GitHub repository URL.
- Vercel deployment URL.
- 1-minute demo video showing Telegram response and Google Sheets logging.
- The 3 production-improvement sentences above.
