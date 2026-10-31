import { ADMIN_PASSWORD_CHANGED_PARAM } from '@/lib/routes';

import { LoginForm, PasswordChangedNotice } from './components';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params[ADMIN_PASSWORD_CHANGED_PARAM];
  const passwordChanged = Array.isArray(raw) ? raw[0] === '1' : raw === '1';

  return (
    <main className="flex flex-1 items-center justify-center p-6 md:p-10">
      <PasswordChangedNotice show={passwordChanged} />
      <div className="w-full max-w-sm md:max-w-lg">
        <LoginForm />
      </div>
    </main>
  );
}
