import { describe, expect, it } from "vitest";
import { createTemplatePayload, formatMessage, resolveMessage } from "../src/format.js";

describe("formatMessage", () => {
  it("formats payload", () => {
    expect(
      formatMessage({
        title: "Deploy",
        severity: "info",
        source: "CI",
        message: "done"
      })
    ).toBe("*Deploy*\nSeverity: info\nSource: CI\ndone");
  });

  it("formats plain and json presets", () => {
    const payload = { title: "Deploy", severity: "info" as const, source: "CI", message: "done" };
    expect(formatMessage(payload, "plain")).toBe("Deploy\nSeverity: info\nSource: CI\ndone");
    expect(formatMessage(payload, "json")).toContain('"title":"Deploy"');
  });

  it("resolves string input", () => {
    expect(resolveMessage("plain")).toBe("plain");
  });

  it("falls back to preset when formatter empty", () => {
    expect(resolveMessage({ message: "done" }, () => "", "plain")).toBe("done");
  });

  it("uses formatter when it returns content", () => {
    expect(resolveMessage({ message: "done" }, () => "custom", "plain")).toBe("custom");
  });

  it("creates template payload", () => {
    expect(
      createTemplatePayload({ title: "Deploy", message: "done", source: "CI" }, "critical")
    ).toMatchObject({
      title: "Deploy",
      message: "done",
      source: "CI",
      severity: "critical"
    });
  });
});
