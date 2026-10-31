'use client';

import { Button } from '@packages/ui/components/button';
import { FieldGroup } from '@packages/ui/components/field';
import { cn } from '@packages/ui/lib/utils';
import { MCard, MCardContent } from '@packages/ui/main/MCard';
import { MField, MInput, MPassword } from '@packages/ui/main/MFields';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Controller } from 'react-hook-form';

import { useLoginForm } from '../hooks/use.login-form';
import { validationMessage } from '../lib/validation-message';

export function LoginForm({ className, ...props }: ComponentProps<'div'>) {
  const { form, onSubmit, isSubmitting } = useLoginForm();

  return (
    <div className={cn(className)} {...props}>
      <MCard className="p-0 overflow-hidden">
        <MCardContent className="p-0">
          <form className="p-24 md:p-8" onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <div className="gap-2 flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Админ удирдлагын систем</h1>
                <p className="text-balance text-muted-foreground">
                  Restaurant Admin системд нэвтрэх
                </p>
              </div>

              <Controller
                control={form.control}
                name="identifier"
                render={({ field, fieldState }) => (
                  <MField
                    label="И-мэйл эсвэл нэвтрэх нэр"
                    htmlFor="identifier"
                    error={validationMessage(fieldState.error?.message)}
                  >
                    <MInput
                      {...field}
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      placeholder="admin@food-order.local"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                  </MField>
                )}
              />

              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <MField
                    error={validationMessage(fieldState.error?.message)}
                    label="Нууц үг"
                  >
                    <MPassword
                      {...field}
                      id="password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                  </MField>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="shadow-md dark:text-white w-full cursor-pointer"
                size="lg"
              >
                {isSubmitting ? 'Нэвтэрч байна…' : 'Нэвтрэх'}
              </Button>

              <Link
                href="/forgot-password"
                className="text-sm ml-auto underline-offset-2 hover:underline"
              >
                Нууц үг мартсан?
              </Link>
            </FieldGroup>
          </form>
        </MCardContent>
      </MCard>
    </div>
  );
}
