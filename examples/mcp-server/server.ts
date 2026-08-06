import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { notify, fromEnv } from "../../src/index.js";
import { z } from "zod";

const notifier = fromEnv({ logLevel: "silent" });
const server = new McpServer({
  name: "callmebot-notifier",
  version: "1.0.0"
});

server.registerTool(
  "send_notification",
  {
    description: "Send a notification through the channels configured in the server environment.",
    inputSchema: {
      message: z.string().min(1).describe("Notification text"),
      title: z.string().min(1).optional().describe("Optional notification title"),
      severity: z.enum(["info", "warn", "error", "critical"]).optional(),
      source: z.string().min(1).optional().describe("Optional notification source")
    }
  },
  async ({ message, title, severity, source }) => {
    const result = await notify({
      primary: notifier,
      message: { message, title, severity, source }
    });

    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      isError: !result.ok
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
