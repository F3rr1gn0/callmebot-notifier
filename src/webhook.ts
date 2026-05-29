import type { WebhookPayload } from "./types.js";

export function formatWebhookMessage(payload: WebhookPayload) {
  const parts = [
    payload.title?.trim() ? `*${payload.title.trim()}*` : "",
    payload.severity ? `Severity: ${payload.severity}` : "",
    payload.source ? `Source: ${payload.source}` : "",
    payload.message?.trim() ?? ""
  ].filter(Boolean);
  return parts.join("\n");
}
