import { CallMeBotNotifier } from "../client.js";
import { EmailChannel } from "./email.channel.js";
import { DiscordChannel } from "./discord.channel.js";
import { TelegramChannel } from "./telegram.channel.js";
import { SlackChannel } from "./slack.channel.js";
import { GChatChannel } from "./gchat.channel.js";
import { TeamsChannel } from "./teams.channel.js";
import { WebPushChannel } from "./web-push.channel.js";
import { CallMeBotChannel } from "./callmebot.channel.js";
import type {
  CallMeBotConfig,
  DiscordConfig,
  EmailConfig,
  GChatConfig,
  NotificationChannel,
  SlackConfig,
  TeamsConfig,
  TelegramConfig,
  WebPushConfig
} from "../types.js";

export const whatsapp = (config: CallMeBotConfig): NotificationChannel =>
  new CallMeBotChannel(new CallMeBotNotifier(config));

export const telegram = (config: TelegramConfig): NotificationChannel => new TelegramChannel(config);

export const email = (config: EmailConfig): NotificationChannel => new EmailChannel(config);

export const discord = (config: DiscordConfig): NotificationChannel => new DiscordChannel(config);

export const slack = (config: SlackConfig): NotificationChannel => new SlackChannel(config);

export const gchat = (config: GChatConfig): NotificationChannel => new GChatChannel(config);

export const teams = (config: TeamsConfig): NotificationChannel => new TeamsChannel(config);

export const webpush = (config: WebPushConfig): NotificationChannel => new WebPushChannel(config);
