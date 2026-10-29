export function resolveContentApiBase(input: {
  internal?: string;
  publicBase?: string;
  server: boolean;
}): string {
  const internal = input.internal?.trim() ?? "";
  const publicBase = input.publicBase?.trim() ?? "";
  const raw = input.server && internal ? internal : publicBase;
  return raw.replace(/\/$/, "");
}
