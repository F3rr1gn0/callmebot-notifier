# CallMeBot WhatsApp Setup

## 1. Create account

-> Open `https://www.callmebot.com/`
-> Follow WhatsApp setup flow
-> Get `PHONE` and `APIKEY`

## 2. Add phone

-> Use phone number linked to WhatsApp
-> Save number in `.env`:

```env
PHONE=393331112223
APIKEY=your-callmebot-apikey
```

## 3. Send first message

```ts
import { CallMeBotNotifier } from "callmebot-notifier";

const client = new CallMeBotNotifier({
  phone: process.env.PHONE ?? "",
  apikey: process.env.APIKEY ?? ""
});

await client.sendWhatsApp("Hello");
```

## Notes

-> CallMeBot is not official WhatsApp API
-> Keep message short
-> Use for low-risk notifications
