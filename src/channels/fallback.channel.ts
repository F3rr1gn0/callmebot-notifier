import type { NotificationChannel } from "../types.js";

export class FallbackChannel implements NotificationChannel {
  readonly name = "fallback";
  constructor(private readonly channels: NotificationChannel[]) {}
  async send(message: string): Promise<void> {
    for (const channel of this.channels) {
      try {
        await channel.send(message);
        return;
      } catch (error) {
        void error;
      }
    }
    throw new Error("all fallback channels failed");
  }
}
