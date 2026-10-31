import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from '@packages/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  ADMIN_APP_HOME,
  ADMIN_CHANGE_PASSWORD_PATH,
  ADMIN_FORGOT_PASSWORD_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_PASSWORD_CHANGED_PARAM,
  ADMIN_RESET_PASSWORD_PATH,
  ADMIN_VERIFY_EMAIL_PATH,
} from '@/lib/routes';

const PUBLIC_PATHS = [ADMIN_LOGIN_PATH, ADMIN_CHANGE_PASSWORD_PATH, ADMIN_FORGOT_PASSWORD_PATH, ADMIN_RESET_PASSWORD_PATH, ADMIN_VERIFY_EMAIL_PATH];

function hasSessionCookie(request: NextRequest) {
  return Boolean(
    request.cookies.get(AUTH_REFRESH_COOKIE)?.value ||
      request.cookies.get(AUTH_ACCESS_COOKIE)?.value,
  );
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = hasSessionCookie(request);

  if (!session && !isPublicPath(pathname)) {
    const login = new URL(ADMIN_LOGIN_PATH, request.url);
    if (pathname !== '/' && pathname !== ADMIN_LOGIN_PATH) {
      login.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(login);
  }

  if (
    session &&
    pathname === ADMIN_LOGIN_PATH &&
    request.nextUrl.searchParams.get(ADMIN_PASSWORD_CHANGED_PARAM) === '1'
  ) {
    return NextResponse.next();
  }

  if (session && (pathname === ADMIN_LOGIN_PATH || pathname === '/')) {
    return NextResponse.redirect(new URL(ADMIN_APP_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
