import { CallMeBotNotifier } from "../client.js";
import type { NotificationChannel } from "../types.js";

export class CallMeBotChannel implements NotificationChannel {
  readonly name = "whatsapp";
  constructor(private readonly client: CallMeBotNotifier) {}
  async send(message: string): Promise<void> {
    await this.client.sendWhatsApp(message);
  }
}
