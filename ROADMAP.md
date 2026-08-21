# Possible package evolutions

This document describes possible directions for evolving `callmebot-notifier` while preserving the current public API.

## Priorities

1. Isolate Node-specific adapters.
2. Extract shared HTTP behavior.
3. Stabilize channel results and errors.
4. Expand edge-runtime verification.
5. Evaluate optional peer dependencies.
6. Add integrations only when they fit the existing model.

## 1. Keep the core runtime-agnostic

Keep `core` limited to:

- public types;
- validation;
- errors;
- retry and timeout policies;
- message formatting;
- notification orchestration;
- logging interfaces.

The core should not import `express`, `nodemailer`, `web-push`, or Node built-ins.

## 2. Extract a shared HTTP client

WhatsApp, Telegram, and other HTTP channels currently repeat similar behavior. A shared internal HTTP helper could centralize:

- `fetch` injection;
- timeout and `AbortSignal` handling;
- retry policy;
- response parsing;
- status error handling;
- safe logging and redaction.

The helper must remain based on Web Fetch APIs and must not use Axios or Node HTTP modules.

## 3. Standardize channel results

The channel contract could evolve toward a consistent result shape:

```ts
interface NotificationChannel {
  readonly name: string;
  send(message: string, options?: SendOptions): Promise<NotificationResult>;
}
```

This would make status codes, attempts, provider message IDs, and provider metadata available consistently. Existing `send(message)` calls must remain valid.

## 4. Separate clients from orchestration adapters

Use explicit client constructors for provider operations:

```ts
createWhatsAppClient(config)
createTelegramClient(config)
```

Keep convenience factories for orchestration:

```ts
whatsapp(config)
telegram(config)
```

Clients handle provider HTTP calls. Channels adapt clients to the common notification interface.

## 5. Add granular entrypoints

Possible future entrypoints:

```text
/core
/http
/whatsapp
/telegram
/email
/webpush
/express
```

`/whatsapp` and `/telegram` should remain edge-compatible. Node-only integrations must stay isolated in their own entrypoints.

## 6. Make Node integrations lazy

Before moving Node packages to optional peer dependencies, remove static imports from the root facade where possible.

Then evaluate:

- `express` as an optional peer dependency;
- `nodemailer` as an optional peer dependency;
- `web-push` as an optional peer dependency.

This can reduce installation size for edge users, but must not break existing root imports. A migration note and clear runtime errors would be required.

## 7. Strengthen validation and security

Centralize configuration validation and continue to enforce:

- required fields;
- valid URLs and protocols;
- bounded timeout and retry values;
- safe token redaction;
- no secrets in logs;
- no credentials in URLs when provider APIs support headers or request bodies.

Run dependency audit in CI and keep the lockfile updated.

## 8. Expand test coverage

Maintain tests for:

- source-level behavior;
- ESM imports;
- CommonJS `require`;
- package imports after build;
- package imports from an npm tarball;
- fresh checkout with no `dist` directory;
- Cloudflare-like Web API runtime;
- bundle scans for Node-only modules.

Add a small consumer fixture when package export behavior changes.

## 9. Improve release automation

Recommended release sequence:

```text
npm ci
npm audit
npm run typecheck
npm run build
npm test
npm pack --dry-run
npm publish
```

If release frequency increases, Changesets could automate versioning and changelog generation. Do not introduce it until release overhead justifies the additional tooling.

## 10. Add integrations selectively

New channels should follow the existing adapter model and use Web APIs where possible. Good candidates are providers with simple webhook or Fetch-based APIs.

Avoid adding integrations that require large runtime dependencies unless they provide clear user value.

## Suggested implementation order

```text
shared HTTP helper
    -> lazy Node adapters
    -> optional peer dependency evaluation
    -> standardized results/errors
    -> edge runtime matrix
    -> additional providers
```

The main compatibility rule remains: the root import continues to work, while edge users can import only the HTTP-compatible subpaths.
