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
import { MInput, MSwitch, MTextarea } from '@packages/ui/main/MFields';
import { isPlatformSuperAdminRole, type RoleListItem } from '@packages/types';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { getApiErrorMessage } from '@/lib/api-error';
import { roleResourcesPath } from '@/layouts/routes';
import { getRole } from '@/services/iam/roles.service';

import {
  getCreateRoleDefaults,
  getUpdateRoleDefaults,
  roleFormSchema,
  toCreateRoleDto,
  toUpdateRoleDto,
  useRoleMutate,
  type RoleFormData,
  rolesQueryKey,
} from '../hooks';
import { ROLE_SCOPE_OPTIONS } from '../lib/labels';

type RoleFormProps = {
  mode: 'add' | 'edit';
  role?: RoleListItem;
  onSuccess?: () => void;
};

export function RoleForm({ mode, role, onSuccess }: RoleFormProps) {
  const router = useRouter();
  const { hideDialog } = useDialog();
  const { create, update } = useRoleMutate();

  const isCreate = mode === 'add';
  const isLoading = create.isPending || update.isPending;

  const roleQuery = useQuery({
    queryKey: [...rolesQueryKey, 'detail', role?.id],
    queryFn: () => getRole(role!.id),
    enabled: !isCreate && Boolean(role?.id),
  });

  const detail = roleQuery.data;
  const isSystem = Boolean(detail?.isSystem);
  const isSuperAdmin = isPlatformSuperAdminRole(
    detail?.slug ?? role?.slug ?? '',
  );
  const isDeleted = Boolean(detail?.deletedAt);

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: isCreate ? getCreateRoleDefaults() : getUpdateRoleDefaults(),
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

    form.reset(getUpdateRoleDefaults(detail));
  }, [detail, form, isCreate]);

  const disabled = isLoading || isDeleted || isSuperAdmin;

  const onSubmit = async (values: RoleFormData) => {
    try {
      if (isCreate) {
        const created = await create.mutateAsync(toCreateRoleDto(values));
        toast.success('Системийн эрх амжилттай үүслээ');
        hideDialog();
        onSuccess?.();
        router.push(roleResourcesPath(created.id));
        return;
      }

      if (isSuperAdmin) {
        return;
      }

      if (detail) {
        await update.mutateAsync({
          id: detail.id,
          dto: toUpdateRoleDto(values, detail.isSystem),
        });
        toast.success('Системийн эрх амжилттай шинэчлэгдлээ');
      }

      hideDialog();
      onSuccess?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  if (!isCreate && roleQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Уншиж байна…</p>;
  }

  if (!isCreate && roleQuery.error) {
    return (
      <p className="text-sm text-destructive">
        {getApiErrorMessage(roleQuery.error)}
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
          ) : isSuperAdmin ? null : (
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
          <FieldLabel htmlFor="role-name" data-required>Нэр</FieldLabel>
          <MInput
            id="role-name"
            autoComplete="off"
            disabled={disabled}
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="role-slug" data-required>Холбоос</FieldLabel>
          <MInput
            id="role-slug"
            autoComplete="off"
            placeholder="platform_admin"
            disabled={disabled || isSystem}
            aria-invalid={Boolean(errors.slug)}
            {...register('slug')}
          />
          <FieldDescription>Жижиг латин үсэг, тоо, _.</FieldDescription>
          <FieldError errors={[errors.slug]} />
        </Field>

        <Field>
          <FieldLabel data-required>Хүрээ</FieldLabel>
          <Controller
            control={control}
            name="scope"
            render={({ field }) => (
              <MDatalist
                options={ROLE_SCOPE_OPTIONS}
                value={field.value}
                onValueChange={(value) => {
                  if (value) {
                    field.onChange(value);
                  }
                }}
                placeholder="Хүрээ сонгох"
                searchPlaceholder="Хүрээ хайх…"
                emptyText="Хүрээ олдсонгүй"
                disabled={disabled || isSystem}
                aria-invalid={Boolean(errors.scope)}
              />
            )}
          />
          <FieldError errors={[errors.scope]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="role-priority">Эрэмбэ</FieldLabel>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <MInput
                id="role-priority"
                type="number"
                min={0}
                max={10_000}
                disabled={disabled}
                aria-invalid={Boolean(errors.priority)}
                value={Number.isFinite(field.value) ? field.value : 0}
                onChange={(event) => {
                  const next = event.target.value;
                  field.onChange(next === '' ? 0 : Number(next));
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
          <FieldError errors={[errors.priority]} />
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="role-description">Тайлбар</FieldLabel>
          <MTextarea
            id="role-description"
            disabled={disabled}
            aria-invalid={Boolean(errors.description)}
            {...register('description')}
          />
          <FieldError errors={[errors.description]} />
        </Field>

        <Field
          orientation="horizontal"
          className="gap-4 md:col-span-2 items-center justify-between"
        >
          <div className="space-y-1">
            <FieldLabel htmlFor="role-is-default">
              Анхны системийн эрх
            </FieldLabel>
            <FieldDescription>
              Шинэ хэрэглэгчид энэ үүргийг автоматаар онооно.
            </FieldDescription>
          </div>
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <MSwitch
                id="role-is-default"
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
        </Field>
      </FieldGroup>

      {isCreate ? (
        <p className="text-sm text-muted-foreground">
          Үүсгэсний дараа нөөц бүрийн үйлдлийг матрицаар онооно.
        </p>
      ) : isSuperAdmin ? (
        <p className="text-sm text-muted-foreground">
          Platform Super Admin систем дээр бүх эрхтэй. Засах, зөвшөөрөл оноох
          боломжгүй.
        </p>
      ) : isSystem ? (
        <p className="text-sm text-muted-foreground">
          Системийн үүргийн слаг, хүрээ, зөвшөөрлийг засах боломжгүй.
        </p>
      ) : null}
    </DialogForm>
  );
}
