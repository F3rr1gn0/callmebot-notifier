import type { GChatConfig, NotificationChannel } from "../types.js";
import { ValidationError } from "../errors.js";

export class GChatChannel implements NotificationChannel {
  readonly name = "gchat";
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: GChatConfig) {
    if (!config.webhookUrl?.trim()) throw new ValidationError("webhookUrl is required");
    this.fetchImpl = config.fetch ?? fetch;
  }

  async send(message: string): Promise<void> {
    const response = await this.fetchImpl(this.config.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: message })
    });
    if (!response.ok) throw new Error(await response.text());
  }
}
