/** Trim HR / kiosk employee codes for stable DB lookups. */
export function normalizeEmployeeCode(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  if (/^[\d\s\-_.]+$/.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, '');
    return digits.length > 0 ? digits : trimmed;
  }
  return trimmed;
}

/** Legacy single key (alphanumeric, lowercased). */
export function employeeCodeKey(value: string) {
  return normalizeEmployeeCode(value).toLowerCase();
}

/**
 * Equivalent keys for the same HR code (e.g. `110674`, `0110674`, padded to 6).
 * MLOS and mobile may send different zero-padding.
 */
export function employeeCodeLookupKeys(value: string): string[] {
  const raw = normalizeEmployeeCode(value);
  if (!raw) {
    return [];
  }

  const keys = new Set<string>();
  keys.add(raw.toLowerCase());
  keys.add(raw);

  if (/^\d+$/.test(raw)) {
    const stripped = raw.replace(/^0+/, '') || '0';
    keys.add(stripped);
    keys.add(stripped.toLowerCase());
    for (const width of [4, 5, 6, 7, 8, 10, 12]) {
      keys.add(stripped.padStart(width, '0'));
    }
    if (raw !== stripped) {
      keys.add(raw.padStart(raw.length, '0'));
    }
  }

  return [...keys];
}

export function registerEmployeeCodeKeys<T>(map: Map<string, T>, code: string, value: T) {
  const normalized = normalizeEmployeeCode(code);
  const seeds = normalized.length > 0 ? [code, normalized] : [code];
  const keys = new Set<string>();
  for (const seed of seeds) {
    for (const key of employeeCodeLookupKeys(seed)) {
      keys.add(key);
      keys.add(key.toLowerCase());
    }
  }
  for (const key of keys) {
    map.set(key, value);
  }
}

export function lookupByEmployeeCode<T>(map: Map<string, T>, code: string): T | undefined {
  for (const key of employeeCodeLookupKeys(code)) {
    const hit = map.get(key.toLowerCase()) ?? map.get(key);
    if (hit !== undefined) {
      return hit;
    }
  }
  return undefined;
}
