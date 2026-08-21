import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it, vi } from "vitest";

let root: typeof import("callmebot-notifier");
let whatsappEntry: typeof import("callmebot-notifier/whatsapp");
let telegramEntry: typeof import("callmebot-notifier/telegram");

beforeAll(async () => {
  root = await import(/* @vite-ignore */ "callmebot-notifier");
  whatsappEntry = await import(/* @vite-ignore */ "callmebot-notifier/whatsapp");
  telegramEntry = await import(/* @vite-ignore */ "callmebot-notifier/telegram");
});

describe("built package exports", () => {
  it("keeps historical root exports", () => {
    expect(root.CallMeBotNotifier).toBeDefined();
    expect(root.TelegramChannel).toBeDefined();
    expect(root.notify).toBeDefined();
    expect(root.whatsapp).toBeDefined();
    expect(root.telegram).toBeDefined();
    expect(root.email).toBeDefined();
    expect(root.webpush).toBeDefined();
    expect(root.createExpressApp).toBeDefined();
  });

  it("imports WhatsApp subpath and sends through fetch", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => new Response("sent", { status: 200 }));
    const channel = whatsappEntry.whatsapp({ phone: "123", apikey: "key", fetch, rateLimitPerMinute: 0 });

    await channel.send("hello");

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0]?.[0]).toContain("/whatsapp.php");
  });

  it("imports Telegram subpath and sends through fetch", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => new Response("sent", { status: 200 }));
    const channel = telegramEntry.telegram({ botToken: "token", chatId: "42", fetch });

    await channel.send("hello");

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0]?.[0]).toContain("/bottoken/sendMessage");
  });

  it("keeps Node-only dependencies out of HTTP-only bundles", async () => {
    for (const entry of ["whatsapp", "telegram"]) {
      const source = await readFile(`dist/${entry}.js`, "utf8");
      expect(source).not.toMatch(/express|nodemailer|web-push/);
    }
  });
});
