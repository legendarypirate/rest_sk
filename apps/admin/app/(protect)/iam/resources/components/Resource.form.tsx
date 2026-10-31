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
import type { ResourceListItem } from '@packages/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getApiErrorMessage } from '@/lib/api-error';
import { mergeResourceActionOptions } from '@/lib/resource-actions';
import { getResource } from '@/services/iam/resources.service';

import {
  getCreateResourceDefaults,
  getUpdateResourceDefaults,
  resourceFormSchema,
  toCreateResourceDto,
  toUpdateResourceDto,
  useResourceMutate,
  type ResourceFormData,
  resourcesQueryKey,
} from '../hooks';
import {
  RESOURCE_ICON_OPTIONS,
  RESOURCE_SCOPE_OPTIONS,
} from '../lib/labels';

type ResourceFormProps = {
  mode: 'add' | 'edit';
  resource?: ResourceListItem;
  onSuccess?: () => void;
};

export function ResourceForm({
  mode,
  resource,
  onSuccess,
}: ResourceFormProps) {
  const { hideDialog } = useDialog();
  const { create, update } = useResourceMutate();

  const isCreate = mode === 'add';
  const isLoading = create.isPending || update.isPending;

  const resourceQuery = useQuery({
    queryKey: [...resourcesQueryKey, 'detail', resource?.id],
    queryFn: () => getResource(resource!.id),
    enabled: !isCreate && Boolean(resource?.id),
  });

  const detail = resourceQuery.data;
  const isSystem = Boolean(detail?.isSystem);
  const isDeleted = Boolean(detail?.deletedAt);

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: isCreate
      ? getCreateResourceDefaults()
      : getUpdateResourceDefaults(),
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

    form.reset(getUpdateResourceDefaults(detail));
  }, [detail, form, isCreate]);

  const disabled = isLoading || isDeleted;

  const onSubmit = async (values: ResourceFormData) => {
    try {
      if (isCreate) {
        await create.mutateAsync(toCreateResourceDto(values));
        toast.success('Цэс амжилттай үүслээ');
      } else if (detail) {
        await update.mutateAsync({
          id: detail.id,
          dto: toUpdateResourceDto(values, detail.isSystem),
        });
        toast.success('Цэс амжилттай шинэчлэгдлээ');
      }

      hideDialog();
      onSuccess?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  if (!isCreate && resourceQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Уншиж байна…</p>;
  }

  if (!isCreate && resourceQuery.error) {
    return (
      <p className="text-sm text-destructive">
        {getApiErrorMessage(resourceQuery.error)}
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
      <FieldGroup className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="resource-name" data-required>Нэр</FieldLabel>
          <MInput
            id="resource-name"
            autoComplete="off"
            disabled={disabled}
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="resource-slug" data-required>Холбоос</FieldLabel>
          <MInput
            id="resource-slug"
            autoComplete="off"
            placeholder="jobs"
            disabled={disabled || isSystem}
            aria-invalid={Boolean(errors.slug)}
            {...register('slug')}
          />
          <FieldDescription>
            Зөвшөөрлийн түлхүүр: platform:слаг:үйлдэл
          </FieldDescription>
          <FieldError errors={[errors.slug]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="resource-path">Админ зам</FieldLabel>
          <MInput
            id="resource-path"
            autoComplete="off"
            placeholder="/iam/jobs"
            disabled={disabled}
            aria-invalid={Boolean(errors.path)}
            {...register('path')}
          />
          <FieldError errors={[errors.path]} />
        </Field>

        <Field>
          <FieldLabel>Дүрс</FieldLabel>
          <Controller
            control={control}
            name="icon"
            render={({ field }) => (
              <MDatalist
                options={RESOURCE_ICON_OPTIONS}
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? '')}
                placeholder="Дүрс сонгох"
                searchPlaceholder="Дүрс хайх…"
                emptyText="Дүрс олдсонгүй"
                disabled={disabled}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="resource-group-key">Цэсний бүлэг</FieldLabel>
          <MInput
            id="resource-group-key"
            autoComplete="off"
            placeholder="iam"
            disabled={disabled}
            {...register('groupKey')}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="resource-group-label">Бүлгийн нэр</FieldLabel>
          <MInput
            id="resource-group-label"
            autoComplete="off"
            placeholder="Хандалт ба эрх"
            disabled={disabled}
            {...register('groupLabel')}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="resource-group-sort">Бүлгийн эрэмбэ</FieldLabel>
          <Controller
            control={control}
            name="groupSortOrder"
            render={({ field }) => (
              <MInput
                id="resource-group-sort"
                type="number"
                min={0}
                max={10_000}
                disabled={disabled}
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
          <FieldDescription>
            Бага тоо = дээд бүлэг. Ижил бүлгийн бүх цэс энэ тоог хуваалцана.
          </FieldDescription>
          <FieldError errors={[errors.groupSortOrder]} />
        </Field>

        <Field>
          <FieldLabel data-required>Хүрээ</FieldLabel>
          <Controller
            control={control}
            name="scope"
            render={({ field }) => (
              <MDatalist
                options={RESOURCE_SCOPE_OPTIONS}
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
          <FieldLabel htmlFor="resource-sort">Цэсний эрэмбэ</FieldLabel>
          <Controller
            control={control}
            name="sortOrder"
            render={({ field }) => (
              <MInput
                id="resource-sort"
                type="number"
                min={0}
                max={10_000}
                disabled={disabled}
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
          <FieldDescription>Бүлэг доторх цэсний дараалал.</FieldDescription>
          <FieldError errors={[errors.sortOrder]} />
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="resource-description">Тайлбар</FieldLabel>
          <MTextarea
            id="resource-description"
            disabled={disabled}
            {...register('description')}
          />
          <FieldError errors={[errors.description]} />
        </Field>

        <Field
          orientation="horizontal"
          className="items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <FieldLabel htmlFor="resource-is-menu">Цэсэнд харуулах</FieldLabel>
            <FieldDescription>Sidebar-д энэ модулийг нэмнэ.</FieldDescription>
          </div>
          <Controller
            name="isMenu"
            control={control}
            render={({ field }) => (
              <MSwitch
                id="resource-is-menu"
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
        </Field>

        <Field
          orientation="horizontal"
          className="items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <FieldLabel htmlFor="resource-menu-exact">
              Зөвхөн энэ хуудсыг тодруулах
            </FieldLabel>
            <FieldDescription>
              Асаавал цэс зөвхөн яг энэ зам дээр идэвхтэй. Дэд хуудастай цэсэнд
              (жишээ нь Системийн эрх) унтраана.
            </FieldDescription>
          </div>
          <Controller
            name="menuExact"
            control={control}
            render={({ field }) => (
              <MSwitch
                id="resource-menu-exact"
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel>Зөвшөөрлийн үйлдлүүд</FieldLabel>
          <Controller
            control={control}
            name="actions"
            render={({ field }) => (
              <MDatalist
                multiple
                allowCreate
                options={mergeResourceActionOptions(field.value)}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Үйлдэл сонгох"
                searchPlaceholder="Үйлдэл хайх, эсвэл шинээр бичих…"
                emptyText="Үйлдэл олдсонгүй"
                disabled={disabled}
              />
            )}
          />
          <FieldDescription>
            Үндсэн: унших, нэмэх, засах, хэвлэх, экспорт, импорт, устгах. Жагсаалтад
            байхгүй үйлдлийг хайгаад нэмнэ.
          </FieldDescription>
        </Field>
      </FieldGroup>

      {isSystem ? (
        <p className="text-sm text-muted-foreground">
          Системийн цэсийн слаг, хүрээг засах боломжгүй.
        </p>
      ) : null}
    </DialogForm>
  );
}
