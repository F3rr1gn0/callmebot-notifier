import type { MessageFormatPreset, MessageFormatter, MessageInput, NotificationMessagePayload, NotifyTemplateInput } from "./types.js";

const isPayload = (input: MessageInput): input is NotificationMessagePayload => typeof input !== "string";

export const formatMessage = (payload: NotificationMessagePayload, preset: MessageFormatPreset = "markdown") => {
  if (preset === "json") return JSON.stringify(payload);
  const title = payload.title?.trim() ?? "";
  const message = payload.message?.trim() ?? "";
  const lines = [
    preset === "markdown" && title ? `*${title}*` : title,
    payload.severity ? `Severity: ${payload.severity}` : "",
    payload.source ? `Source: ${payload.source}` : "",
    message
  ].filter(Boolean);
  return lines.join("\n");
};

export function resolveMessage(
  input: MessageInput,
  formatter: MessageFormatter | undefined = undefined,
  preset: MessageFormatPreset = "markdown"
) {
  if (typeof input === "string") return input;
  if (!isPayload(input)) return "";
  return formatter ? formatter(input) || formatMessage(input, preset) : formatMessage(input, preset);
}

export const createTemplatePayload = (input: NotifyTemplateInput, severity?: NotifyTemplateInput["severity"]): NotificationMessagePayload => ({
  title: input.title,
  message: input.message,
  source: input.source,
  severity: severity ?? input.severity
});
