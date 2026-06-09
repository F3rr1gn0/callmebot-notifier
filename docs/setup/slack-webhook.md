# Slack Webhook Setup

## 1. Open Slack app page

-> Go to `https://slack.com/apps`
-> Search `Incoming Webhooks`
-> Open app

## 2. Create webhook

-> Click `Add to Slack`
-> Pick target channel
-> Copy webhook URL

## 3. Add env

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## 4. Smoke test

```ts
import { slack } from "callmebot-notifier";

const channel = slack({
  webhookUrl: process.env.SLACK_WEBHOOK_URL ?? ""
});

await channel.send("Hello");
```

## Notes

-> Webhook URL is secret
-> Workspace may block external app install
-> Admin permission may be required
