import { describe, expect, it, vi } from "vitest";

const { sendMail, sendNotification } = vi.hoisted(() => ({
  sendMail: vi.fn().mockResolvedValue({}),
  sendNotification: vi.fn().mockResolvedValue({})
}));
vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({ sendMail })
  }
}));
vi.mock("web-push", () => ({
  default: { sendNotification }
}));

import { CallMeBotChannel } from "../src/channels/callmebot.channel.js";
import { TelegramChannel } from "../src/channels/telegram.channel.js";
import { EmailChannel } from "../src/channels/email.channel.js";
import { DiscordChannel } from "../src/channels/discord.channel.js";
import { SlackChannel } from "../src/channels/slack.channel.js";
import { GChatChannel } from "../src/channels/gchat.channel.js";
import { TeamsChannel } from "../src/channels/teams.channel.js";
import { WebPushChannel } from "../src/channels/web-push.channel.js";
import { SignalChannel } from "../src/channels/signal.channel.js";
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

  it("sends gchat webhook", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" });
    const channel = new GChatChannel({ webhookUrl: "https://example.com/gchat", fetch });
    await expect(channel.send("hello")).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("https://example.com/gchat", expect.objectContaining({
      method: "POST"
    }));
  });

  it("fails gchat webhook", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => "gchat bad" });
    const channel = new GChatChannel({ webhookUrl: "https://example.com/gchat", fetch });
    await expect(channel.send("hello")).rejects.toThrow("gchat bad");
  });

  it("sends teams webhook", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" });
    const channel = new TeamsChannel({ webhookUrl: "https://example.com/teams", fetch });
    await expect(channel.send("hello")).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("https://example.com/teams", expect.objectContaining({
      method: "POST"
    }));
  });

  it("fails teams webhook", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => "teams bad" });
    const channel = new TeamsChannel({ webhookUrl: "https://example.com/teams", fetch });
    await expect(channel.send("hello")).rejects.toThrow("teams bad");
  });

  it("sends signal through signal-cli-rest-api", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "ok" });
    const channel = new SignalChannel({
      number: "+391234567890",
      recipients: ["+399876543210"],
      baseUrl: "http://signal:8080",
      fetch
    });
    await expect(channel.send("hello")).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("http://signal:8080/v2/send", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        message: "hello",
        number: "+391234567890",
        recipients: ["+399876543210"]
      })
    }));
  });

  it("fails signal on API error", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => "signal bad" });
    const channel = new SignalChannel({ number: "+391234567890", recipients: ["+399876543210"], fetch });
    await expect(channel.send("hello")).rejects.toThrow("signal bad");
  });

  it("validates discord config", () => {
    expect(() => new DiscordChannel({ webhookUrl: "" })).toThrow(ValidationError);
  });

  it("validates slack config", () => {
    expect(() => new SlackChannel({ webhookUrl: "" })).toThrow(ValidationError);
  });

  it("validates gchat config", () => {
    expect(() => new GChatChannel({ webhookUrl: "" })).toThrow(ValidationError);
  });

  it("validates teams config", () => {
    expect(() => new TeamsChannel({ webhookUrl: "" })).toThrow(ValidationError);
  });

  it("validates signal config", () => {
    expect(() => new SignalChannel({ number: "", recipients: ["+391234567890"] })).toThrow(ValidationError);
    expect(() => new SignalChannel({ number: "+391234567890", recipients: [] })).toThrow(ValidationError);
    expect(() => new SignalChannel({ number: "+391234567890", recipients: [""] })).toThrow(ValidationError);
  });

  it("sends web push notification with VAPID details", async () => {
    const subscription = {
      endpoint: "https://push.example.test/subscription",
      expirationTime: null,
      keys: { auth: "auth-key", p256dh: "public-key" }
    };
    const channel = new WebPushChannel({
      subscription,
      vapidDetails: {
        subject: "mailto:alerts@example.com",
        publicKey: "vapid-public-key",
        privateKey: "vapid-private-key"
      },
      ttl: 60,
      timeoutMs: 5000,
      urgency: "high",
      topic: "deploy"
    });

    await expect(channel.send("Deployment complete")).resolves.toBeUndefined();
    expect(sendNotification).toHaveBeenCalledWith(subscription, "Deployment complete", {
      vapidDetails: {
        subject: "mailto:alerts@example.com",
        publicKey: "vapid-public-key",
        privateKey: "vapid-private-key"
      },
      TTL: 60,
      timeout: 5000,
      urgency: "high",
      topic: "deploy"
    });
  });

  it("validates web push config", () => {
    const vapidDetails = {
      subject: "mailto:alerts@example.com",
      publicKey: "vapid-public-key",
      privateKey: "vapid-private-key"
    };
    const subscription = {
      endpoint: "https://push.example.test/subscription",
      keys: { auth: "auth-key", p256dh: "public-key" }
    };

    expect(() => new WebPushChannel({ ...subscription, vapidDetails } as never)).toThrow(ValidationError);
    expect(() => new WebPushChannel({ subscription, vapidDetails: { ...vapidDetails, subject: "" } })).toThrow(ValidationError);
    expect(() => new WebPushChannel({ subscription, vapidDetails: { ...vapidDetails, publicKey: "" } })).toThrow(ValidationError);
    expect(() => new WebPushChannel({ subscription, vapidDetails: { ...vapidDetails, privateKey: "" } })).toThrow(ValidationError);
    expect(() => new WebPushChannel({
      subscription: { ...subscription, endpoint: "http://push.example.test/subscription" },
      vapidDetails
    })).toThrow(ValidationError);
    expect(() => new WebPushChannel({
      subscription: { ...subscription, keys: { ...subscription.keys, auth: "" } },
      vapidDetails
    })).toThrow(ValidationError);
    expect(() => new WebPushChannel({ subscription, vapidDetails, ttl: -1 })).toThrow(ValidationError);
    expect(() => new WebPushChannel({ subscription, vapidDetails, timeoutMs: 0 })).toThrow(ValidationError);
    expect(() => new WebPushChannel({ subscription, vapidDetails, contentEncoding: "invalid" as never })).toThrow(ValidationError);
    expect(() => new WebPushChannel({ subscription, vapidDetails, urgency: "invalid" as never })).toThrow(ValidationError);
    expect(() => new WebPushChannel({ subscription, vapidDetails, topic: "invalid topic" })).toThrow(ValidationError);
  });

  it("propagates web push service errors", async () => {
    sendNotification.mockRejectedValueOnce(new Error("subscription expired"));
    const channel = new WebPushChannel({
      subscription: {
        endpoint: "https://push.example.test/subscription",
        keys: { auth: "auth-key", p256dh: "public-key" }
      },
      vapidDetails: {
        subject: "mailto:alerts@example.com",
        publicKey: "vapid-public-key",
        privateKey: "vapid-private-key"
      }
    });

    await expect(channel.send("hello")).rejects.toThrow("subscription expired");
  });
});
