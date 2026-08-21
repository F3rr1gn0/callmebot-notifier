export { CallMeBotNotifier } from "./client.js";
export { CallMeBotChannel } from "./channels/callmebot.channel.js";
export type { CallMeBotConfig, NotificationChannel, SendOptions } from "./types.js";

import { CallMeBotNotifier } from "./client.js";
import { CallMeBotChannel } from "./channels/callmebot.channel.js";
import type { CallMeBotConfig, NotificationChannel } from "./types.js";

export const whatsapp = (config: CallMeBotConfig): NotificationChannel =>
  new CallMeBotChannel(new CallMeBotNotifier(config));
