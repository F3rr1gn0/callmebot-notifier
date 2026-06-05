import { CallMeBotNotifier } from "./client.js";
import { CallMeBotChannel } from "./channels/callmebot.channel.js";
import { TelegramChannel } from "./channels/telegram.channel.js";
import { EmailChannel } from "./channels/email.channel.js";
import { DiscordChannel } from "./channels/discord.channel.js";
import { SlackChannel } from "./channels/slack.channel.js";
import { FallbackChannel } from "./channels/fallback.channel.js";
import { createExpressApp } from "./integrations/express.js";
import type { NotificationChannel } from "./types.js";

const phone = process.env.PHONE ?? "";
const apikey = process.env.APIKEY ?? "";
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
const telegramChatId = process.env.TELEGRAM_CHAT_ID ?? "";
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL ?? "";
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL ?? "";

const channels: NotificationChannel[] = [];
if (phone && apikey) {
  channels.push(new CallMeBotChannel(new CallMeBotNotifier({ phone, apikey, logLevel: "info" })));
} else {
  console.warn("PHONE/APIKEY missing: WhatsApp channel disabled");
}
if (telegramBotToken && telegramChatId) channels.push(new TelegramChannel({ botToken: telegramBotToken, chatId: telegramChatId }));
if (process.env.SMTP_HOST && process.env.EMAIL_FROM && process.env.EMAIL_TO) {
  channels.push(
    new EmailChannel({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER || undefined,
      pass: process.env.SMTP_PASS || undefined,
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO
    })
  );
}
if (discordWebhookUrl) channels.push(new DiscordChannel({ webhookUrl: discordWebhookUrl }));
if (slackWebhookUrl) channels.push(new SlackChannel({ webhookUrl: slackWebhookUrl }));

const app = createExpressApp(new FallbackChannel(channels));
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`callmebot-notifier listening on ${port}`);
});
