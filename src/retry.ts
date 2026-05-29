export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  retries: number,
  minDelayMs: number,
  maxDelayMs: number
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= retries) break;
      const delay = Math.min(maxDelayMs, minDelayMs * 2 ** attempt);
      await sleep(delay);
    }
  }
  throw lastError;
}
