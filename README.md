# callmebot-notifier

[![npm version](https://img.shields.io/npm/v/callmebot-notifier.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/callmebot-notifier)
[![npm downloads](https://img.shields.io/npm/dw/callmebot-notifier?style=for-the-badge)](https://www.npmjs.com/package/callmebot-notifier)
[![Marketplace](https://img.shields.io/badge/GitHub%20Marketplace-callmebot--notifier-blue?style=for-the-badge&logo=github)](https://github.com/marketplace/actions/callmebot-notifier)
[![language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Socket Badge](https://badge.socket.dev/npm/package/callmebot-notifier/1.6.2?style=for-the-badge)](https://socket.dev/npm/package/callmebot-notifier)
[![Known Vulnerabilities](https://snyk.io/test/npm/callmebot-notifier/badge.svg?style=for-the-badge)](https://snyk.io/test/npm/callmebot-notifier)
[![coverage](https://img.shields.io/badge/coverage-99.78%25-brightgreen?style=for-the-badge)](./coverage/index.html)

Multi-channel notification delivery for Node.js. Send alerts to WhatsApp, Telegram, Discord, Slack, Teams, Google Chat and Email with retry, fallback and severity routing.

CallMeBot is not the official WhatsApp API. Use this package for personal and low-risk notifications.

## Supported Channels

- WhatsApp via CallMeBot
- Telegram
- Email
- Discord
- Slack
- Google Chat
- Microsoft Teams

## Features

| Feature                | Supported |
| ---------------------- | --------- |
| WhatsApp via CallMeBot | Yes       |
| Telegram               | Yes       |
| Discord                | Yes       |
| Slack                  | Yes       |
| Google Chat            | Yes       |
| Microsoft Teams        | Yes       |
| Email                  | Yes       |
| Retry                  | Yes       |
| Fallback               | Yes       |
| Severity routing       | Yes       |
| Templates              | Yes       |
| Express API            | Yes       |
| GitHub Action          | Yes       |

## Install

```bash
npm install callmebot-notifier
```

## Quick Start

```env
PHONE=393331112223
APIKEY=your-callmebot-apikey
TELEGRAM_BOT_TOKEN=1234567980:XXXX5x0XX2XxxXxx1XXXxxXxXXxXX6X-Tho
TELEGRAM_CHAT_ID=990099009
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
GCHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/.../messages?key=...&token=...
TEAMS_WEBHOOK_URL=https://...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tuoindirizzo@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=tuoindirizzo@gmail.com
EMAIL_TO=destinatario@dominio.com
```

```ts
import { fromEnv } from "callmebot-notifier";

const notifier = fromEnv();
await notifier.send("Deployment done");
```

## Basic `notify()`

```ts
import { notify, whatsapp, telegram } from "callmebot-notifier";

await notify({
  channels: [
    whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" }),
    telegram({
      botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
      chatId: process.env.TELEGRAM_CHAT_ID ?? ""
    })
  ],
  message: "Server is down"
});
```

## Fallback Example

```ts
import { notify, whatsapp, telegram } from "callmebot-notifier";

await notify({
  primary: whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" }),
  fallback: telegram({
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
    chatId: process.env.TELEGRAM_CHAT_ID ?? ""
  }),
  message: "Server is down"
});
```

## Severity Routing

```ts
import { notify, whatsapp, telegram, email, gchat, teams } from "callmebot-notifier";

await notify({
  routes: {
    info: [
      telegram({
        botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
        chatId: process.env.TELEGRAM_CHAT_ID ?? ""
      })
    ],
    warn: [gchat({ webhookUrl: process.env.GCHAT_WEBHOOK_URL ?? "" })],
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
    channels: [whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" })]
  }
);

await notify.incident(
  {
    title: "Database down",
    message: "Primary DB unavailable",
    source: "api"
  },
  {
    channels: [whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" })]
  }
);
```

## Retry Policy

```ts
import { notify, whatsapp, telegram, email } from "callmebot-notifier";

await notify({
  channels: [
    whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" }),
    telegram({
      botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
      chatId: process.env.TELEGRAM_CHAT_ID ?? ""
    }),
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

## Express Usage

```ts
import { createExpressApp, FallbackChannel, whatsapp, telegram } from "callmebot-notifier";

const app = createExpressApp(
  new FallbackChannel([
    whatsapp({ phone: process.env.PHONE ?? "", apikey: process.env.APIKEY ?? "" }),
    telegram({
      botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
      chatId: process.env.TELEGRAM_CHAT_ID ?? ""
    })
  ])
);

app.listen(3000);
```

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

## Setup Guides

- [CallMeBot WhatsApp](./docs/setup/callmebot-whatsapp.md)
- [Telegram bot and chat](./docs/setup/telegram-bot-chat.md)
- [Discord webhook](./docs/setup/discord-webhook.md)
- [Slack webhook](./docs/setup/slack-webhook.md)
- [Google Chat webhook](./docs/setup/google-chat-webhook.md)
- [Microsoft Teams webhook](./docs/setup/teams-webhook.md)
- [Email with Gmail](./docs/setup/email-gmail.md)

## Environment Variables

Common variables:

- `PHONE`
- `APIKEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `DISCORD_WEBHOOK_URL`
- `SLACK_WEBHOOK_URL`
- `GCHAT_WEBHOOK_URL`
- `TEAMS_WEBHOOK_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `EMAIL_TO`

## Result Shape

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

## Notes and Limitations

- CallMeBot is a third-party WhatsApp bridge, not the official WhatsApp API
- Intended for personal or low-risk alerts
- Discord and Slack use webhook URLs only
- `fromEnv()` is the quickest way to bootstrap a notifier from environment variables
- Email examples assume Gmail app passwords

## Roadmap

- Web Push
- Pushover
- Mattermost
- Matrix
- Signal

## License

MIT
