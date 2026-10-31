export function statusPatch<TStatus extends string>(
  status: TStatus,
  rowVersion?: number,
) {
  return typeof rowVersion === 'number' ? { status, rowVersion } : { status };
}
