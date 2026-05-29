export type LoggerLevel = "silent" | "error" | "warn" | "info" | "debug";

export type LoggerLike = Pick<Console, "error" | "warn" | "info" | "debug">;

export type NotificationSeverity = "info" | "warn" | "error" | "critical";

export interface CallMeBotConfig {
  phone: string;
  apikey: string;
  baseUrl?: string;
  timeoutMs?: number;
  retries?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
  rateLimitPerMinute?: number;
  logger?: LoggerLike;
  logLevel?: LoggerLevel;
  fetch?: typeof fetch;
}

export interface SendOptions {
  timeoutMs?: number;
  retries?: number;
  baseUrl?: string;
  signal?: AbortSignal;
}

export interface NotificationResult {
  ok: boolean;
  channel: "whatsapp" | "telegram" | "email";
  message: string;
  error?: string;
}

export interface NotificationChannel {
  name: string;
  send(message: string): Promise<NotificationResult>;
}

export interface WebhookPayload {
  title?: string;
  message?: string;
  severity?: NotificationSeverity;
  source?: string;
  [key: string]: unknown;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  to: string;
}
