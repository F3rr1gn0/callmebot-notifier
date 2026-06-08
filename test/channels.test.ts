import { describe, expect, it, vi } from "vitest";

const sendMail = vi.fn().mockResolvedValue({});
vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({ sendMail })
  }
}));

import { CallMeBotChannel } from "../src/channels/callmebot.channel.js";
import { TelegramChannel } from "../src/channels/telegram.channel.js";
import { EmailChannel } from "../src/channels/email.channel.js";
import { DiscordChannel } from "../src/channels/discord.channel.js";
import { SlackChannel } from "../src/channels/slack.channel.js";
import { CallMeBotNotifier } from "../src/client.js";
import { ValidationError } from "../src/errors.js";

describe("channels", () => {
  it("wraps callmebot client", async () => {
    const client = { sendWhatsApp: vi.fn().mockResolvedValue({ ok: true, channel: "whatsapp", message: "m" }) } as unknown as CallMeBotNotifier;
    await expect(new CallMeBotChannel(client).send("m")).resolves.toBeUndefined();
  });

  it("sends telegram", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" });
    const channel = new TelegramChannel({ botToken: "t", chatId: "c", fetch });
    await expect(channel.send("hello")).resolves.toBeUndefined();
  });

  it("sends email", async () => {
    const channel = new EmailChannel({ host: "smtp", port: 587, secure: false, from: "a@example.com", to: "b@example.com" });
    await expect(channel.send("hello")).resolves.toBeUndefined();
    expect(sendMail).toHaveBeenCalled();
  });

  it("supports email auth branch", async () => {
    const channel = new EmailChannel({
      host: "smtp",
      port: 587,
      secure: false,
      user: "u",
      pass: "p",
      from: "a@example.com",
      to: "b@example.com"
    });
    await channel.send("hello");
    expect(sendMail).toHaveBeenCalled();
  });

  it("validates telegram config", () => {
    expect(() => new TelegramChannel({ botToken: "", chatId: "c" })).toThrow(ValidationError);
    expect(() => new TelegramChannel({ botToken: "t", chatId: "" })).toThrow(ValidationError);
  });

  it("validates email config", () => {
    expect(() => new EmailChannel({ host: "", port: 587, secure: false, from: "a", to: "b" })).toThrow(ValidationError);
    expect(() => new EmailChannel({ host: "smtp", port: 587, secure: false, from: "", to: "b" })).toThrow(ValidationError);
    expect(() => new EmailChannel({ host: "smtp", port: 587, secure: false, from: "a", to: "" })).toThrow(ValidationError);
  });

  it("handles telegram non-ok", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => "bad" });
    const channel = new TelegramChannel({ botToken: "t", chatId: "c", fetch });
    await expect(channel.send("hello")).rejects.toThrow("bad");
  });

  it("sends discord webhook", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" });
    const channel = new DiscordChannel({ webhookUrl: "https://example.com/discord", fetch });
    await expect(channel.send("hello")).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("https://example.com/discord", expect.objectContaining({
      method: "POST"
    }));
  });

  it("fails discord webhook", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => "discord bad" });
    const channel = new DiscordChannel({ webhookUrl: "https://example.com/discord", fetch });
    await expect(channel.send("hello")).rejects.toThrow("discord bad");
  });

  it("sends slack webhook", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" });
    const channel = new SlackChannel({ webhookUrl: "https://example.com/slack", fetch });
    await expect(channel.send("hello")).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("https://example.com/slack", expect.objectContaining({
      method: "POST"
    }));
  });

  it("fails slack webhook", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => "slack bad" });
    const channel = new SlackChannel({ webhookUrl: "https://example.com/slack", fetch });
    await expect(channel.send("hello")).rejects.toThrow("slack bad");
  });

  it("validates discord config", () => {
    expect(() => new DiscordChannel({ webhookUrl: "" })).toThrow(ValidationError);
  });

  it("validates slack config", () => {
    expect(() => new SlackChannel({ webhookUrl: "" })).toThrow(ValidationError);
  });
});
