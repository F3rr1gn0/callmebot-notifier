export { EmailChannel } from "./channels/email.channel.js";
export type { EmailConfig, NotificationChannel } from "./types.js";

import { EmailChannel } from "./channels/email.channel.js";
import type { EmailConfig, NotificationChannel } from "./types.js";

export const email = (config: EmailConfig): NotificationChannel => new EmailChannel(config);
