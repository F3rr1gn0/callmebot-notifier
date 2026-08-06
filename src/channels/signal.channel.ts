import type { NotificationChannel, SignalConfig } from "../types.js";
import { ValidationError } from "../errors.js";

export class SignalChannel implements NotificationChannel {
  readonly name = "signal";
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: SignalConfig) {
    if (!config.number?.trim()) throw new ValidationError("number is required");
    if (!config.recipients?.length || config.recipients.some((recipient) => !recipient.trim())) {
      throw new ValidationError("at least one recipient is required");
    }
    this.baseUrl = config.baseUrl ?? "http://localhost:8080";
    this.fetchImpl = config.fetch ?? fetch;
  }

  async send(message: string): Promise<void> {
    if (!message?.trim()) throw new ValidationError("message is required");
    const url = new URL("/v2/send", this.baseUrl);
    const response = await this.fetchImpl(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message,
        number: this.config.number,
        recipients: [...this.config.recipients]
      })
    });
    if (!response.ok) throw new Error(await response.text());
  }
}
