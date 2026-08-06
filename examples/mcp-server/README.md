# MCP server

Minimal MCP server exposing `send_notification`.

It uses the notification channels configured through environment variables. Secrets stay in the server process and are never accepted as tool arguments.

## Run locally

From this directory:

```bash
cp .env.example .env
# edit .env
npm install
npx tsx server.ts
```

The MCP server uses `stdio`, so an MCP client starts it as a child process. For Claude Desktop, Cursor, or another compatible client, configure the command with the required environment variables:

```json
{
  "mcpServers": {
    "callmebot-notifier": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/examples/mcp-server/server.ts"],
      "env": {
        "PHONE": "393331112223",
        "APIKEY": "your-callmebot-apikey"
      }
    }
  }
}
```

Use a secret manager or the client’s environment configuration in real deployments. Do not commit API keys or webhook URLs.

## Tool

`send_notification` accepts:

```json
{
  "message": "Deployment completed",
  "title": "Production",
  "severity": "info",
  "source": "github-actions"
}
```

The response contains the standard `NotifyResult` with delivery status and attempts.
