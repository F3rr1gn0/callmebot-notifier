import { describe, expect, it, vi } from "vitest";
import { notify } from "../src/notify.js";
import { whatsapp, telegram, email } from "../src/channels/factories.js";

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
});
