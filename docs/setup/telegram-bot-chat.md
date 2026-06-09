# Telegram Bot + Chat Setup

## 1. Create bot

-> Open Telegram
-> Talk to `@BotFather`
-> Run `/newbot`
-> Copy bot token

## 2. Get chat id

-> Send message to bot
-> Open:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates
```

-> Read `message.chat.id`
-> Save in `.env`

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=207131316
```

## 3. Smoke test

```ts
import { telegram } from "callmebot-notifier";

const channel = telegram({
  botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  chatId: process.env.TELEGRAM_CHAT_ID ?? ""
});

await channel.send("Hello");
```

## Notes

-> Private chat id usually positive
-> Group chat id often negative
-> Bot must receive at least one update before `chat_id` appears
