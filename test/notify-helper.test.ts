import { describe, expect, it } from "vitest";
import { summarizeNotifyResult } from "../src/notify.js";

describe("summarizeNotifyResult", () => {
  it("summarizes result", () => {
    expect(
      summarizeNotifyResult({
        ok: false,
        attempts: [
          { channel: "whatsapp", ok: false, attempt: 1, error: "no" },
          { channel: "telegram", ok: true, attempt: 1 }
        ]
      })
    ).toEqual({ ok: false, deliveredBy: undefined, attempts: 2, failures: 1 });
  });
});
