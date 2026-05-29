import { CallMeBotNotifier, CallMeBotChannel, createExpressApp } from "../../src/index.js";

const client = new CallMeBotNotifier({ phone: process.env.PHONE!, apikey: process.env.APIKEY!, logLevel: "info" });
const app = createExpressApp(new CallMeBotChannel(client));
app.listen(Number(process.env.PORT ?? 3000), () => console.log("express example up"));
