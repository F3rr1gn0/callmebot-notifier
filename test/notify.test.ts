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
});
