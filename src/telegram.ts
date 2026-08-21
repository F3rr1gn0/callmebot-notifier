export { TelegramChannel } from "./channels/telegram.channel.js";
export type { NotificationChannel, TelegramConfig } from "./types.js";

import { TelegramChannel } from "./channels/telegram.channel.js";
import type { NotificationChannel, TelegramConfig } from "./types.js";

export const telegram = (config: TelegramConfig): NotificationChannel => new TelegramChannel(config);
