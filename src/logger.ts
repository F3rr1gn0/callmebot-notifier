import type { LoggerLike, LoggerLevel } from "./types.js";

const order: Record<LoggerLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
};

export function createLogger(logger: LoggerLike = console, level: LoggerLevel = "info") {
  const enabled = (wanted: LoggerLevel) => order[level] >= order[wanted];
  return {
    error: (...args: unknown[]) => enabled("error") && logger.error(...args),
    warn: (...args: unknown[]) => enabled("warn") && logger.warn(...args),
    info: (...args: unknown[]) => enabled("info") && logger.info(...args),
    debug: (...args: unknown[]) => enabled("debug") && logger.debug(...args)
  };
}
