import { AUTH_ACCESS_COOKIE } from '@packages/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const jar = await cookies();
  const token = jar.get(AUTH_ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ success: true, data: { token } });
}
