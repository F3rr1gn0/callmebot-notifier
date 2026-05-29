const { CallMeBotNotifier } = require("../../dist/index.cjs");

const client = new CallMeBotNotifier({ phone: process.env.PHONE, apikey: process.env.APIKEY });
client.sendWhatsApp("CJS example");
