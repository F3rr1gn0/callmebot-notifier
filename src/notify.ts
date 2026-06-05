import type { NotifyOptions, NotifyResult, NotificationChannel } from "./types.js";
import { ValidationError } from "./errors.js";
import { sleep } from "./retry.js";

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

const toChannels = (options: NotifyOptions): NotificationChannel[] => {
  if (options.channels?.length) return [...options.channels];
  const channels = [options.primary, options.fallback].filter(Boolean) as NotificationChannel[];
  return channels;
};

export async function notify(options: NotifyOptions): Promise<NotifyResult> {
  if (!options?.message?.trim()) throw new ValidationError("message is required");
  const channels = toChannels(options);
  if (!channels.length) throw new ValidationError("at least one channel is required");

  const retry = options.retry ?? { attempts: 1, delayMs: 0 };
  const attempts: NotifyResult["attempts"] = [];

  for (const channel of channels) {
    for (let attempt = 1; attempt <= retry.attempts; attempt += 1) {
      try {
        await channel.send(options.message);
        attempts.push({ channel: channel.name, ok: true, attempt });
        return { ok: true, deliveredBy: channel.name, attempts };
      } catch (error) {
        attempts.push({ channel: channel.name, ok: false, attempt, error: redactError(error) });
        if (attempt < retry.attempts && retry.delayMs > 0) await sleep(retry.delayMs);
      }
    }
  }

  return { ok: false, attempts };
}

export function summarizeNotifyResult(result: NotifyResult) {
  return {
    ok: result.ok,
    deliveredBy: result.deliveredBy,
    attempts: result.attempts.length,
    failures: result.attempts.filter((attempt) => !attempt.ok).length
  };
}
