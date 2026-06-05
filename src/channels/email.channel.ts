import nodemailer from "nodemailer";
import type { EmailConfig, NotificationChannel } from "../types.js";
import { ValidationError } from "../errors.js";

export class EmailChannel implements NotificationChannel {
  readonly name = "email";
  private readonly transport;

  constructor(private readonly config: EmailConfig) {
    if (!config.host?.trim()) throw new ValidationError("host is required");
    if (!config.from?.trim()) throw new ValidationError("from is required");
    if (!config.to?.trim()) throw new ValidationError("to is required");
    this.transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user ? { user: config.user, pass: config.pass ?? "" } : undefined
    });
  }

  async send(message: string): Promise<void> {
    await this.transport.sendMail({
      from: this.config.from,
      to: this.config.to,
      subject: "CallMeBot notifier",
      text: message
    });
  }
}
