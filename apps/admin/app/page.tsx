import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from '@packages/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_APP_HOME, ADMIN_LOGIN_PATH } from '@/lib/routes';

export default async function Home() {
  const jar = await cookies();
  const session = Boolean(
    jar.get(AUTH_REFRESH_COOKIE)?.value || jar.get(AUTH_ACCESS_COOKIE)?.value,
  );

  redirect(session ? ADMIN_APP_HOME : ADMIN_LOGIN_PATH);
}
