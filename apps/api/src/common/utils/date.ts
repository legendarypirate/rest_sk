/** Parse an ISO date (`YYYY-MM-DD`) as a UTC date-only value. */
export function toDateOnly(value: string): Date {
  return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
}

/** Serialize a nullable timestamp for transport. */
export function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}
