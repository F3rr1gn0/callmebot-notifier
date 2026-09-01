import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { z } from "zod";

const channelSchema = z.object({
  phone: z.string().optional(), apikey: z.string().optional(), botToken: z.string().optional(), chatId: z.string().optional(),
  webhookUrl: z.string().optional(), number: z.string().optional(), recipients: z.union([z.string(), z.array(z.string())]).optional(), baseUrl: z.string().optional(),
  host: z.string().optional(), port: z.number().int().positive().optional(), secure: z.boolean().optional(), user: z.string().optional(), pass: z.string().optional(), from: z.string().optional(), to: z.string().optional()
}).strict();
export const configSchema = z.object({ defaultChannel: z.string().optional(), channels: z.record(channelSchema).optional(), routes: z.record(z.array(z.string())).optional() }).strict();
export type CliConfig = z.infer<typeof configSchema>;

export function configPath(env: NodeJS.ProcessEnv = process.env) {
  const root = env.XDG_CONFIG_HOME?.trim() || join(homedir(), ".config");
  return join(root, "callmebot-notifier", "config.json");
}

export async function loadConfig(path = configPath()): Promise<CliConfig> {
  try {
    const raw = await readFile(path, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return configSchema.parse(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    if (error instanceof SyntaxError || error instanceof z.ZodError) throw new Error(`invalid config file ${path}`);
    throw error;
  }
}

export async function saveConfig(config: CliConfig, path = configPath()) {
  const valid = configSchema.parse(config);
  const directory = join(path, "..");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temp = join(directory, `.config.${process.pid}.${Date.now()}.tmp`);
  await writeFile(temp, `${JSON.stringify(valid, null, 2)}\n`, { mode: 0o600 });
  try { await chmod(temp, 0o600); } catch { /* Windows */ }
  await rename(temp, path);
  try { await chmod(path, 0o600); } catch { /* Windows */ }
}

const forbidden = new Set(["__proto__", "prototype", "constructor"]);
export function pathParts(path: string) {
  const parts = path.split(".");
  if (!path || parts.some((part) => !part || forbidden.has(part))) throw new Error("invalid config path");
  return parts;
}
export function setPath(root: CliConfig, path: string, value: unknown): CliConfig {
  const parts = pathParts(path); const next = structuredClone(root) as Record<string, unknown>; let cursor = next;
  for (const part of parts.slice(0, -1)) { const current = cursor[part]; cursor[part] = current && typeof current === "object" ? { ...(current as object) } : {}; cursor = cursor[part] as Record<string, unknown>; }
  cursor[parts.at(-1)!] = value; return configSchema.parse(next);
}
export function unsetPath(root: CliConfig, path: string): CliConfig {
  const parts = pathParts(path); const next = structuredClone(root) as Record<string, unknown>; let cursor: Record<string, unknown> = next;
  for (const part of parts.slice(0, -1)) { if (!cursor[part] || typeof cursor[part] !== "object") return root; cursor = cursor[part] as Record<string, unknown>; }
  delete cursor[parts.at(-1)!]; return configSchema.parse(next);
}

const secret = /token|secret|password|pass|apikey|apiKey|webhookUrl|privateKey/i;
export function maskConfig(value: unknown, key = ""): unknown {
  if (secret.test(key) && typeof value === "string" && value) return value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : "[redacted]";
  if (Array.isArray(value)) return value.map((item) => maskConfig(item, key));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, maskConfig(v, k)]));
  return value;
}
