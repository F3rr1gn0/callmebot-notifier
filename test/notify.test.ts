import { describe, expect, it, vi } from "vitest";
import { notify } from "../src/notify.js";
import { whatsapp, telegram, email, gchat, teams } from "../src/channels/factories.js";

describe("notify", () => {
  it("delivers through first channel", async () => {
    const channel = { name: "a", send: vi.fn().mockResolvedValue(undefined) };
    const result = await notify({ channels: [channel], message: "m" });
    expect(result).toMatchObject({ ok: true, deliveredBy: "a" });
    expect(channel.send).toHaveBeenCalledTimes(1);
  });

  it("falls back after first failure", async () => {
    const a = { name: "a", send: vi.fn().mockRejectedValue(new Error("no")) };
    const b = { name: "b", send: vi.fn().mockResolvedValue(undefined) };
    const result = await notify({ channels: [a, b], message: "m" });
    expect(result).toMatchObject({ ok: true, deliveredBy: "b" });
    expect(result.attempts).toHaveLength(2);
  });

  it("retries before fallback", async () => {
    const a = { name: "a", send: vi.fn().mockRejectedValue(new Error("no")) };
    const b = { name: "b", send: vi.fn().mockResolvedValue(undefined) };
    const result = await notify({ channels: [a, b], message: "m", retry: { attempts: 2, delayMs: 0 } });
    expect(a.send).toHaveBeenCalledTimes(2);
    expect(result.deliveredBy).toBe("b");
  });

  it("returns structured failure", async () => {
    const a = { name: "a", send: vi.fn().mockRejectedValue(new Error("no")) };
    const result = await notify({ channels: [a], message: "m", retry: { attempts: 1, delayMs: 0 } });
    expect(result.ok).toBe(false);
    expect(result.attempts[0]).toMatchObject({ channel: "a", ok: false, attempt: 1 });
  });

  it("throws when no channels are given", async () => {
    await expect(notify({ channels: [], message: "m" })).rejects.toThrow("at least one channel is required");
  });

  it("throws when payload formats to empty", async () => {
    const channel = { name: "a", send: vi.fn().mockResolvedValue(undefined) };
    await expect(notify({ channels: [channel], message: { message: "   " } })).rejects.toThrow("message is required");
  });

  it("supports primary and fallback helpers", async () => {
    const result = await notify({
      primary: whatsapp({ phone: "123", apikey: "key", fetch: vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" }) }),
      fallback: telegram({ botToken: "t", chatId: "c", fetch: vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" }) }),
      message: "m"
    });
    expect(result.ok).toBe(true);
  });

  it("accepts reminderAfter type", async () => {
    const result = await notify({ channels: [{ name: "x", send: vi.fn().mockResolvedValue(undefined) }], message: "m", reminderAfter: "1h" });
    expect(result.ok).toBe(true);
  });

  it("does not leak secrets in errors", async () => {
    const channel = { name: "a", send: vi.fn().mockRejectedValue(new Error("apikey=secret token=abc")) };
    const result = await notify({ channels: [channel], message: "m" });
    expect(result.attempts[0].error).not.toContain("secret");
  });

  it("redacts long token-like blobs", async () => {
    const channel = { name: "a", send: vi.fn().mockRejectedValue(new Error("abcDEF1234567890abcDEF1234567890")) };
    const result = await notify({ channels: [channel], message: "m" });
    expect(result.attempts[0].error).toContain("[redacted]");
  });

  it("stringifies non-error failures", async () => {
    const channel = { name: "a", send: vi.fn().mockRejectedValue("boom") };
    const result = await notify({ channels: [channel], message: "m" });
    expect(result.attempts[0].error).toBe("boom");
  });

  it("uses custom formatter for payload", async () => {
    const channel = { name: "a", send: vi.fn().mockResolvedValue(undefined) };
    await notify({
      channels: [channel],
      message: { title: "Deploy", message: "done" },
      formatter: (payload) => `${payload.title}: ${payload.message}`
    });
    expect(channel.send).toHaveBeenCalledWith("Deploy: done");
  });

  it("uses plain preset", async () => {
    const channel = { name: "a", send: vi.fn().mockResolvedValue(undefined) };
    await notify({
      channels: [channel],
      message: { title: "Deploy", message: "done" },
      messageFormat: "plain"
    });
    expect(channel.send).toHaveBeenCalledWith("Deploy\ndone");
  });

  it("uses json preset", async () => {
    const channel = { name: "a", send: vi.fn().mockResolvedValue(undefined) };
    await notify({
      channels: [channel],
      message: { title: "Deploy", message: "done" },
      messageFormat: "json"
    });
    expect(channel.send).toHaveBeenCalledWith(expect.stringContaining('"title":"Deploy"'));
  });

  it("routes by severity when configured", async () => {
    const info = { name: "info", send: vi.fn().mockResolvedValue(undefined) };
    const critical = { name: "critical", send: vi.fn().mockResolvedValue(undefined) };

    const result = await notify({
      channels: [info],
      routes: {
        critical: [critical]
      },
      message: {
        title: "CPU high",
        message: "load spike",
        severity: "critical"
      }
    });

    expect(result.deliveredBy).toBe("critical");
    expect(critical.send).toHaveBeenCalledWith("*CPU high*\nSeverity: critical\nload spike");
    expect(info.send).not.toHaveBeenCalled();
  });

  it("routes warn severity to gchat", async () => {
    const warnFetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" });
    const criticalFetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" });
    const warn = gchat({ webhookUrl: "https://example.com/gchat", fetch: warnFetch });
    const critical = teams({ webhookUrl: "https://example.com/teams", fetch: criticalFetch });

    const result = await notify({
      routes: {
        warn: [warn],
        critical: [critical]
      },
      message: {
        title: "Latency spike",
        message: "warn path",
        severity: "warn"
      }
    });

    expect(result.deliveredBy).toBe("gchat");
    expect(warnFetch).toHaveBeenCalledWith("https://example.com/gchat", expect.objectContaining({ method: "POST" }));
    expect(criticalFetch).not.toHaveBeenCalled();
  });

  it("supports alert template helper", async () => {
    const channel = { name: "a", send: vi.fn().mockResolvedValue(undefined) };
    const result = await notify.alert(
      { title: "Deploy", message: "done" },
      { channels: [channel] }
    );

    expect(result.ok).toBe(true);
    expect(channel.send).toHaveBeenCalledWith("*Deploy*\nSeverity: critical\ndone");
  });

  it("supports incident template helper", async () => {
    const channel = { name: "a", send: vi.fn().mockResolvedValue(undefined) };
    const result = await notify.incident(
      { title: "Incident", message: "db down", source: "api" },
      { channels: [channel] }
    );

    expect(result.ok).toBe(true);
    expect(channel.send).toHaveBeenCalledWith("*Incident*\nSeverity: critical\nSource: api\ndb down");
  });

  it("calls onResult on success", async () => {
    const onResult = vi.fn();
    const logger = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() };
    const channel = { name: "a", send: vi.fn().mockResolvedValue(undefined) };

    await notify({ channels: [channel], message: "token=secret", onResult, logger, logLevel: "info" });

    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ ok: true, deliveredBy: "a" }));
    expect(logger.info).toHaveBeenCalledWith("notify.delivered", expect.objectContaining({ message: "token=[redacted]" }));
  });

  it("calls onError on failure and logs structured data", async () => {
    const onError = vi.fn();
    const logger = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() };
    const channel = { name: "a", send: vi.fn().mockRejectedValue(new Error("apikey=secret")) };

    const result = await notify({
      channels: [channel],
      message: "hello",
      onError,
      logger,
      logLevel: "warn"
    });

    expect(result.ok).toBe(false);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ channel: "a", attempt: 1, message: "hello" }));
    expect(logger.warn).toHaveBeenCalledWith("notify.failed", expect.objectContaining({ error: "apikey=[redacted]" }));
    expect(logger.error).toHaveBeenCalledWith("notify.exhausted", expect.objectContaining({ attempts: 1 }));
  });
});
