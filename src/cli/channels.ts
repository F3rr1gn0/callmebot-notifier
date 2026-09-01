import { discord, email, gchat, signal, slack, teams, telegram, whatsapp } from "../channels/factories.js";
import type { NotificationChannel } from "../types.js";
import type { CliConfig } from "./config-store.js";

export type CliChannelName = "whatsapp" | "telegram" | "email" | "discord" | "slack" | "gchat" | "teams" | "signal";
type Definition = { aliases?: string[]; required: string[]; build: (config: Record<string, unknown>) => NotificationChannel };
export const channelRegistry: Record<CliChannelName, Definition> = {
  whatsapp: { required: ["phone", "apikey"], build: (c) => whatsapp(c as never) },
  telegram: { required: ["botToken", "chatId"], build: (c) => telegram(c as never) },
  email: { required: ["host", "from", "to"], build: (c) => email({ port: 587, secure: false, ...c } as never) },
  discord: { required: ["webhookUrl"], build: (c) => discord(c as never) },
  slack: { required: ["webhookUrl"], build: (c) => slack(c as never) },
  gchat: { aliases: ["google-chat", "googlechat"], required: ["webhookUrl"], build: (c) => gchat(c as never) },
  teams: { aliases: ["msteams"], required: ["webhookUrl"], build: (c) => teams(c as never) },
  signal: { required: ["number", "recipients"], build: (c) => signal({ ...c, recipients: typeof c.recipients === "string" ? c.recipients.split(",").map((v) => v.trim()).filter(Boolean) : c.recipients } as never) }
};
const envMap: Record<CliChannelName, Record<string, string[]>> = {
  whatsapp: { phone: ["PHONE"], apikey: ["APIKEY"] }, telegram: { botToken: ["TELEGRAM_BOT_TOKEN"], chatId: ["TELEGRAM_CHAT_ID"] },
  email: { host: ["SMTP_HOST"], port: ["SMTP_PORT"], secure: ["SMTP_SECURE"], user: ["SMTP_USER"], pass: ["SMTP_PASS"], from: ["EMAIL_FROM"], to: ["EMAIL_TO"] },
  discord: { webhookUrl: ["DISCORD_WEBHOOK_URL"] }, slack: { webhookUrl: ["SLACK_WEBHOOK_URL"] }, gchat: { webhookUrl: ["GCHAT_WEBHOOK_URL", "GOOGLE_CHAT_WEBHOOK_URL"] }, teams: { webhookUrl: ["TEAMS_WEBHOOK_URL", "MS_TEAMS_WEBHOOK_URL"] },
  signal: { number: ["SIGNAL_NUMBER"], recipients: ["SIGNAL_RECIPIENTS"], baseUrl: ["SIGNAL_API_URL"] }
};
export function canonicalChannel(input: string): CliChannelName {
  const name = input.toLowerCase(); const found = (Object.entries(channelRegistry) as [CliChannelName, Definition][]).find(([key, d]) => key === name || d.aliases?.includes(name));
  if (!found) throw new Error(`unknown channel ${input}`); return found[0];
}
export function resolveChannelConfig(name: CliChannelName, config: CliConfig, env: NodeJS.ProcessEnv): Record<string, unknown> {
  const result = { ...(config.channels?.[name] ?? {}) } as Record<string, unknown>;
  for (const [key, names] of Object.entries(envMap[name])) for (const envName of names) if (env[envName]?.trim()) { result[key] = key === "port" ? Number(env[envName]) : key === "secure" ? env[envName] === "true" : env[envName]!.trim(); break; }
  const missing = channelRegistry[name].required.filter((key) => result[key] === undefined || result[key] === "");
  if (missing.length) throw new Error(`${name} is not configured: missing ${missing.join(", ")}`);
  return result;
}
export function configuredChannels(config: CliConfig, env: NodeJS.ProcessEnv) {
  return (Object.keys(channelRegistry) as CliChannelName[]).filter((name) => { try { resolveChannelConfig(name, config, env); return true; } catch { return false; } });
}
export function buildChannel(name: CliChannelName, config: CliConfig, env: NodeJS.ProcessEnv) { return channelRegistry[name].build(resolveChannelConfig(name, config, env)); }
