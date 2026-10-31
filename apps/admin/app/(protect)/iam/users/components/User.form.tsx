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
import { MDatalist } from '@packages/ui/main/MData.list';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { DialogForm } from '@packages/ui/main/MDialog';
import {
  CancelButton,
  CreateButton,
  SaveButton,
} from '@packages/ui/main/MButtons';
import {
  MaskedInput,
  MInput,
  MPassword,
  MSwitch,
} from '@packages/ui/main/MFields';
import type { UserListItem } from '@packages/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { getUser } from '@/services/iam/users.service';
import { listRolesPicker } from '@/services/iam/roles.service';
import { PlatformPermission } from '@/types/routes';

import {
  createUserSchema,
  getCreateUserDefaults,
  getUpdateUserDefaults,
  rolesChanged,
  toCreateUserDto,
  toUpdateUserDto,
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
  useUserMutate,
  usersQueryKey,
} from '../hooks';

type UserFormProps = {
  mode: 'add' | 'edit';
  user?: UserListItem;
  onSuccess?: () => void;
};

export function UserForm({ mode, user, onSuccess }: UserFormProps) {
  const { hideDialog } = useDialog();
  const { can } = usePermission();
  const canAssignRoles = can(PlatformPermission.RolesManage);
  const { create, update } = useUserMutate();

  const isCreate = mode === 'add';
  const isLoading = create.isPending || update.isPending;

  const userQuery = useQuery({
    queryKey: [...usersQueryKey, 'detail', user?.id],
    queryFn: () => getUser(user!.id),
    enabled: !isCreate && Boolean(user?.id),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const rolesQuery = useQuery({
    queryKey: ['iam', 'roles', 'picker'],
    queryFn: listRolesPicker,
    enabled: canAssignRoles,
  });

  const detail = userQuery.data;
  const isSystemUser = Boolean(detail?.isSystemUser);

  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isCreate ? createUserSchema : updateUserSchema),
    defaultValues: isCreate ? getCreateUserDefaults() : getUpdateUserDefaults(),
    mode: 'onTouched',
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (isCreate || !detail) {
      return;
    }

    form.reset(getUpdateUserDefaults(detail));
  }, [detail, form, isCreate]);

  const disabled = isLoading || isSystemUser;
  const roleOptions = (rolesQuery.data?.items ?? []).map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    try {
      if (isCreate) {
        await create.mutateAsync(
          toCreateUserDto(data as CreateUserFormData, canAssignRoles),
        );
        toast.success('Хэрэглэгч амжилттай үүслээ');
      } else if (detail) {
        const values = data as UpdateUserFormData;
        await update.mutateAsync({
          id: detail.id,
          input: toUpdateUserDto(values, detail.rowVersion),
          roleIds:
            canAssignRoles &&
            rolesChanged(
              detail.assignments.map((assignment) => assignment.roleId),
              values.roleIds,
            )
              ? values.roleIds
              : undefined,
        });
        toast.success('Хэрэглэгч амжилттай шинэчлэгдлээ');
      }

      hideDialog();
      onSuccess?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  if (!isCreate && userQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Уншиж байна…</p>;
  }

  if (!isCreate && userQuery.error) {
    return (
      <p className="text-sm text-destructive">
        {getApiErrorMessage(userQuery.error)}
      </p>
    );
  }

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
            disabled={isLoading}
          />
          {isCreate ? (
            <CreateButton
              type="submit"
              icon={false}
              tooltip={false}
              text={isLoading ? 'Үүсгэж байна…' : 'Үүсгэх'}
              disabled={disabled}
            />
          ) : (
            <SaveButton
              type="submit"
              icon={false}
              tooltip={false}
              text={isLoading ? 'Хадгалж байна…' : 'Хадгалах'}
              disabled={disabled}
            />
          )}
        </>
      }
    >
      <FieldGroup className="gap-4 md:grid-cols-2 grid w-full grid-cols-1">
        <Field>
          <FieldLabel htmlFor="user-email" data-required>Имэйл</FieldLabel>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <MaskedInput
                id="user-email"
                mask="email"
                autoComplete="off"
                placeholder="user@example.com"
                disabled={disabled}
                aria-invalid={Boolean(errors.email)}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="user-username">Нэвтрэх нэр</FieldLabel>
          <MInput
            id="user-username"
            autoComplete="off"
            placeholder="заавал биш"
            disabled={disabled}
            aria-invalid={Boolean(errors.username)}
            {...register('username')}
          />
          <FieldError errors={[errors.username]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="user-first-name">Нэр</FieldLabel>
          <MInput
            id="user-first-name"
            disabled={disabled}
            aria-invalid={Boolean(errors.firstName)}
            {...register('firstName')}
          />
          <FieldError errors={[errors.firstName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="user-last-name">Овог</FieldLabel>
          <MInput
            id="user-last-name"
            disabled={disabled}
            aria-invalid={Boolean(errors.lastName)}
            {...register('lastName')}
          />
          <FieldError errors={[errors.lastName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="user-display-name">Харуулах нэр</FieldLabel>
          <MInput
            id="user-display-name"
            disabled={disabled}
            aria-invalid={Boolean(errors.displayName)}
            {...register('displayName')}
          />
          <FieldError errors={[errors.displayName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="user-phone">Утас</FieldLabel>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <MaskedInput
                id="user-phone"
                mask="phone"
                autoComplete="off"
                disabled={disabled}
                aria-invalid={Boolean(errors.phone)}
                value={field.value ?? ''}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
          <FieldError errors={[errors.phone]} />
        </Field>

        {canAssignRoles ? (
          <Field className="md:col-span-2">
            <FieldLabel>Системийн эрх</FieldLabel>
            <Controller
              control={control}
              name="roleIds"
              render={({ field }) => (
                <MDatalist
                  multiple
                  options={roleOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={
                    rolesQuery.isPending
                      ? 'Уншиж байна…'
                      : 'Системийн эрх сонгох'
                  }
                  searchPlaceholder="Системийн эрх хайх…"
                  emptyText="Системийн эрх олдсонгүй"
                  disabled={disabled || rolesQuery.isPending}
                />
              )}
            />
          </Field>
        ) : null}

        {isCreate ? (
          <>
            <Field>
              <FieldLabel htmlFor="user-password" data-required>Нууц үг</FieldLabel>
              <MPassword
                id="user-password"
                autoComplete="new-password"
                disabled={disabled}
                aria-invalid={Boolean(
                  'password' in errors ? errors.password : undefined,
                )}
                {...register('password' as keyof CreateUserFormData)}
              />
              <FieldError
                errors={['password' in errors ? errors.password : undefined]}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-confirm-password" data-required>
                Баталгаажуулах
              </FieldLabel>
              <MPassword
                id="user-confirm-password"
                autoComplete="new-password"
                disabled={disabled}
                aria-invalid={Boolean(
                  'confirmPassword' in errors
                    ? errors.confirmPassword
                    : undefined,
                )}
                {...register('confirmPassword' as keyof CreateUserFormData)}
              />
              <FieldError
                errors={[
                  'confirmPassword' in errors
                    ? errors.confirmPassword
                    : undefined,
                ]}
              />
            </Field>
            <Field
              orientation="horizontal"
              className="gap-4 md:col-span-2 items-center justify-between"
            >
              <div className="space-y-1">
                <FieldLabel htmlFor="user-must-change">
                  Дараагийн нэвтрэлтээр солих
                </FieldLabel>
                <FieldDescription>
                  Идэвхтэй бол хэрэглэгч анх нэвтрэхдээ нууц үгээ солино.
                </FieldDescription>
              </div>
              <Controller
                name={'mustChangePassword' as keyof CreateUserFormData}
                control={control}
                render={({ field }) => (
                  <MSwitch
                    id="user-must-change"
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                )}
              />
            </Field>
          </>
        ) : null}
      </FieldGroup>

      {isSystemUser ? (
        <p className="text-sm text-muted-foreground">
          Системийн хэрэглэгчийг засах боломжгүй.
        </p>
      ) : null}
    </DialogForm>
  );
}
