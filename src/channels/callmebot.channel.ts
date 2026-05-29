import { CallMeBotNotifier } from "../client.js";
import type { NotificationChannel, NotificationResult } from "../types.js";

export class CallMeBotChannel implements NotificationChannel {
  readonly name = "whatsapp";
  constructor(private readonly client: CallMeBotNotifier) {}
  async send(message: string): Promise<NotificationResult> {
    const result = await this.client.sendWhatsApp(message);
    return { ok: true, channel: "whatsapp", message: result.message };
  }
}
