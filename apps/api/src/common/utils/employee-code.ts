/** Trim HR / kiosk employee codes for stable DB lookups. */
export function normalizeEmployeeCode(value: string) {
  return value.trim();
}

export function employeeCodeKey(value: string) {
  return normalizeEmployeeCode(value).toLowerCase();
}
