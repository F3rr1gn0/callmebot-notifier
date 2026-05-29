# callmebot-notifier

TypeScript-first notifier for CallMeBot WhatsApp API.

Support:
- ESM + CommonJS
- build in `dist/`
- `.d.ts`
- Express integration
- webhook formatter
- Telegram fallback
- Email fallback
- Docker
- tests

## Install

```bash
npm i callmebot-notifier
```

## Setup CallMeBot

Need:
- `PHONE`
- `APIKEY`

CallMeBot uses a public WhatsApp bridge. Not official WhatsApp API.
Use for personal, non-critical notifications only.

## TypeScript

```ts
import { CallMeBotNotifier } from "callmebot-notifier";

const client = new CallMeBotNotifier({
  phone: process.env.PHONE!,
  apikey: process.env.APIKEY!
});

await client.sendWhatsApp("Hello");
```

## CommonJS

```js
const { CallMeBotNotifier } = require("callmebot-notifier");

const client = new CallMeBotNotifier({
  phone: process.env.PHONE,
  apikey: process.env.APIKEY
});
```

## Express

```ts
import { CallMeBotNotifier, CallMeBotChannel, createExpressApp } from "callmebot-notifier";
import express from "express";

const client = new CallMeBotNotifier({ phone: process.env.PHONE!, apikey: process.env.APIKEY! });
const app = createExpressApp(new CallMeBotChannel(client));
app.listen(3000);
```

Endpoints:
- `GET /health`
- `POST /notify`
- `POST /webhook`

Quick test:

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Test notify"}'
```

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"title":"Alert","message":"CPU high","severity":"warn","source":"server-1"}'
```

```bash
curl http://localhost:3000/health
```

## Docker

```bash
docker build -t callmebot-notifier .
docker run --env-file .env -p 3000:3000 callmebot-notifier
docker compose up -d
```

## Webhook formatter

```ts
import { formatWebhookMessage } from "callmebot-notifier";

const msg = formatWebhookMessage({
  title: "Deploy",
  message: "ok",
  severity: "info",
  source: "github"
});
```

## Fallback chain

Order:
1. WhatsApp
2. Telegram
3. Email

## Telegram fallback

Need:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Email fallback

Need:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `EMAIL_TO`

## n8n

Use `HTTP Request` node:
- method `POST`
- URL `http://host:3000/notify`
- body JSON `{ "message": "..." }`

Webhook workflow:
- webhook node -> HTTP Request to `/webhook`

## Home Assistant

Use `rest_command` or automation to call `/notify`.

## Env

See `.env.example`

## Limits

- CallMeBot not official WhatsApp API
- retries and rate limit are simple
- use for low-risk notifications
