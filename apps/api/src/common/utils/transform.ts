export function emptyToUndefined({ value }: { value: unknown }) {
  return typeof value === 'string' && value.trim() === '' ? undefined : value;
}

/** Query-string booleans arrive as `"true"` / `"false"`. */
export function parseQueryBoolean({
  value,
}: {
  value: unknown;
}): boolean | undefined {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
}
