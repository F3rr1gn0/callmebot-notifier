# Signal Setup

This integration uses the self-hosted [`signal-cli-rest-api`](https://github.com/bbernhard/signal-cli-rest-api) service. It is not an official Signal cloud API.

Run the service, link/register a Signal account, then configure the notifier:

```env
SIGNAL_API_URL=http://localhost:8080
SIGNAL_NUMBER=+391234567890
SIGNAL_RECIPIENTS=+399876543210,+391112223333
```

`SIGNAL_NUMBER` is the Signal account configured in `signal-cli-rest-api`. `SIGNAL_RECIPIENTS` is a comma-separated list of recipient numbers.

The adapter sends `POST /v2/send` with `message`, `number`, and `recipients`.

```ts
import { signal } from "callmebot-notifier";

const channel = signal({
  baseUrl: process.env.SIGNAL_API_URL,
  number: process.env.SIGNAL_NUMBER ?? "",
  recipients: (process.env.SIGNAL_RECIPIENTS ?? "").split(",").filter(Boolean)
});

await channel.send("Deployment complete");
```

Keep the Signal REST API private or protect it behind a trusted network/auth proxy. Do not expose it directly to the internet.
