# callmebot-notifier

[![npm version](https://img.shields.io/npm/v/callmebot-notifier.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/callmebot-notifier)
[![npm downloads](https://img.shields.io/npm/dw/callmebot-notifier?style=for-the-badge)](https://www.npmjs.com/package/callmebot-notifier)
[![Marketplace](https://img.shields.io/badge/GitHub%20Marketplace-callmebot--notifier-blue?style=for-the-badge&logo=github)](https://github.com/marketplace/actions/callmebot-notifier)
[![language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Socket Badge](https://badge.socket.dev/npm/package/callmebot-notifier/1.6.2?style=for-the-badge)](https://socket.dev/npm/package/callmebot-notifier)
[![Known Vulnerabilities](https://snyk.io/test/npm/callmebot-notifier/badge.svg?style=for-the-badge)](https://snyk.io/test/npm/callmebot-notifier)
[![coverage](https://img.shields.io/badge/coverage-98.1%25-brightgreen?style=for-the-badge)](./coverage/index.html)

Multi-channel notification delivery for Node.js. Send alerts to WhatsApp, Telegram, Web Push, Discord, Slack, Teams, Google Chat and Email with retry, fallback and severity routing.

CallMeBot is not the official WhatsApp API. Use this package for personal and low-risk notifications.

## Subpath imports

Use HTTP-only entrypoints for Cloudflare Workers, edge runtimes, and serverless environments:

```ts
import { whatsapp } from "callmebot-notifier/whatsapp";
import { telegram } from "callmebot-notifier/telegram";
```

```ts
import { telegram } from "callmebot-notifier/telegram";

export default {
  async fetch(_request: Request, env: { TELEGRAM_BOT_TOKEN: string; TELEGRAM_CHAT_ID: string }) {
    const channel = telegram({
      botToken: env.TELEGRAM_BOT_TOKEN,
      chatId: env.TELEGRAM_CHAT_ID
    });
    await channel.send("Hello from Cloudflare Workers");
    return new Response("sent");
  }
};
```

Additional entrypoints are available from `callmebot-notifier/core`, `/email`, `/webpush`, and `/express`.
The `email`, `webpush`, and `express` entrypoints are Node-specific.
The root import remains fully supported for backward compatibility.

## Donation:

You can buy me a coffee or two if you find helpfull my node.

If you buy me a coffee I would like to thank you in advance for your donation.
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg?style=for-the-badge&logo=PayPal)](https://www.paypal.com/paypalme/f3rr1gn0)

## Supported Channels

- WhatsApp via CallMeBot
- Telegram
- Web Push
- Email
- Discord
- Slack
- Google Chat
- Microsoft Teams
- Signal (via `signal-cli-rest-api`)

## Features

| Feature                | Supported |
| ---------------------- | --------- |
| WhatsApp via CallMeBot | Yes       |
| Telegram               | Yes       |
| Web Push               | Yes       |
| Discord                | Yes       |
| Slack                  | Yes       |
| Google Chat            | Yes       |
| Microsoft Teams        | Yes       |
| Signal via signal-cli  | Yes       |
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

## CLI

Install globally, then use the short alias `cmb-notify` (canonical command: `callmebot-notifier`):

```bash
npm install -g callmebot-notifier
cmb-notify --help
cmb-notify "Hello"
callmebot-notifier "Hello"
```

The name `notify` is intentionally not installed because it conflicts with an existing Homebrew formula and executable.

Useful commands:

```bash
cmb-notify channels
cmb-notify test --channel telegram
cmb-notify --channel telegram --fallback whatsapp,email "Server down"
cmb-notify --json --channel telegram "Deploy completed"
cmb-notify config
cmb-notify config get channels.telegram.chatId
cmb-notify config unset channels.telegram.botToken
```

WhatsApp setup:

```bash
cmb-notify config set channels.whatsapp.phone "39333..."
cmb-notify config set channels.whatsapp.apikey "$APIKEY"
cmb-notify --channel whatsapp "Backup completed"
```

```bash
# Telegram
cmb-notify config set channels.telegram.botToken "$TOKEN"
cmb-notify config set channels.telegram.chatId "$CHAT_ID"
cmb-notify config default telegram
cmb-notify "Deploy completed"

# Other Unix-friendly forms
echo "Backup completed" | cmb-notify
mysqldump ... && cmb-notify "DB backup completed"
docker compose up -d && cmb-notify "Containers started"
curl -fsS https://example.com/health || cmb-notify --severity critical "API DOWN"
ssh my-server 'deploy.sh' && cmb-notify "Remote deploy completed"
```

Use `--channel`, `--fallback channel1,channel2`, `--title`, `--severity info|warn|error|critical`, `--retry-attempts`, `--retry-delay`, `--quiet`, or `--json`. Explicit channel flags override environment and config; environment variables override persistent config. With no selection, a persistent default is used, then a single configured channel; multiple configured channels require `config default`. Optional `routes` config maps severities to ordered channel names. Web Push remains library-only/advanced in the CLI.

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
SIGNAL_API_URL=http://localhost:8080
SIGNAL_NUMBER=+391234567890
SIGNAL_RECIPIENTS=+399876543210
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

## Web Push

Create VAPID keys once, keep private key server-side, and store each browser subscription in your application database. Then pass one subscription to `webpush()`:

```ts
import { webpush } from "callmebot-notifier";

const channel = webpush({
  subscription, // Browser PushSubscription serialized with JSON.stringify()
  vapidDetails: {
    subject: "mailto:alerts@example.com",
    publicKey: process.env.VAPID_PUBLIC_KEY ?? "",
    privateKey: process.env.VAPID_PRIVATE_KEY ?? ""
  },
  ttl: 60,
  urgency: "high"
});

await channel.send("Deployment complete");
```

See [Web Push setup](./docs/setup/web-push.md) for browser subscription and service-worker setup.

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
- [Web Push](./docs/setup/web-push.md)
- [Discord webhook](./docs/setup/discord-webhook.md)
- [Slack webhook](./docs/setup/slack-webhook.md)
- [Google Chat webhook](./docs/setup/google-chat-webhook.md)
- [Microsoft Teams webhook](./docs/setup/teams-webhook.md)
- [Signal](./docs/setup/signal.md)
- [Email with Gmail](./docs/setup/email-gmail.md)

## MCP Server Example

Expose `send_notification` to Claude Desktop, Cursor, or another MCP client:

- [MCP server example](./examples/mcp-server/README.md)

## Environment Variables

Common variables:

- `PHONE`
- `APIKEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `DISCORD_WEBHOOK_URL`
- `SLACK_WEBHOOK_URL`
- `GCHAT_WEBHOOK_URL`
- `TEAMS_WEBHOOK_URL`
- `SIGNAL_API_URL`
- `SIGNAL_NUMBER`
- `SIGNAL_RECIPIENTS`
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
- Web Push subscriptions belong to browsers; store them in your app and remove subscriptions that return `404` or `410`
- `fromEnv()` is the quickest way to bootstrap a notifier from environment variables
- Email examples assume Gmail app passwords
- [Coverage report](./coverage/index.html) is generated by `npm run test:coverage`

## Roadmap

- ntfy
- Pushover
- Mattermost
- Matrix

## License

MIT
