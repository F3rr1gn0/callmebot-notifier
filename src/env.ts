import { CallMeBotNotifier } from "./client.js";
import { ValidationError } from "./errors.js";
import { CallMeBotChannel } from "./channels/callmebot.channel.js";
import { TelegramChannel } from "./channels/telegram.channel.js";
import { EmailChannel } from "./channels/email.channel.js";
import { DiscordChannel } from "./channels/discord.channel.js";
import { SlackChannel } from "./channels/slack.channel.js";
import { GChatChannel } from "./channels/gchat.channel.js";
import { TeamsChannel } from "./channels/teams.channel.js";
import { FallbackChannel } from "./channels/fallback.channel.js";
import { SignalChannel } from "./channels/signal.channel.js";
import type { EmailConfig, GChatConfig, NotificationChannel, TeamsConfig, TelegramConfig } from "./types.js";

const missing = (name: string) => new ValidationError(`Missing env ${name}`);

const maybe = (value?: string) => value?.trim();

export type FromEnvOptions = {
  env?: NodeJS.ProcessEnv;
  logLevel?: "silent" | "error" | "warn" | "info" | "debug";
};

export function fromEnv(options: FromEnvOptions = {}) {
  const env = options.env ?? process.env;
  const channels: NotificationChannel[] = [];

  const phone = maybe(env.PHONE);
  const apikey = maybe(env.APIKEY);
  if (phone || apikey) {
    if (!phone) throw missing("PHONE");
    if (!apikey) throw missing("APIKEY");
    const client = new CallMeBotNotifier({
      phone,
      apikey,
      logLevel: options.logLevel ?? "silent"
    });
    channels.push(new CallMeBotChannel(client));
  }

  const telegramBotToken = maybe(env.TELEGRAM_BOT_TOKEN);
  const telegramChatId = maybe(env.TELEGRAM_CHAT_ID);
  if (telegramBotToken || telegramChatId) {
    if (!telegramBotToken) throw missing("TELEGRAM_BOT_TOKEN");
    if (!telegramChatId) throw missing("TELEGRAM_CHAT_ID");
    const config: TelegramConfig = { botToken: telegramBotToken, chatId: telegramChatId };
    channels.push(new TelegramChannel(config));
  }

  const smtpHost = maybe(env.SMTP_HOST);
  const emailFrom = maybe(env.EMAIL_FROM);
  const emailTo = maybe(env.EMAIL_TO);
  if (smtpHost || emailFrom || emailTo) {
    if (!smtpHost) throw missing("SMTP_HOST");
    if (!emailFrom) throw missing("EMAIL_FROM");
    if (!emailTo) throw missing("EMAIL_TO");
    const config: EmailConfig = {
      host: smtpHost,
      port: Number(env.SMTP_PORT ?? 587),
      secure: env.SMTP_SECURE === "true",
      user: maybe(env.SMTP_USER),
      pass: maybe(env.SMTP_PASS),
      from: emailFrom,
      to: emailTo
    };
    channels.push(new EmailChannel(config));
  }

  const discordWebhookUrl = maybe(env.DISCORD_WEBHOOK_URL);
  if (discordWebhookUrl) channels.push(new DiscordChannel({ webhookUrl: discordWebhookUrl }));

  const slackWebhookUrl = maybe(env.SLACK_WEBHOOK_URL);
  if (slackWebhookUrl) channels.push(new SlackChannel({ webhookUrl: slackWebhookUrl }));

  const gchatWebhookUrl = maybe(env.GCHAT_WEBHOOK_URL ?? env.GOOGLE_CHAT_WEBHOOK_URL);
  if (gchatWebhookUrl) {
    const config: GChatConfig = { webhookUrl: gchatWebhookUrl };
    channels.push(new GChatChannel(config));
  }

  const teamsWebhookUrl = maybe(env.TEAMS_WEBHOOK_URL ?? env.MS_TEAMS_WEBHOOK_URL);
  if (teamsWebhookUrl) {
    const config: TeamsConfig = { webhookUrl: teamsWebhookUrl };
    channels.push(new TeamsChannel(config));
  }

  const signalNumber = maybe(env.SIGNAL_NUMBER);
  const signalRecipients = maybe(env.SIGNAL_RECIPIENTS);
  if (signalNumber || signalRecipients) {
    if (!signalNumber) throw missing("SIGNAL_NUMBER");
    if (!signalRecipients) throw missing("SIGNAL_RECIPIENTS");
    const recipients = signalRecipients.split(",").map((recipient) => recipient.trim()).filter(Boolean);
    if (!recipients.length) throw missing("SIGNAL_RECIPIENTS");
    channels.push(new SignalChannel({
      number: signalNumber,
      recipients,
      baseUrl: maybe(env.SIGNAL_API_URL)
    }));
  }

  if (!channels.length) {
    throw new ValidationError(
      "No channels configured. Set PHONE/APIKEY, TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID, SMTP_*, DISCORD_WEBHOOK_URL, SLACK_WEBHOOK_URL, GCHAT_WEBHOOK_URL, TEAMS_WEBHOOK_URL, or SIGNAL_NUMBER/SIGNAL_RECIPIENTS."
    );
  }

  return new FallbackChannel(channels);
}
