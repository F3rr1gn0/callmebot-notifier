# Changelog

## 1.10.2

-> Fixed package export smoke test resolution in CI

## 1.10.1

-> Fixed publish workflow build order

## 1.10.0

-> Added subpath exports
-> Added Cloudflare Workers-compatible WhatsApp and Telegram entrypoints
-> Isolated Node-specific integrations
-> Preserved root import backward compatibility

## 1.6.3

-> README reworked

## 1.6.2

-> Added npm publish workflow with GitHub trusted publishing

## 1.6.1
-> Added GitHub Action smoke workflow and Marketplace badge
-> Added GitHub Action usage examples and failure alert flow

## 1.6.0

-> Added Google Chat and Microsoft Teams channels
-> Added env bootstrap for Google Chat and Teams webhooks
-> Added docs for WhatsApp, Telegram, Discord, Slack, Google Chat, Teams, Gmail, and GitHub Actions
-> Added setup docs and release prep for GitHub Action repo

## 1.5.2

-> Coverage refresh and README cleanup

## 1.5.1

-> Added `onResult` and `onError` hooks
-> Added structured logs for delivery and failure paths
-> Added explicit redaction in hook/log payloads
-> Added tests for retry, fallback, and routing

## 1.5.0

-> Added severity routing
-> Added `notify.alert()` and `notify.incident()`
-> Added unified template payloads

## 1.4.0

-> Added `fromEnv()` for zero-friction setup
-> Added clearer env validation errors
-> Reworked README toward a generic notification library
-> Removed `process.env.X!` from examples
-> Simplified quick start and Express example

## 1.3.1

-> Formatter presets and docs refresh

## 1.3.0

-> Discord and Slack plugin channels

## 1.2.0

-> Added `notify()` helper
-> Stronger redaction

## 1.1.0

-> Security upgrade

## 1.0.1

-> Version bump

## 1.0.0

-> Initial release
