const DURATION_UNITS: Record<string, string> = {
  s: 'секунд',
  m: 'минут',
  h: 'цаг',
  d: 'хоног',
};

export function formatYesNo(value: boolean) {
  return value ? 'Тийм' : 'Үгүй';
}

export function formatDurationMs(ms: number) {
  if (ms % 3_600_000 === 0) {
    const hours = ms / 3_600_000;
    return `${hours} цаг`;
  }

  if (ms % 60_000 === 0) {
    const minutes = ms / 60_000;
    return `${minutes} минут`;
  }

  return `${ms} мс`;
}

export function formatDurationLabel(value: string) {
  const match = /^(\d+)([smhd])$/.exec(value);

  if (!match) {
    return value;
  }

  const amount = Number(match[1]);
  const unit = DURATION_UNITS[match[2]] ?? match[2];
  return `${amount} ${unit}`;
}
