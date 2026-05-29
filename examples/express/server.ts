import { CallMeBotNotifier, CallMeBotChannel, createExpressApp } from "../../src/index.js";

const channels = [];
if (process.env.PHONE && process.env.APIKEY) {
  const client = new CallMeBotNotifier({ phone: process.env.PHONE, apikey: process.env.APIKEY, logLevel: "info" });
  channels.push(new CallMeBotChannel(client));
} else {
  console.warn("PHONE/APIKEY missing: WhatsApp channel disabled");
}
const app = createExpressApp({
  name: "fallback",
  send: async (message: string) => {
    if (channels.length) return channels[0].send(message);
    return { ok: false, channel: "whatsapp", message, error: "PHONE/APIKEY missing" };
  }
});
app.listen(Number(process.env.PORT ?? 3000), () => console.log("express example up"));
