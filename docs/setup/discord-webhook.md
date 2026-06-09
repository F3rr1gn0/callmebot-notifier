# Discord Webhook Setup

## 1. Create webhook

-> Open Discord server
-> Open channel settings
-> Go to `Integrations`
-> Open `Webhooks`
-> Create new webhook
-> Copy webhook URL

## 2. Add env

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## 3. Smoke test

```ts
import { discord } from "callmebot-notifier";

const channel = discord({
  webhookUrl: process.env.DISCORD_WEBHOOK_URL ?? ""
});

await channel.send("Hello");
```

## Notes

-> Webhook URL is secret
-> Message goes to target channel only
-> Good for quick ops alerts
