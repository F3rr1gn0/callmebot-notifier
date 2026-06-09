# Google Chat Webhook Setup

## 1. Open space

-> Open Google Chat
-> Open target space
-> Go to space menu
-> Find `Apps and integrations`

## 2. Create webhook

-> Manage webhooks
-> Create webhook
-> Copy webhook URL

## 3. Add env

```env
GCHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/.../messages?key=...&token=...
```

## 4. Smoke test

```ts
import { gchat } from "callmebot-notifier";

const channel = gchat({
  webhookUrl: process.env.GCHAT_WEBHOOK_URL ?? ""
});

await channel.send("Hello");
```

## Notes

-> URL is secret
-> Works per space, not per user
-> Use for low-friction team alerts
