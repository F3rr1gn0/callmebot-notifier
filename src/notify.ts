import type { NotifyOptions, NotifyResult, NotificationChannel, NotificationSeverity, NotifyTemplateInput } from "./types.js";
import { ValidationError } from "./errors.js";
import { sleep } from "./retry.js";
import { resolveMessage } from "./format.js";
import { createLogger } from "./logger.js";

const redactError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/([?&](?:apikey|token|pass|password|secret|key))=[^&\s]+/gi, "$1=[redacted]")
    .replace(/\b(?:apikey|token|pass|password|secret|key)\s*[:=]\s*[^\s,;]+/gi, (match) => {
      const [label] = match.split(/[:=]/, 1);
      return `${label}=[redacted]`;
    })
    .replace(/\b[A-Za-z0-9_\-]{24,}\b/g, "[redacted]");
};

const redactMessage = (message: string) =>
  message
    .replace(/([?&](?:apikey|token|pass|password|secret|key))=[^&\s]+/gi, "$1=[redacted]")
    .replace(/\b(?:apikey|token|pass|password|secret|key)\s*[:=]\s*[^\s,;]+/gi, (match) => {
      const [label] = match.split(/[:=]/, 1);
      return `${label}=[redacted]`;
    });

const toChannels = (options: NotifyOptions, severity?: NotificationSeverity): NotificationChannel[] => {
  if (severity && options.routes?.[severity]?.length) return [...options.routes[severity]!];
  if (options.channels?.length) return [...options.channels];
  const channels = [options.primary, options.fallback].filter(Boolean) as NotificationChannel[];
  return channels;
};

async function notifyBase(options: NotifyOptions): Promise<NotifyResult> {
  const severity = typeof options.message === "string" ? undefined : options.message.severity;
  const message = resolveMessage(options.message, options.formatter, options.messageFormat).trim();
  if (!message) throw new ValidationError("message is required");
  const channels = toChannels(options, severity);
  if (!channels.length) throw new ValidationError("at least one channel is required");

  const retry = options.retry ?? { attempts: 1, delayMs: 0 };
  const attempts: NotifyResult["attempts"] = [];
  const logger = createLogger(options.logger ?? console, options.logLevel ?? "silent");
  const safeMessage = redactMessage(message);

  for (const channel of channels) {
    for (let attempt = 1; attempt <= retry.attempts; attempt += 1) {
      try {
        await channel.send(message);
        attempts.push({ channel: channel.name, ok: true, attempt });
        logger.info("notify.delivered", { channel: channel.name, attempt, message: safeMessage, severity });
        const result = { ok: true, deliveredBy: channel.name, attempts };
        await options.onResult?.(result);
        return { ok: true, deliveredBy: channel.name, attempts };
      } catch (error) {
        const safeError = redactError(error);
        attempts.push({ channel: channel.name, ok: false, attempt, error: safeError });
        logger.warn("notify.failed", { channel: channel.name, attempt, error: safeError, message: safeMessage, severity });
        await options.onError?.(error, { channel: channel.name, attempt, message: safeMessage });
        if (attempt < retry.attempts && retry.delayMs > 0) await sleep(retry.delayMs);
      }
    }
  }

  const result = { ok: false, attempts };
  logger.error("notify.exhausted", { message: safeMessage, severity, attempts: attempts.length });
  await options.onResult?.(result);
  return result;
}

const notifyWithTemplate = async (
  template: NotifyTemplateInput,
  options: Omit<NotifyOptions, "message"> & { routes?: NotifyOptions["routes"] }
) =>
  notifyBase({
    ...options,
    message: template
  });

export const alert = (template: NotifyTemplateInput, options: Omit<NotifyOptions, "message"> = {}) =>
  notifyWithTemplate({ ...template, severity: template.severity ?? "critical" }, options);

export const incident = (template: NotifyTemplateInput, options: Omit<NotifyOptions, "message"> = {}) =>
  notifyWithTemplate({ ...template, severity: template.severity ?? "critical" }, options);

export const notify = Object.assign(notifyBase, { alert, incident });

export function summarizeNotifyResult(result: NotifyResult) {
  return {
    ok: result.ok,
    deliveredBy: result.deliveredBy,
    attempts: result.attempts.length,
    failures: result.attempts.filter((attempt) => !attempt.ok).length
  };
}
