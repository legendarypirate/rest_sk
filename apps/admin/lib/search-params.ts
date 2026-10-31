/** Build a GET query string, skipping empty values. */
export function toSearchParams(
  params: Record<string, string | number | boolean | undefined | null>,
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    query.set(key, String(value));
  }

  return query.toString();
}
