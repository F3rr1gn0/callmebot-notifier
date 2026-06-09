# callmebot-notifier

[![npm version](https://img.shields.io/npm/v/callmebot-notifier.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/callmebot-notifier)
[![coverage](https://img.shields.io/badge/coverage-99.78%25-brightgreen?style=for-the-badge)](./coverage/index.html)
[![language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Marketplace](https://img.shields.io/badge/GitHub%20Marketplace-callmebot--notifier-blue?style=for-the-badge&logo=github)](https://github.com/marketplace/actions/callmebot-notifier)

Send notifications from Node.js with one API and multiple delivery paths.

Includes:

- WhatsApp via CallMeBot
- Telegram, Email, Discord, Slack, Google Chat, Microsoft Teams
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
# WA
PHONE=393331112223
APIKEY=your-callmebot-apikey

# TELEGRAM
TELEGRAM_BOT_TOKEN=1234567980:XXXX5x0XX2XxxXxx1XXXxxXxXXxXX6X-Tho
TELEGRAM_CHAT_ID=990099009

# DISCORD
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# SLACK
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# GOOGLE CHAT
GCHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/.../messages?key=...&token=...
# OR
# GOOGLE_CHAT_WEBHOOK_URL

# TEAMS
TEAMS_WEBHOOK_URL=https://...

# EMAIL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tuoindirizzo@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=tuoindirizzo@gmail.com
EMAIL_TO=destinatario@dominio.com

PORT=3000
LOG_LEVEL=info
```

```ts
import { fromEnv } from "callmebot-notifier";

const notifier = fromEnv();
await notifier.send("Deployment done");
```

## Setup Guides

- [CallMeBot WhatsApp](/Users/f3rr1gn0/Documents/myprj/callmebot-notifier/docs/setup/callmebot-whatsapp.md)
- [Telegram bot and chat](/Users/f3rr1gn0/Documents/myprj/callmebot-notifier/docs/setup/telegram-bot-chat.md)
- [Discord webhook](/Users/f3rr1gn0/Documents/myprj/callmebot-notifier/docs/setup/discord-webhook.md)
- [Slack webhook](/Users/f3rr1gn0/Documents/myprj/callmebot-notifier/docs/setup/slack-webhook.md)
- [Google Chat webhook](/Users/f3rr1gn0/Documents/myprj/callmebot-notifier/docs/setup/google-chat-webhook.md)
- [Microsoft Teams webhook](/Users/f3rr1gn0/Documents/myprj/callmebot-notifier/docs/setup/teams-webhook.md)
- [Email with Gmail](/Users/f3rr1gn0/Documents/myprj/callmebot-notifier/docs/setup/email-gmail.md)

## GitHub Action

Use published action:

```yaml
- uses: F3rr1gn0/callmebot-notifier-action@v1
  with:
    message: "Build done"
    channel: "telegram"
  env:
    TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
```

Secrets to set in consumer repo:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
PHONE
APIKEY
DISCORD_WEBHOOK_URL
SLACK_WEBHOOK_URL
GCHAT_WEBHOOK_URL
TEAMS_WEBHOOK_URL
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
EMAIL_FROM
EMAIL_TO
```

Smoke flow:

```yaml
name: smoke-action

on:
  workflow_dispatch:

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: F3rr1gn0/callmebot-notifier-action@v1
        with:
          message: "Smoke from GitHub Action"
          channel: "telegram"
        env:
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
```

Failure flow:

```yaml
name: smoke-action-failure

on:
  workflow_dispatch:

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - run: exit 1
      - if: ${{ failure() }}
        uses: F3rr1gn0/callmebot-notifier-action@v1
        with:
          message: "Build failed"
          channel: "telegram"
        env:
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
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

```ts
import { gchat, teams, notify } from "callmebot-notifier";

await notify({
  channels: [
    gchat({ webhookUrl: process.env.GCHAT_WEBHOOK_URL ?? "" }),
    teams({ webhookUrl: process.env.TEAMS_WEBHOOK_URL ?? "" })
  ],
  message: "Build done"
});
```

## Severity Routing

```ts
import { notify, whatsapp, telegram, email, gchat, teams } from "callmebot-notifier";

await notify({
  routes: {
    info: [telegram({ botToken: process.env.TELEGRAM_BOT_TOKEN ?? "", chatId: process.env.TELEGRAM_CHAT_ID ?? "" })],
    warn: [
      gchat({ webhookUrl: process.env.GCHAT_WEBHOOK_URL ?? "" })
    ],
    critical: [
      whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" }),
      teams({ webhookUrl: process.env.TEAMS_WEBHOOK_URL ?? "" }),
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

## Future Integrations

- Web Push
- Pushover
- Mattermost
- Matrix
- SMS
- Signal
- Github Actions

## Future MCP

- MCP server for `notify`, `alert`, and `incident`
- `testConnection` tool
- `listChannels` tool
