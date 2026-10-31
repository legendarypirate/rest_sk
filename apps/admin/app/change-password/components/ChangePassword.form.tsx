'use client';

import { Button } from '@packages/ui/components/button';
import { FieldGroup } from '@packages/ui/components/field';
import { cn } from '@packages/ui/lib/utils';
import { CancelButton } from '@packages/ui/main/MButtons';
import { MCard, MCardContent } from '@packages/ui/main/MCard';
import { MField, MPassword } from '@packages/ui/main/MFields';
import Image from 'next/image';
import type { ComponentProps } from 'react';
import { Controller } from 'react-hook-form';

import { useLogout } from '@/hooks/use.logout';

import { useChangePasswordForm } from '../hooks/use.change-password-form';

type ChangePasswordFormProps = ComponentProps<'div'> & {
  email?: string | null;
};

export function ChangePasswordForm({
  className,
  email,
  ...props
}: ChangePasswordFormProps) {
  const { form, onSubmit, isSubmitting } = useChangePasswordForm(email);
  const logout = useLogout();
  const busy = isSubmitting || logout.isPending;

  return (
    <div className={cn('gap-6 flex flex-col', className)} {...props}>
      <MCard className="p-0 overflow-hidden">
        <MCardContent className="p-0 md:grid-cols-2 grid">
          <form className="p-24 md:p-8" onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <div className="gap-2 flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Нууц үг солих</h1>
                <p className="text-balance text-muted-foreground">
                  Үргэлжлүүлэхийн тулд хуучин нууц үгээ оруулаад шинэ нууц үг
                  тохируулна уу.
                </p>
              </div>

              <Controller
                control={form.control}
                name="currentPassword"
                render={({ field, fieldState }) => (
                  <MField
                    label="Хуучин нууц үг"
                    htmlFor="currentPassword"
                    error={fieldState.error?.message}
                  >
                    <MPassword
                      {...field}
                      id="currentPassword"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      disabled={busy}
                    />
                  </MField>
                )}
              />

              <Controller
                control={form.control}
                name="newPassword"
                render={({ field, fieldState }) => (
                  <MField
                    label="Шинэ нууц үг"
                    htmlFor="newPassword"
                    error={fieldState.error?.message}
                  >
                    <MPassword
                      {...field}
                      id="newPassword"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      disabled={busy}
                    />
                  </MField>
                )}
              />

              <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <MField
                    label="Шинэ нууц үг баталгаажуулах"
                    htmlFor="confirmPassword"
                    error={fieldState.error?.message}
                  >
                    <MPassword
                      {...field}
                      id="confirmPassword"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      disabled={busy}
                    />
                  </MField>
                )}
              />

              <Button
                type="submit"
                disabled={busy}
                className="shadow-md dark:text-white w-full cursor-pointer"
                size="lg"
              >
                {isSubmitting ? 'Солиж байна…' : 'Нууц үг солих'}
              </Button>
              <CancelButton
                type="button"
                text="Болих"
                tooltip={false}
                className="w-full"
                disabled={busy}
                onClick={() => logout.mutate()}
              />
            </FieldGroup>
          </form>
          <div className="relative hidden min-h-80 overflow-hidden bg-muted md:block">
            <Image
              src="/meal.jpg"
              alt="Restaurant"
              fill
              priority
              className="object-contain p-8"
              sizes="(min-width: 768px) 28rem, 0px"
            />
          </div>
        </MCardContent>
      </MCard>
    </div>
  );
}
