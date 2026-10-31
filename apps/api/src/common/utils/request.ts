export function clientMeta(
  headers: Record<string, string | string[] | undefined>,
) {
  const forwarded = headers['x-forwarded-for'];
  const ip =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded)
      ?.split(',')[0]
      ?.trim() ??
    (typeof headers['x-real-ip'] === 'string'
      ? headers['x-real-ip']
      : undefined);

  const userAgent = Array.isArray(headers['user-agent'])
    ? headers['user-agent'][0]
    : headers['user-agent'];

  return { ipAddress: ip, userAgent };
}
