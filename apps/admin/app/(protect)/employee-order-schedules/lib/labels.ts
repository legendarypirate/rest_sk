export const WEEKDAYS = [
  { value: 1, label: 'Да' },
  { value: 2, label: 'Мя' },
  { value: 3, label: 'Лх' },
  { value: 4, label: 'Пү' },
  { value: 5, label: 'Ба' },
  { value: 6, label: 'Бя' },
  { value: 7, label: 'Ня' },
] as const;

export function weekdayLabels(days: number[]) {
  return days
    .map((day) => WEEKDAYS.find((row) => row.value === day)?.label)
    .filter(Boolean)
    .join(', ');
}
