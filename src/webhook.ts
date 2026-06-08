import { formatMessage } from "./format.js";
import type { NotificationMessagePayload } from "./types.js";

export function formatWebhookMessage(payload: NotificationMessagePayload) {
  return formatMessage(payload);
}
