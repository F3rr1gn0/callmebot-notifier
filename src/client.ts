import { createLogger } from "./logger.js";
import { HttpError, RetryExhaustedError, ValidationError } from "./errors.js";
import { withRetry } from "./retry.js";
import type { CallMeBotConfig, SendOptions } from "./types.js";

export class CallMeBotNotifier {
  private readonly phone: string;
  private readonly apikey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly minDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly rateLimitPerMinute: number;
  private readonly fetchImpl: typeof fetch;
  private readonly log;
  private lastSentAt = 0;

  constructor(config: CallMeBotConfig) {
    if (!config?.phone?.trim()) throw new ValidationError("phone is required");
    if (!config?.apikey?.trim()) throw new ValidationError("apikey is required");
    this.phone = config.phone.trim();
    this.apikey = config.apikey.trim();
    this.baseUrl = config.baseUrl ?? "https://api.callmebot.com";
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.retries = config.retries ?? 2;
    this.minDelayMs = config.minDelayMs ?? 250;
    this.maxDelayMs = config.maxDelayMs ?? 2000;
    this.rateLimitPerMinute = config.rateLimitPerMinute ?? 30;
    this.fetchImpl = config.fetch ?? fetch;
    this.log = createLogger(config.logger ?? console, config.logLevel ?? "silent");
  }

  private async rateLimit() {
    if (this.rateLimitPerMinute <= 0) return;
    const minGap = 60000 / this.rateLimitPerMinute;
    const now = Date.now();
    const wait = Math.max(0, this.lastSentAt + minGap - now);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastSentAt = Date.now();
  }

  async sendWhatsApp(message: string, options: SendOptions = {}) {
    if (!message?.trim()) throw new ValidationError("message is required");
    const baseUrl = options.baseUrl ?? this.baseUrl;
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;
    const retries = options.retries ?? this.retries;
    const url = new URL("/whatsapp.php", baseUrl);
    url.searchParams.set("phone", this.phone);
    url.searchParams.set("text", message);
    url.searchParams.set("apikey", this.apikey);

    await this.rateLimit();

    try {
      const text = await withRetry(async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const signal = options.signal ?? controller.signal;
        try {
          const response = await this.fetchImpl(url.toString(), { method: "GET", signal });
          const body = await response.text();
          if (!response.ok) throw new HttpError(`CallMeBot failed: ${response.status}`, response.status, body);
          return body;
        } finally {
          clearTimeout(timer);
        }
      }, retries, this.minDelayMs, this.maxDelayMs);
      this.log.debug("whatsapp sent");
      return { ok: true, channel: "whatsapp" as const, message: text };
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new RetryExhaustedError("WhatsApp send failed after retries", error);
    }
  }
}
