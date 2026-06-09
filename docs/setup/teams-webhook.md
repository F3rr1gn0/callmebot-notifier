# Microsoft Teams Webhook Setup

## 1. Check access

-> Teams web can hide `Apps` / `Workflows`
-> personal account may not expose webhook flow
-> tenant policy can block it too

## 2. Try Workflow path

-> open `Workflows`
-> create flow from scratch
-> use trigger `When a Teams webhook request is received`
-> save flow
-> copy webhook URL

## 3. Add env

```env
TEAMS_WEBHOOK_URL=https://...
```

## 4. Smoke test

```ts
import { teams } from "callmebot-notifier";

const channel = teams({
  webhookUrl: process.env.TEAMS_WEBHOOK_URL ?? ""
});

await channel.send("Hello");
```

## Notes

-> if `Workflows` absent, webhook may be unavailable in tenant
-> `Incoming Webhook` path can be hidden or deprecated
-> use for channel alerts, not personal chat
