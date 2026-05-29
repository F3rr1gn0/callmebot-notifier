import { describe, expect, it } from "vitest";
import { FallbackChannel } from "../src/channels/fallback.channel.js";

describe("FallbackChannel", () => {
  it("uses next channel on failure", async () => {
    const c1 = { name: "a", send: async () => ({ ok: false, channel: "whatsapp" as const, message: "m", error: "no" }) };
    const c2 = { name: "b", send: async () => ({ ok: true, channel: "telegram" as const, message: "m" }) };
    await expect(new FallbackChannel([c1, c2]).send("m")).resolves.toMatchObject({ ok: true, channel: "telegram" });
  });

  it("returns aggregated failure", async () => {
    const c1 = { name: "a", send: async () => ({ ok: false, channel: "whatsapp" as const, message: "m", error: "no" }) };
    const c2 = { name: "b", send: async () => ({ ok: false, channel: "telegram" as const, message: "m", error: "nope" }) };
    await expect(new FallbackChannel([c1, c2]).send("m")).resolves.toMatchObject({ ok: false });
  });
});
