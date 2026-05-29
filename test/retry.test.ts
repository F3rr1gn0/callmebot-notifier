import { describe, expect, it, vi } from "vitest";
import { withRetry } from "../src/retry.js";

describe("withRetry", () => {
  it("retries until success", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce("ok");
    await expect(withRetry(fn, 1, 1, 2)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws after retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("nope"));
    await expect(withRetry(fn, 0, 1, 2)).rejects.toThrow("nope");
  });
});
