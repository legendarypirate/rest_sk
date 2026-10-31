import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from '@packages/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  const response = new NextResponse(null, { status: 204 });
  const expired = { path: '/', maxAge: 0 } as const;

  response.cookies.set(AUTH_ACCESS_COOKIE, '', expired);
  response.cookies.set(AUTH_REFRESH_COOKIE, '', expired);

  return response;
}
