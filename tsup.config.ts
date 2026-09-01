import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core.ts",
    whatsapp: "src/whatsapp.ts",
    telegram: "src/telegram.ts",
    email: "src/email.ts",
    webpush: "src/webpush.ts",
    express: "src/express.ts",
    server: "src/server.ts",
    cli: "src/cli.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  target: "es2022",
  platform: "node",
  splitting: false,
  bundle: true,
  external: ["express", "nodemailer", "web-push", "zod"]
});
