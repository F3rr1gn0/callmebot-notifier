import packageJson from "../../package.json";
import { notify, summarizeNotifyResult } from "../notify.js";
import { ValidationError } from "../errors.js";
import { buildChannel, canonicalChannel, configuredChannels, channelRegistry, type CliChannelName } from "./channels.js";
import { configPath, loadConfig, maskConfig, saveConfig, setPath, unsetPath, pathParts, type CliConfig } from "./config-store.js";
import { helpText, parseArgs } from "./args.js";
import { readStdin } from "./stdin.js";
import type { NotifyResult } from "../types.js";

const safeError = (error: unknown) => (error instanceof Error ? error.message : String(error))
  .replace(/([?&](?:apikey|token|pass|password|secret|key))=[^&\s]+/gi, "$1=[redacted]")
  .replace(/\b(apikey|token|pass|password|secret|key)\s*([:=])\s*[^\s,;]+/gi, "$1$2[redacted]");

function outputResult(result: NotifyResult, options: ReturnType<typeof parseArgs>) {
  const summary = summarizeNotifyResult(result);
  if (options.json) process.stdout.write(`${JSON.stringify(summary)}\n`);
  else if (!options.quiet) process.stdout.write(result.ok ? `✓ Notification sent via ${result.deliveredBy}\n` : `✗ Notification failed: ${result.attempts.at(-1)?.error ?? "delivery failed"}\n`);
  return result.ok ? 0 : 1;
}

function parseConfigValue(path: string, value: string): unknown {
  if (path.endsWith(".port")) { const port = Number(value); if (!Number.isInteger(port) || port < 1) throw new ValidationError("port must be a positive integer"); return port; }
  if (path.endsWith(".secure")) { if (value !== "true" && value !== "false") throw new ValidationError("secure must be true or false"); return value === "true"; }
  return value;
}

async function configCommand(args: string[], path: string) {
  const config = await loadConfig(path); const action = args[1] ?? "get";
  if (action === "get") {
    const key = args[2]; let value: unknown = maskConfig(config);
    if (key) { pathParts(key); value = maskConfig(key.split(".").reduce<unknown>((current, part) => current && typeof current === "object" ? (current as Record<string, unknown>)[part] : undefined, config), key); }
    process.stdout.write(`${typeof value === "string" ? value : JSON.stringify(value, null, 2)}\n`); return 0;
  }
  if (action === "set") {
    if (!args[2] || args[3] === undefined) throw new ValidationError("usage: config set <key> <value>");
    await saveConfig(setPath(config, args[2], parseConfigValue(args[2], args.slice(3).join(" "))), path); return 0;
  }
  if (action === "unset") {
    if (!args[2]) throw new ValidationError("usage: config unset <key>");
    await saveConfig(unsetPath(config, args[2]), path); return 0;
  }
  if (action === "default") {
    if (!args[2]) throw new ValidationError("usage: config default <channel>");
    await saveConfig({ ...config, defaultChannel: canonicalChannel(args[2]) }, path); return 0;
  }
  throw new ValidationError("config command must be get, set, unset, or default");
}

async function channelsCommand(config: CliConfig, env: NodeJS.ProcessEnv) {
  const configured = configuredChannels(config, env); const defaultChannel = config.defaultChannel ? canonicalChannel(config.defaultChannel) : undefined;
  for (const name of Object.keys(channelRegistry) as CliChannelName[]) process.stdout.write(`${name.padEnd(11)} yes   ${configured.includes(name) ? "yes" : "no"}          ${defaultChannel === name ? "yes" : "no"}\n`);
  process.stdout.write("webpush     advanced/no   no           no\n"); return 0;
}

function selectedChannels(options: ReturnType<typeof parseArgs>, config: CliConfig, env: NodeJS.ProcessEnv): CliChannelName[] {
  const requested = [options.channel, ...(options.fallback ?? [])].filter(Boolean).map((name) => canonicalChannel(name!));
  if (requested.length) return [...new Set(requested)];
  if (config.defaultChannel) return [canonicalChannel(config.defaultChannel)];
  const available = configuredChannels(config, env);
  if (available.length === 1) return available;
  if (available.length > 1) throw new ValidationError(`multiple channels configured; set a default with: cmb-notify config default <channel>`);
  throw new ValidationError("no channel configured; set credentials with config set or environment variables");
}

export async function runCli(argv = process.argv.slice(2), dependencies: { env?: NodeJS.ProcessEnv; stdinTTY?: boolean; configFile?: string } = {}) {
  const env = dependencies.env ?? process.env; const options = parseArgs(argv);
  if (options.help) { process.stdout.write(helpText); return 0; }
  if (options.version) { process.stdout.write(`${packageJson.version}\n`); return 0; }
  const path = dependencies.configFile ?? configPath(env);
  const commandIndex = argv.findIndex((item) => item === "config" || item === "channels" || item === "test");
  if (options.command === "config") return configCommand(argv.slice(commandIndex), path);
  const config = await loadConfig(path);
  if (options.command === "channels") return channelsCommand(config, env);
  const message = options.command === "test" ? "callmebot-notifier CLI test successful" : options.message ?? await readStdin(dependencies.stdinTTY);
  if (!message) throw new ValidationError("message is required (pass a message or pipe it on stdin)");
  const names = selectedChannels(options, config, env);
  const channels = names.map((name) => buildChannel(name, config, env));
  const routes = config.routes
    ? Object.fromEntries(Object.entries(config.routes).map(([severity, route]) => [severity, [...new Set(route.map((name) => buildChannel(canonicalChannel(name), config, env)))] ]))
    : undefined;
  const payload = options.title || options.severity ? { title: options.title, message, severity: options.severity } : message;
  const result = await notify({ channels, routes, message: payload, retry: options.retryAttempts || options.retryDelay !== undefined ? { attempts: options.retryAttempts ?? 1, delayMs: options.retryDelay ?? 0 } : undefined });
  return outputResult(result, options);
}

export async function main(argv = process.argv.slice(2)) {
  try { return await runCli(argv); } catch (error) {
    const options = (() => { try { return parseArgs(argv); } catch { return { json: false, quiet: false, debug: false }; } })();
    const message = safeError(error);
    if (options.json) process.stdout.write(`${JSON.stringify({ ok: false, error: message })}\n`); else process.stderr.write(`✗ ${message}\n`);
    if (options.debug && error instanceof Error && error.stack) process.stderr.write(`${error.stack}\n`);
    return error instanceof ValidationError || /invalid config|unknown channel|not configured|message is required/.test(message) ? 2 : 1;
  }
}
