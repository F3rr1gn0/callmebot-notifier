# Email Setup with Gmail

## 1. Enable app password

-> Turn on 2-Step Verification in Google Account
-> Create an App Password
-> Use app password, not normal Gmail password

Google doc:
-> [Sign in with app passwords](https://support.google.com/mail/answer/185833)

## 2. Add env

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourname@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=yourname@gmail.com
EMAIL_TO=yourname+callmebot@gmail.com
```

## 3. Smoke test

```ts
import { email } from "callmebot-notifier";

const channel = email({
  host: process.env.SMTP_HOST ?? "",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.EMAIL_FROM ?? "",
  to: process.env.EMAIL_TO ?? ""
});

await channel.send("Hello");
```

## Notes

-> `EMAIL_FROM` should usually match Gmail address unless alias is verified
-> `EMAIL_TO` can be any valid recipient
-> use `+tag` alias for inbox filtering
