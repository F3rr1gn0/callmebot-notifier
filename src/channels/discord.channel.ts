import type { DiscordConfig, NotificationChannel } from "../types.js";
import { ValidationError } from "../errors.js";

export class DiscordChannel implements NotificationChannel {
  readonly name = "discord";
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: DiscordConfig) {
    if (!config.webhookUrl?.trim()) throw new ValidationError("webhookUrl is required");
    this.fetchImpl = config.fetch ?? fetch;
  }

  async send(message: string): Promise<void> {
    const response = await this.fetchImpl(this.config.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        content: message,
        username: this.config.username,
        avatar_url: this.config.avatarUrl
      })
    });
    if (!response.ok) throw new Error(await response.text());
  }
}
