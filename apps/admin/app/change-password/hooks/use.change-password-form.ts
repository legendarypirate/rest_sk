'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from './schema';
import { useChangePassword } from './use.change-password';

export function useChangePasswordForm(email?: string | null) {
  const mutation = useChangePassword();
  const schema = useMemo(() => changePasswordFormSchema(email), [email]);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  });

  return {
    form,
    onSubmit,
    isSubmitting: mutation.isPending || form.formState.isSubmitting,
  };
}
