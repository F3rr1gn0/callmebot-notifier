# n8n

HTTP Request node:
- Method: `POST`
- URL: `http://your-host:3000/notify`
- JSON body:

```json
{ "message": "Hello from n8n" }
```

Webhook flow:
- Webhook node receives payload
- HTTP Request node POSTs to `/webhook`

