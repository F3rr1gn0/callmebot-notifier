import { CallMeBotNotifier } from "../client.js";
import { EmailChannel } from "./email.channel.js";
import { TelegramChannel } from "./telegram.channel.js";
import { CallMeBotChannel } from "./callmebot.channel.js";
import type { CallMeBotConfig, EmailConfig, TelegramConfig, NotificationChannel } from "../types.js";

export const whatsapp = (config: CallMeBotConfig): NotificationChannel =>
  new CallMeBotChannel(new CallMeBotNotifier(config));

export const telegram = (config: TelegramConfig): NotificationChannel => new TelegramChannel(config);

export const email = (config: EmailConfig): NotificationChannel => new EmailChannel(config);
