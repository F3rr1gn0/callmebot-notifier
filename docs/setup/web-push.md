# Web Push Setup

## 1. Generate VAPID keys

Run once. Keep private key secret. Do not generate keys on every deploy.

```bash
npx web-push generate-vapid-keys --json
```

Save keys in server environment:

```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

Use a reachable contact address for VAPID subject:

```text
mailto:alerts@example.com
```

## 2. Register service worker

`public/sw.js`:

```js
self.addEventListener("push", (event) => {
  const body = event.data?.text() ?? "New notification";
  event.waitUntil(self.registration.showNotification("Alert", { body }));
});
```

## 3. Create browser subscription

Serve app over HTTPS. Send serialized subscription to your backend and store it per user/device.

```ts
const registration = await navigator.serviceWorker.register("/sw.js");
const publicKey = "<VAPID_PUBLIC_KEY>";
const applicationServerKey = Uint8Array.from(
  atob(publicKey.replace(/-/g, "+").replace(/_/g, "/")),
  (character) => character.charCodeAt(0)
);
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey
});

await fetch("/api/push-subscriptions", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(subscription)
});
```

Supply VAPID public key from your frontend configuration. Never expose private key.

## 4. Send notification

```ts
import { webpush } from "callmebot-notifier";

const channel = webpush({
  subscription: storedSubscription,
  vapidDetails: {
    subject: "mailto:alerts@example.com",
    publicKey: process.env.VAPID_PUBLIC_KEY ?? "",
    privateKey: process.env.VAPID_PRIVATE_KEY ?? ""
  },
  ttl: 60,
  urgency: "high"
});

await channel.send("Deployment complete");
```

## 5. Remove expired subscriptions

Push services return `404` or `410` when a browser subscription expires. Remove that subscription from storage; do not retry it.

## Notes

-> Browser subscription endpoint and keys are device-specific
-> Never expose `VAPID_PRIVATE_KEY` to browser
-> Payload is encrypted by Web Push protocol
-> Payload display logic lives in service worker
