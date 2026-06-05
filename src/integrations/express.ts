import express, { type Request, type Response } from "express";
import { z } from "zod";
import type { NotificationChannel } from "../types.js";
import { formatWebhookMessage } from "../webhook.js";

const notifySchema = z.object({ message: z.string().min(1) });
const webhookSchema = z.object({
  title: z.string().optional(),
  message: z.string().optional(),
  severity: z.enum(["info", "warn", "error", "critical"]).optional(),
  source: z.string().optional()
}).passthrough();

export function createExpressApp(channel: NotificationChannel) {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.post("/notify", async (req: Request, res: Response) => {
    const parsed = notifySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.flatten() });
    try {
      await channel.send(parsed.data.message);
      return res.status(200).json({ ok: true });
    } catch (error) {
      return res.status(502).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/webhook", async (req: Request, res: Response) => {
    const parsed = webhookSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.flatten() });
    const message = formatWebhookMessage(parsed.data);
    try {
      await channel.send(message);
      return res.status(200).json({ ok: true });
    } catch (error) {
      return res.status(502).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  });

  return app;
}
