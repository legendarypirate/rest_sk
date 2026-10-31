'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@packages/ui/components/sonner';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@packages/ui/components/field';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { DialogForm } from '@packages/ui/main/MDialog';
import { CancelButton, SaveButton } from '@packages/ui/main/MButtons';
import { MPassword, MSwitch } from '@packages/ui/main/MFields';
import type { UserDetail } from '@packages/types';

import { getApiErrorMessage } from '@/lib/api-error';

import {
  changeUserPasswordSchema,
  getChangeUserPasswordDefaults,
  toChangeUserPasswordDto,
  useUserMutate,
  type ChangeUserPasswordFormData,
} from '../hooks';

type UserPasswordFormProps = {
  user: UserDetail;
  onSuccess?: () => void;
};

export function UserPasswordForm({ user, onSuccess }: UserPasswordFormProps) {
  const { hideDialog } = useDialog();
  const { update } = useUserMutate();
  const form = useForm<ChangeUserPasswordFormData>({
    resolver: zodResolver(changeUserPasswordSchema),
    defaultValues: getChangeUserPasswordDefaults(),
    mode: 'onTouched',
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const onSubmit = async (data: ChangeUserPasswordFormData) => {
    try {
      await update.mutateAsync({
        id: user.id,
        input: toChangeUserPasswordDto(data, user.rowVersion),
      });
      toast.success('Нууц үг амжилттай солигдлоо');
      hideDialog();
      onSuccess?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <DialogForm
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      actions={
        <>
          <CancelButton
            text="Болих"
            icon={false}
            tooltip={false}
            onClick={hideDialog}
            disabled={update.isPending}
          />
          <SaveButton
            type="submit"
            icon={false}
            tooltip={false}
            text={update.isPending ? 'Хадгалж байна…' : 'Хадгалах'}
            disabled={update.isPending}
          />
        </>
      }
    >
      <FieldGroup className="grid w-full grid-cols-1 gap-4">
        <Field>
          <FieldLabel htmlFor="user-new-password" data-required>Шинэ нууц үг</FieldLabel>
          <MPassword
            id="user-new-password"
            autoComplete="new-password"
            disabled={update.isPending}
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          <FieldError errors={[errors.password]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="user-confirm-new-password" data-required>Баталгаажуулах</FieldLabel>
          <MPassword
            id="user-confirm-new-password"
            autoComplete="new-password"
            disabled={update.isPending}
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
        <Field orientation="horizontal" className="items-center justify-between gap-4">
          <div className="space-y-1">
            <FieldLabel htmlFor="user-password-must-change">
              Дараагийн нэвтрэлтээр солих
            </FieldLabel>
            <FieldDescription>
              Идэвхтэй бол хэрэглэгч дараагийн нэвтрэлтээр нууц үгээ солино.
            </FieldDescription>
          </div>
          <Controller
            control={control}
            name="mustChangePassword"
            render={({ field }) => (
              <MSwitch
                id="user-password-must-change"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={update.isPending}
              />
            )}
          />
        </Field>
      </FieldGroup>
    </DialogForm>
  );
}
