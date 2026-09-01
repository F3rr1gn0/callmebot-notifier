import type { NotificationSeverity } from "../types.js";
import { ValidationError } from "../errors.js";

export type CliOptions = {
  channel?: string;
  fallback?: string[];
  title?: string;
  severity?: NotificationSeverity;
  retryAttempts?: number;
  retryDelay?: number;
  quiet: boolean;
  json: boolean;
  debug: boolean;
  help: boolean;
  version: boolean;
  message?: string;
};

const severities = ["info", "warn", "error", "critical"] as const;
const valueOptions = new Set(["channel", "fallback", "title", "severity", "retry-attempts", "retry-delay"]);

export function parseArgs(argv: string[]): CliOptions & { command?: "channels" | "test" | "config" } {
  const values: Record<string, string> = {};
  const positional: string[] = [];
  let quiet = false, json = false, debug = false, help = false, version = false;
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]!;
    if (token === "--") { positional.push(...argv.slice(i + 1)); break; }
    if (token.startsWith("--")) {
      const key = token.slice(2);
      if (key === "quiet") quiet = true;
      else if (key === "json") json = true;
      else if (key === "debug") debug = true;
      else if (key === "help") help = true;
      else if (key === "version") version = true;
      else if (valueOptions.has(key)) {
        const value = argv[++i];
        if (!value || value.startsWith("--")) throw new ValidationError(`missing value for --${key}`);
        values[key] = value;
      } else throw new ValidationError(`unknown option --${key}`);
    } else positional.push(token);
  }
  const command = positional[0] === "channels" || positional[0] === "test" || positional[0] === "config"
    ? positional.shift() as "channels" | "test" | "config" : undefined;
  const message = positional.length ? positional.join(" ") : undefined;
  const severity = values.severity as NotificationSeverity | undefined;
  if (severity && !(severities as readonly string[]).includes(severity)) throw new ValidationError("severity must be one of: info, warn, error, critical");
  const retryAttempts = values["retry-attempts"] === undefined ? undefined : Number(values["retry-attempts"]);
  const retryDelay = values["retry-delay"] === undefined ? undefined : Number(values["retry-delay"]);
  if (retryAttempts !== undefined && (!Number.isInteger(retryAttempts) || retryAttempts < 1)) throw new ValidationError("retry-attempts must be an integer >= 1");
  if (retryDelay !== undefined && (!Number.isFinite(retryDelay) || retryDelay < 0)) throw new ValidationError("retry-delay must be >= 0");
  return { command, channel: values.channel, fallback: values.fallback?.split(",").map((v) => v.trim()).filter(Boolean), title: values.title, severity, retryAttempts, retryDelay, quiet, json, debug, help, version, message };
}

export const helpText = `Usage:
  cmb-notify "Backup completed"
  cmb-notify --channel telegram "Deploy completed"
  cmb-notify --severity critical "Server down"
  cmb-notify --channel telegram --fallback whatsapp,email "Server down"
  echo "Job completed" | cmb-notify

Commands: channels, test, config
Severity: info, warn, error, critical
Config: config set|unset|get|default ...
Aliases: callmebot-notifier (canonical), cmb-notify (short)
`;
