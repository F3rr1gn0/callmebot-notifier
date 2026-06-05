import type { NotificationChannel, SlackConfig } from "../types.js";
import { ValidationError } from "../errors.js";

export class SlackChannel implements NotificationChannel {
  readonly name = "slack";
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: SlackConfig) {
    if (!config.webhookUrl?.trim()) throw new ValidationError("webhookUrl is required");
    this.fetchImpl = config.fetch ?? fetch;
  }

  async send(message: string): Promise<void> {
    const response = await this.fetchImpl(this.config.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: message,
        username: this.config.username,
        icon_emoji: this.config.iconEmoji
      })
    });
    if (!response.ok) throw new Error(await response.text());
  }
}
