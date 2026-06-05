# callmebot-notifier

Send WhatsApp notifications from Node.js with Telegram and Email fallback.

Includes:

- WhatsApp via CallMeBot
- `notify()` routing
- Telegram fallback
- Email fallback
- Express integration
- Webhook formatter
- ESM + CommonJS
- TypeScript types

> CallMeBot is not the official WhatsApp API. Use this package for personal and low-risk notifications.

## Install

```bash
npm install callmebot-notifier
```

## Simple WhatsApp

```ts
import { CallMeBotNotifier } from "callmebot-notifier";

const notifier = new CallMeBotNotifier({
  phone: process.env.PHONE!,
  apikey: process.env.APIKEY!
});

await notifier.sendWhatsApp("Deployment done");
```

## `notify()` with fallback

```ts
import { notify, whatsapp, telegram } from "callmebot-notifier";

await notify({
  primary: whatsapp({
    phone: process.env.PHONE!,
    apikey: process.env.APIKEY!
  }),
  fallback: telegram({
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    chatId: process.env.TELEGRAM_CHAT_ID!
  }),
  message: "Server is down"
});
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
    whatsapp({ phone: process.env.PHONE!, apikey: process.env.APIKEY! }),
    telegram({ botToken: process.env.TELEGRAM_BOT_TOKEN!, chatId: process.env.TELEGRAM_CHAT_ID! }),
    email({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
      from: process.env.EMAIL_FROM!,
      to: process.env.EMAIL_TO!
    })
  ],
  message: "Build failed",
  retry: { attempts: 3, delayMs: 1000 }
});
```

## Express usage

```ts
import { createExpressApp, FallbackChannel, whatsapp, telegram } from "callmebot-notifier";

const app = createExpressApp(
  new FallbackChannel([
    whatsapp({ phone: process.env.PHONE!, apikey: process.env.APIKEY! }),
    telegram({ botToken: process.env.TELEGRAM_BOT_TOKEN!, chatId: process.env.TELEGRAM_CHAT_ID! })
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

## v1.3 prep

`reminderAfter` is accepted in types now.

Planned only:

- reminder scheduling
- delivery tracking
- persistence

## Limitations

- No dashboard
- No authentication layer
- No database
- No SaaS backend
- CallMeBot depends on a third-party service
- Intended for personal or low-risk alerts
