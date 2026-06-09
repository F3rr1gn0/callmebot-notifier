import type { NotificationChannel, TeamsConfig } from "../types.js";
import { ValidationError } from "../errors.js";

export class TeamsChannel implements NotificationChannel {
  readonly name = "teams";
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: TeamsConfig) {
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
