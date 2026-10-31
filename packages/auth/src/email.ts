export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function emailLocalPart(value: string): string {
  const at = value.indexOf('@');
  return at === -1 ? value : value.slice(0, at);
}
