export { WebPushChannel } from "./channels/web-push.channel.js";
export type { NotificationChannel, WebPushConfig, WebPushSubscription, WebPushVapidDetails } from "./types.js";

import { WebPushChannel } from "./channels/web-push.channel.js";
import type { NotificationChannel, WebPushConfig } from "./types.js";

export const webpush = (config: WebPushConfig): NotificationChannel => new WebPushChannel(config);
