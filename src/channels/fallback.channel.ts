import type { NotificationChannel, NotificationResult } from "../types.js";

export class FallbackChannel implements NotificationChannel {
  readonly name = "fallback";
  constructor(private readonly channels: NotificationChannel[]) {}
  async send(message: string): Promise<NotificationResult> {
    const errors: string[] = [];
    for (const channel of this.channels) {
      try {
        const result = await channel.send(message);
        if (result.ok) return result;
        errors.push(`${channel.name}: ${result.error ?? "failed"}`);
      } catch (error) {
        errors.push(`${channel.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return { ok: false, channel: "whatsapp", message, error: errors.join(" | ") };
  }
}
