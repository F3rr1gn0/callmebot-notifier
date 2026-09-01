export async function readStdin(isTTY = process.stdin.isTTY) {
  if (isTTY) return undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  const value = Buffer.concat(chunks).toString("utf8").trim();
  return value || undefined;
}
