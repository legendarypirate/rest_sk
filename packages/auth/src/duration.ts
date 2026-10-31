const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

export function parseDurationMs(value: string | number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value < 1_000_000 ? value * 1000 : value;
  }

  const normalized = String(value).trim();
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h|d|w)$/i.exec(normalized);

  if (!match) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  return amount * UNIT_MS[unit];
}

export function addDuration(from: Date, value: string | number): Date {
  return new Date(from.getTime() + parseDurationMs(value));
}
