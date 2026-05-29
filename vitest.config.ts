import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      exclude: [
        "callmebot-notifier/**",
        "dist/**",
        "examples/**",
        "tsup.config.ts",
        "vitest.config.ts",
        "src/index.ts",
        "src/server.ts",
        "src/types.ts"
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
