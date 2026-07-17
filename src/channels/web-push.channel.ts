import webpush from "web-push";
import { ValidationError } from "../errors.js";
import type { NotificationChannel, WebPushConfig } from "../types.js";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isValidVapidSubject = (subject: string) => {
  try {
    const url = new URL(subject);
    return url.protocol === "mailto:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export class WebPushChannel implements NotificationChannel {
  readonly name = "webpush";

  constructor(private readonly config: WebPushConfig) {
    const { subscription, vapidDetails, ttl, timeoutMs, topic } = config;
    if (!subscription || !isNonEmptyString(subscription.endpoint) || !isHttpsUrl(subscription.endpoint)) {
      throw new ValidationError("subscription.endpoint must be an HTTPS URL");
    }
    if (!isNonEmptyString(subscription.keys?.auth)) throw new ValidationError("subscription.keys.auth is required");
    if (!isNonEmptyString(subscription.keys?.p256dh)) throw new ValidationError("subscription.keys.p256dh is required");
    if (!vapidDetails || !isNonEmptyString(vapidDetails.subject) || !isValidVapidSubject(vapidDetails.subject)) {
      throw new ValidationError("vapidDetails.subject must be a mailto: or HTTPS URL");
    }
    if (!isNonEmptyString(vapidDetails.publicKey)) throw new ValidationError("vapidDetails.publicKey is required");
    if (!isNonEmptyString(vapidDetails.privateKey)) throw new ValidationError("vapidDetails.privateKey is required");
    if (ttl !== undefined && (!Number.isInteger(ttl) || ttl < 0)) throw new ValidationError("ttl must be a non-negative integer");
    if (timeoutMs !== undefined && (!Number.isFinite(timeoutMs) || timeoutMs <= 0)) {
      throw new ValidationError("timeoutMs must be greater than 0");
    }
    if (config.contentEncoding !== undefined && !["aesgcm", "aes128gcm"].includes(config.contentEncoding)) {
      throw new ValidationError("contentEncoding must be aesgcm or aes128gcm");
    }
    if (config.urgency !== undefined && !["very-low", "low", "normal", "high"].includes(config.urgency)) {
      throw new ValidationError("urgency must be very-low, low, normal, or high");
    }
    if (topic !== undefined && !/^[A-Za-z0-9_-]{1,32}$/.test(topic)) {
      throw new ValidationError("topic must contain 1-32 URL-safe characters");
    }
  }

  async send(message: string): Promise<void> {
    const options = {
      vapidDetails: this.config.vapidDetails,
      ...(this.config.ttl === undefined ? {} : { TTL: this.config.ttl }),
      ...(this.config.timeoutMs === undefined ? {} : { timeout: this.config.timeoutMs }),
      ...(this.config.contentEncoding === undefined ? {} : { contentEncoding: this.config.contentEncoding }),
      ...(this.config.urgency === undefined ? {} : { urgency: this.config.urgency }),
      ...(this.config.topic === undefined ? {} : { topic: this.config.topic })
    };

    await webpush.sendNotification(this.config.subscription, message, options);
  }
}
