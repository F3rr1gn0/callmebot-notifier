import type { NotificationChannel, TelegramConfig } from "../types.js";
import { ValidationError } from "../errors.js";

export class TelegramChannel implements NotificationChannel {
  readonly name = "telegram";
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: TelegramConfig) {
    if (!config.botToken?.trim()) throw new ValidationError("botToken is required");
    if (!config.chatId?.trim()) throw new ValidationError("chatId is required");
    this.baseUrl = config.baseUrl ?? "https://api.telegram.org";
    this.fetchImpl = config.fetch ?? fetch;
  }

  async send(message: string): Promise<void> {
    const url = new URL(`/bot${this.config.botToken}/sendMessage`, this.baseUrl);
    const response = await this.fetchImpl(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: this.config.chatId, text: message })
    });
    if (!response.ok) throw new Error(await response.text());
  }
}
