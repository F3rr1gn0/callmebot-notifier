# callmebot-notifier

[![npm version](https://img.shields.io/npm/v/callmebot-notifier.svg)](https://www.npmjs.com/package/callmebot-notifier)
[![coverage](https://img.shields.io/badge/coverage-99.72%25-brightgreen)](./coverage/index.html)
[![language](https://img.shields.io/badge/language-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)

Send notifications from Node.js with one API and multiple delivery paths.

Includes:

- WhatsApp via CallMeBot
- Telegram, Email, Discord, Slack
- `notify()` routing and fallback
- `notify.alert()` and `notify.incident()`
- `onResult` and `onError` hooks
- structured logs
- formatter presets
- webhook formatting
- Express integration
- ESM + CommonJS
- TypeScript types

> CallMeBot is not the official WhatsApp API. Use this package for personal and low-risk notifications.

## Install

```bash
npm install callmebot-notifier
```

## Quick Start

```env
PHONE=393331112223
APIKEY=your-callmebot-apikey
PORT=3000
LOG_LEVEL=info
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
DISCORD_WEBHOOK_URL=
SLACK_WEBHOOK_URL=
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
EMAIL_TO=
```

```ts
import { fromEnv } from "callmebot-notifier";

const notifier = fromEnv();
await notifier.send("Deployment done");
```

## Usage

```ts
import { notify, whatsapp, telegram } from "callmebot-notifier";

await notify({
  primary: whatsapp({
    phone: process.env.PHONE ?? "",
    apikey: process.env.APIKEY ?? ""
  }),
  fallback: telegram({
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
    chatId: process.env.TELEGRAM_CHAT_ID ?? ""
  }),
  message: "Server is down"
});
```

```ts
import { discord, slack, notify } from "callmebot-notifier";

await notify({
  channels: [
    discord({ webhookUrl: process.env.DISCORD_WEBHOOK_URL ?? "" }),
    slack({ webhookUrl: process.env.SLACK_WEBHOOK_URL ?? "" })
  ],
  message: "Release done"
});
```

## Severity Routing

```ts
import { notify, whatsapp, telegram, email } from "callmebot-notifier";

await notify({
  routes: {
    info: [telegram({ botToken: process.env.TELEGRAM_BOT_TOKEN ?? "", chatId: process.env.TELEGRAM_CHAT_ID ?? "" })],
    critical: [
      whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" }),
      email({
        host: process.env.SMTP_HOST ?? "",
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        user: process.env.SMTP_USER ?? undefined,
        pass: process.env.SMTP_PASS ?? undefined,
        from: process.env.EMAIL_FROM ?? "",
        to: process.env.EMAIL_TO ?? ""
      })
    ]
  },
  message: {
    title: "CPU high",
    message: "Load spike on api-1",
    severity: "critical"
  }
});
```

## Templates

```ts
import { notify, whatsapp } from "callmebot-notifier";

await notify.alert(
  {
    title: "Deploy",
    message: "Application deployed",
    source: "GitHub Actions"
  },
  {
    channels: [
      whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" })
    ]
  }
);

await notify.incident(
  {
    title: "Database down",
    message: "Primary DB unavailable",
    source: "api"
  },
  {
    channels: [
      whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" })
    ]
  }
);
```

## CommonJS

```js
const { notify, whatsapp, telegram } = require("callmebot-notifier");

await notify({
  primary: whatsapp({
    phone: process.env.PHONE,
    apikey: process.env.APIKEY
  }),
  fallback: telegram({
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID
  }),
  message: "Server is down"
});
```

## Retry policy

```ts
import { notify, whatsapp, telegram, email } from "callmebot-notifier";

await notify({
  channels: [
    whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" }),
    telegram({ botToken: process.env.TELEGRAM_BOT_TOKEN ?? "", chatId: process.env.TELEGRAM_CHAT_ID ?? "" }),
    email({
      host: process.env.SMTP_HOST ?? "",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER ?? undefined,
      pass: process.env.SMTP_PASS ?? undefined,
      from: process.env.EMAIL_FROM ?? "",
      to: process.env.EMAIL_TO ?? ""
    })
  ],
  message: "Build failed",
  retry: { attempts: 3, delayMs: 1000 }
});
```

## Formatter

```ts
import { formatMessage, notify, whatsapp } from "callmebot-notifier";

const message = formatMessage({
  title: "Deploy",
  severity: "info",
  source: "GitHub Actions",
  message: "Application deployed"
});
await notify({
  channels: [whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" })],
  message: {
    title: "Deploy",
    severity: "info",
    source: "GitHub Actions",
    message: "Application deployed"
  }
});
```

## Express usage

```ts
import { createExpressApp, FallbackChannel, whatsapp, telegram } from "callmebot-notifier";

const app = createExpressApp(
  new FallbackChannel([
    whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" }),
    telegram({ botToken: process.env.TELEGRAM_BOT_TOKEN ?? "", chatId: process.env.TELEGRAM_CHAT_ID ?? "" })
  ])
);

app.listen(3000);
```

## Result shape

`notify()` returns:

```ts
type NotifyResult = {
  ok: boolean;
  deliveredBy?: string;
  attempts: Array<{
    channel: string;
    ok: boolean;
    attempt: number;
    error?: string;
  }>;
};
```

Helper:

```ts
import { summarizeNotifyResult } from "callmebot-notifier";

const summary = summarizeNotifyResult(result);
```

## Notes

- CallMeBot is a third-party WhatsApp bridge, not the official WhatsApp API
- Intended for personal or low-risk alerts
- Discord and Slack use webhook URLs only
- `fromEnv()` is the quickest way to bootstrap a notifier from environment variables

## Hooks

```ts
import { notify, whatsapp } from "callmebot-notifier";

const channel = whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" });

await notify({
  channels: [channel],
  message: "Release done",
  logLevel: "info",
  onResult: (result) => {
    console.log("notify.result", result);
  },
  onError: (error, context) => {
    console.error("notify.error", { error, ...context });
  }
});
```
