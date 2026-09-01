import { describe, expect, it } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "../src/cli/args.js";
import { buildChannel, canonicalChannel, configuredChannels } from "../src/cli/channels.js";
import { configPath, loadConfig, maskConfig, saveConfig, setPath, unsetPath } from "../src/cli/config-store.js";
import { readStdin } from "../src/cli/stdin.js";

describe("CLI parser and config helpers", () => {
  it("parses message and stable options", () => {
    expect(parseArgs(["--channel", "telegram", "--fallback", "whatsapp,email", "--severity", "critical", "hello", "world"])).toMatchObject({
      channel: "telegram", fallback: ["whatsapp", "email"], severity: "critical", message: "hello world"
    });
  });

  it("rejects invalid severity and retry values", () => {
    expect(() => parseArgs(["--severity", "urgent", "x"])).toThrow("severity");
    expect(() => parseArgs(["--retry-attempts", "0", "x"])).toThrow("retry-attempts");
    expect(() => parseArgs(["--retry-delay", "-1", "x"])).toThrow("retry-delay");
  });

  it("supports aliases and de-duplicable canonical names", () => {
    expect(canonicalChannel("google-chat")).toBe("gchat");
    expect(canonicalChannel("msteams")).toBe("teams");
  });

  it("protects dotted paths and masks secrets", () => {
    expect(() => setPath({}, "__proto__.polluted", "yes")).toThrow();
    expect(() => unsetPath({}, "constructor.x")).toThrow();
    expect(maskConfig({ botToken: "1234567890abcdef", chatId: "42", apiKey: "secret" })).toEqual({ botToken: "1234...cdef", chatId: "42", apiKey: "[redacted]" });
  });

  it("resolves all supported CLI channel factories without sending", () => {
    const config = { channels: {
      whatsapp: { phone: "1", apikey: "2" }, telegram: { botToken: "1", chatId: "2" },
      email: { host: "smtp.example", from: "a@example", to: "b@example" }, discord: { webhookUrl: "https://discord.example" },
      slack: { webhookUrl: "https://slack.example" }, gchat: { webhookUrl: "https://gchat.example" }, teams: { webhookUrl: "https://teams.example" }, signal: { number: "1", recipients: "2" }
    } };
    expect(configuredChannels(config, {})).toHaveLength(8);
    for (const name of ["whatsapp", "telegram", "email", "discord", "slack", "gchat", "teams", "signal"] as const) expect(buildChannel(name, config, {} ).name).toBe(name === "whatsapp" ? "whatsapp" : name);
  });

  it("uses XDG config path and safely persists config", async () => {
    const root = await mkdtemp(join(tmpdir(), "cmb-cli-")); const path = join(root, "callmebot-notifier", "config.json");
    await saveConfig({ defaultChannel: "telegram" }, path);
    expect(await loadConfig(path)).toEqual({ defaultChannel: "telegram" });
    expect(configPath({ XDG_CONFIG_HOME: root })).toBe(path);
    await writeFile(path, "{");
    await expect(loadConfig(path)).rejects.toThrow("invalid config file");
  });

  it("does not read a TTY as stdin", async () => {
    await expect(readStdin(true)).resolves.toBeUndefined();
  });
});
