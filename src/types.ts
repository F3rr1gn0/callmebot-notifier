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

export interface NotificationMessagePayload {
  title?: string;
  message?: string;
  severity?: NotificationSeverity;
  source?: string;
  [key: string]: unknown;
}

export interface NotificationChannel {
  name: string;
  send(message: string): Promise<void>;
}

export type NotifyAttempt = {
  channel: string;
  ok: boolean;
  attempt: number;
  error?: string;
};

export type NotifyResult = {
  ok: boolean;
  deliveredBy?: string;
  attempts: NotifyAttempt[];
};

export type MessageFormatter = (payload: NotificationMessagePayload) => string;

export type MessageInput = string | NotificationMessagePayload;

export type MessageFormatPreset = "markdown" | "plain" | "json";

export type RetryPolicy = {
  attempts: number;
  delayMs: number;
};

export type ReminderAfter = `${number}${"m" | "h" | "d"}` | string;

export type NotifyOptions = {
  primary?: NotificationChannel;
  fallback?: NotificationChannel;
  channels?: NotificationChannel[];
  message: MessageInput;
  routes?: Partial<Record<NotificationSeverity, NotificationChannel[]>>;
  retry?: RetryPolicy;
  reminderAfter?: ReminderAfter;
  formatter?: MessageFormatter;
  messageFormat?: MessageFormatPreset;
  logger?: LoggerLike;
  logLevel?: LoggerLevel;
  onResult?: (result: NotifyResult) => void | Promise<void>;
  onError?: (error: unknown, context: { channel: string; attempt: number; message: string }) => void | Promise<void>;
};

export type NotifyTemplateInput = {
  title: string;
  message: string;
  source?: string;
  severity?: NotificationSeverity;
};

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

export interface DiscordConfig {
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
  fetch?: typeof fetch;
}

export interface SlackConfig {
  webhookUrl: string;
  username?: string;
  iconEmoji?: string;
  fetch?: typeof fetch;
}
