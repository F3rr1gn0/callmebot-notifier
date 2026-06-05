import { describe, expect, it } from "vitest";
import { FallbackChannel } from "../src/channels/fallback.channel.js";

describe("FallbackChannel", () => {
  it("uses next channel on failure", async () => {
    const c1 = { name: "a", send: async () => { throw new Error("no"); } };
    const c2 = { name: "b", send: async () => undefined };
    await expect(new FallbackChannel([c1, c2]).send("m")).resolves.toBeUndefined();
  });

  it("returns aggregated failure", async () => {
    const c1 = { name: "a", send: async () => { throw new Error("no"); } };
    const c2 = { name: "b", send: async () => { throw new Error("nope"); } };
    await expect(new FallbackChannel([c1, c2]).send("m")).rejects.toThrow("all fallback channels failed");
  });
});
