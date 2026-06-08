import { describe, expect, it, vi } from "vitest";
import { CallMeBotNotifier } from "../src/client.js";
import { HttpError, RetryExhaustedError, ValidationError } from "../src/errors.js";
import { fromEnv } from "../src/env.js";

describe("CallMeBotNotifier", () => {
  it("validates config", () => {
    expect(() => new CallMeBotNotifier({ phone: "", apikey: "x" })).toThrow(ValidationError);
  });

  it("sends encoded whatsapp request", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" });
    const client = new CallMeBotNotifier({ phone: "123", apikey: "key", fetch });
    await client.sendWhatsApp("ciao mondo");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toContain("text=ciao+mondo");
  });

  it("fails on http error", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "bad" });
    const client = new CallMeBotNotifier({ phone: "123", apikey: "key", fetch, retries: 0 });
    await expect(client.sendWhatsApp("ciao")).rejects.toBeInstanceOf(HttpError);
  });

  it("wraps retry exhaustion", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("net"));
    const client = new CallMeBotNotifier({ phone: "123", apikey: "key", fetch, retries: 0 });
    await expect(client.sendWhatsApp("ciao")).rejects.toBeInstanceOf(RetryExhaustedError);
  });

  it("uses custom base url", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" });
    const client = new CallMeBotNotifier({ phone: "123", apikey: "key", fetch, baseUrl: "https://example.com" });
    await client.sendWhatsApp("ciao");
    expect(fetch.mock.calls[0][0]).toContain("https://example.com/whatsapp.php");
  });

  it("accepts explicit signal and disabled rate limit", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" });
    const client = new CallMeBotNotifier({ phone: "123", apikey: "key", fetch, rateLimitPerMinute: 0 });
    const signal = new AbortController().signal;
    await client.sendWhatsApp("ciao", { signal });
    expect(fetch).toHaveBeenCalled();
  });
});

describe("fromEnv", () => {
  it("creates a fallback channel from env", () => {
    const channel = fromEnv({
      env: {
        PHONE: "123",
        APIKEY: "key"
      } as NodeJS.ProcessEnv
    });

    expect(channel.name).toBe("fallback");
  });

  it("fails on partial whatsapp env", () => {
    expect(() =>
      fromEnv({
        env: {
          PHONE: "123"
        } as NodeJS.ProcessEnv
      })
    ).toThrow("Missing env APIKEY");
  });

  it("fails when nothing is configured", () => {
    expect(() => fromEnv({ env: {} as NodeJS.ProcessEnv })).toThrow("No channels configured");
  });

  it("creates telegram email discord and slack channels", () => {
    const channel = fromEnv({
      env: {
        TELEGRAM_BOT_TOKEN: "bot",
        TELEGRAM_CHAT_ID: "chat",
        SMTP_HOST: "smtp.example.com",
        SMTP_PORT: "587",
        SMTP_SECURE: "true",
        EMAIL_FROM: "from@example.com",
        EMAIL_TO: "to@example.com",
        DISCORD_WEBHOOK_URL: "https://example.com/discord",
        SLACK_WEBHOOK_URL: "https://example.com/slack"
      } as NodeJS.ProcessEnv
    });

    expect(channel.name).toBe("fallback");
  });

  it("uses custom log level for whatsapp from env", () => {
    const channel = fromEnv({
      env: {
        PHONE: "123",
        APIKEY: "key"
      } as NodeJS.ProcessEnv,
      logLevel: "debug"
    });

    expect(channel.name).toBe("fallback");
  });
});
