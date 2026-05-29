import { describe, expect, it } from "vitest";
import { formatWebhookMessage } from "../src/webhook.js";

describe("formatWebhookMessage", () => {
  it("formats fields", () => {
    expect(formatWebhookMessage({ title: "Alert", message: "Down", severity: "error", source: "api" }))
      .toContain("*Alert*");
  });

  it("formats empty payload", () => {
    expect(formatWebhookMessage({})).toBe("");
  });
});
