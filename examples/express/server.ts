import { createExpressApp, fromEnv } from "../../src/index.js";

const app = createExpressApp(fromEnv());
app.listen(Number(process.env.PORT ?? 3000), () => console.log("express example up"));
