'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@packages/ui/components/field';
import { toast } from '@packages/ui/components/sonner';
import { CancelButton, SaveButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { DialogForm } from '@packages/ui/main/MDialog';
import { MCheckbox, MInput, MSwitch } from '@packages/ui/main/MFields';
import type { IntegrationDetail } from '@packages/types';
import { Controller, useForm } from 'react-hook-form';

import {
  getIntegrationDefaults,
  integrationSchema,
  useIntegrationMutate,
  type IntegrationFormData,
} from '../hooks';
import { INTEGRATION_SCOPE_OPTIONS } from '../lib/labels';

type IntegrationFormProps = {
  mode: 'add' | 'edit';
  item?: IntegrationDetail;
  onSuccess?: () => void;
};

export function IntegrationForm({ mode, item, onSuccess }: IntegrationFormProps) {
  const { hideDialog } = useDialog();
  const { create, update } = useIntegrationMutate();
  const isCreate = mode === 'add';
  const isLoading = create.isPending || update.isPending;

  const form = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: getIntegrationDefaults(item),
    mode: 'onTouched',
  });

  const onSubmit = (values: IntegrationFormData) => {
    if (isCreate && !values.clientSecret.trim()) {
      form.setError('clientSecret', { message: 'Client secret оруулна уу' });
      return;
    }

    const dto = {
      name: values.name,
      baseUrl: values.baseUrl,
      clientId: values.clientId,
      clientSecret: values.clientSecret || undefined,
      isEnabled: values.isEnabled,
      scopes: values.scopes,
    };

    const request = isCreate
      ? create.mutateAsync({ ...dto, clientSecret: values.clientSecret })
      : update.mutateAsync({ id: item!.id, dto });

    void request.then(() => {
      toast.success(isCreate ? 'Интеграци бүртгэгдлээ' : 'Интеграци шинэчлэгдлээ');
      hideDialog();
      onSuccess?.();
    });
  };

  return (
    <DialogForm
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      actions={
        <>
          <CancelButton text="Болих" icon={false} tooltip={false} onClick={hideDialog} />
          <SaveButton
            type="submit"
            icon={false}
            tooltip={false}
            text={isLoading ? 'Хадгалж байна…' : 'Хадгалах'}
            disabled={isLoading}
          />
        </>
      }
    >
      <FieldGroup className="gap-4 grid w-full grid-cols-1">
        <Field>
          <FieldLabel htmlFor="integration-name" data-required>
            Нэр
          </FieldLabel>
          <MInput id="integration-name" {...form.register('name')} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="integration-url" data-required>
            API хаяг
          </FieldLabel>
          <MInput id="integration-url" {...form.register('baseUrl')} />
          <FieldError errors={[form.formState.errors.baseUrl]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="integration-client" data-required>
            Client ID
          </FieldLabel>
          <MInput id="integration-client" autoComplete="off" {...form.register('clientId')} />
          <FieldError errors={[form.formState.errors.clientId]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="integration-secret" data-required={isCreate}>
            Client secret
          </FieldLabel>
          <MInput
            id="integration-secret"
            type="password"
            autoComplete="new-password"
            placeholder={isCreate ? undefined : 'Хоосон бол өмнөх нууц үлдэнэ'}
            {...form.register('clientSecret')}
          />
          <FieldError errors={[form.formState.errors.clientSecret]} />
        </Field>
        <Controller
          control={form.control}
          name="isEnabled"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="integration-enabled">Идэвхтэй</FieldLabel>
              <MSwitch
                id="integration-enabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="scopes"
          render={({ field }) => (
            <Field>
              <FieldLabel data-required>API эрх</FieldLabel>
              <div className="gap-2 flex flex-col">
                {INTEGRATION_SCOPE_OPTIONS.map((scope) => (
                  <MCheckbox
                    key={scope.value}
                    id={`integration-scope-${scope.value}`}
                    checked={field.value.includes(scope.value)}
                    label={`${scope.label} (${scope.value})`}
                    onCheckedChange={(checked) => {
                      field.onChange(
                        checked
                          ? [...field.value, scope.value]
                          : field.value.filter((value) => value !== scope.value),
                      );
                    }}
                  />
                ))}
              </div>
              <FieldError errors={[form.formState.errors.scopes]} />
            </Field>
          )}
        />
      </FieldGroup>
    </DialogForm>
  );
}
