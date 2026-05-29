import { CallMeBotNotifier } from "../../dist/index.js";

const client = new CallMeBotNotifier({ phone: process.env.PHONE, apikey: process.env.APIKEY });
await client.sendWhatsApp("ESM example");
