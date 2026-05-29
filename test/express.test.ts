import { describe, expect, it, vi } from "vitest";
import { createExpressApp } from "../src/integrations/express.js";
import type { NotificationChannel } from "../src/types.js";

const makeRes = () => {
  const res: any = {};
  res.statusCode = 200;
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((body: unknown) => {
    res.body = body;
    return res;
  });
  return res;
};

describe("createExpressApp", () => {
  it("returns health", async () => {
    const channel: NotificationChannel = { name: "x", send: async () => ({ ok: true, channel: "whatsapp", message: "ok" }) };
    const app = createExpressApp(channel);
    const route = app._router.stack.find((l: any) => l.route?.path === "/health");
    const handler = route.route.stack[0].handle;
    const res = makeRes();
    await handler({}, res);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("rejects invalid notify payload", async () => {
    const app = createExpressApp({ name: "x", send: async () => ({ ok: true, channel: "whatsapp", message: "ok" }) });
    const route = app._router.stack.find((l: any) => l.route?.path === "/notify");
    const handler = route.route.stack[0].handle;
    const res = makeRes();
    await handler({ body: {} }, res);
    expect(res.statusCode).toBe(400);
  });

  it("accepts webhook payload", async () => {
    const channel: NotificationChannel = { name: "x", send: async () => ({ ok: true, channel: "whatsapp", message: "ok" }) };
    const app = createExpressApp(channel);
    const route = app._router.stack.find((l: any) => l.route?.path === "/webhook");
    const handler = route.route.stack[0].handle;
    const res = makeRes();
    await handler({ body: { title: "a", message: "b", severity: "info", source: "c" } }, res);
    expect(res.statusCode).toBe(200);
  });

  it("rejects invalid webhook payload", async () => {
    const channel: NotificationChannel = { name: "x", send: async () => ({ ok: true, channel: "whatsapp", message: "ok" }) };
    const app = createExpressApp(channel);
    const route = app._router.stack.find((l: any) => l.route?.path === "/webhook");
    const handler = route.route.stack[0].handle;
    const res = makeRes();
    await handler({ body: { severity: "bad" } }, res);
    expect(res.statusCode).toBe(400);
  });
});
