import { CallMeBotNotifier } from "../../src/index.js";

const client = new CallMeBotNotifier({ phone: process.env.PHONE!, apikey: process.env.APIKEY! });
await client.sendWhatsApp("TypeScript example");
