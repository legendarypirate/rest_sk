'use client';

import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import type { IntegrationDetail } from '@packages/types';
import { PlatformPermission } from '@/types/routes';

import { useIntegrations } from '../hooks';
import { IntegrationDelete } from './Integration.delete';
import { IntegrationForm } from './Integration.form';
import { IntegrationsFilters } from './Integrations.filters';
import { IntegrationsTable } from './Integrations.table';

const FORM_DIALOG_CLASS = 'min-w-[640px] sm:max-w-2xl';

export function IntegrationsScreen() {
  const { showDialog } = useDialog();
  const { can } = usePermission();
  const canAdd = can(PlatformPermission.IntegrationsAdd);
  const canEdit = can(PlatformPermission.IntegrationsEdit);
  const canDelete = can(PlatformPermission.IntegrationsDelete);
  const integrations = useIntegrations();
  const [deleting, setDeleting] = useState<IntegrationDetail | null>(null);

  const meta = integrations.query.data?.meta;
  const items = integrations.query.data?.items ?? [];

  function handleCreate() {
    showDialog({
      title: 'Интеграци бүртгэх',
      description: 'Client secret зөвхөн серверт хадгалагдана.',
      content: <IntegrationForm mode="add" onSuccess={() => integrations.setPage(1)} />,
      class: FORM_DIALOG_CLASS,
    });
  }

  function handleEdit(item: IntegrationDetail) {
    showDialog({
      title: 'Интеграци засах',
      description: 'Secret хоосон бол өмнөх нууц үлдэнэ.',
      content: <IntegrationForm mode="edit" item={item} />,
      class: FORM_DIALOG_CLASS,
    });
  }

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Интеграци</h1>
          <p className="text-sm text-muted-foreground">
            MLOS client credential-ээ серверт хадгалж, ажилтнуудыг татна
          </p>
        </div>
        {canAdd ? (
          <CreateButton text="Бүртгэх" tooltip={false} onClick={handleCreate} />
        ) : null}
      </div>

      <div className="px-4 pt-4">
        <IntegrationsFilters
          values={integrations.draft}
          onChange={(key, value) => {
            integrations.setDraft((current) => ({
              ...current,
              [key]: value ?? '',
            }));
          }}
          onSearch={integrations.applyFilters}
          onClear={integrations.clearFilters}
          hasActiveFilters={integrations.hasActiveFilters}
        />
      </div>

      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <IntegrationsTable
          items={items}
          isLoading={integrations.query.isPending}
          errorMessage={
            integrations.query.isError
              ? getApiErrorMessage(integrations.query.error)
              : undefined
          }
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={handleEdit}
          onDelete={setDeleting}
        />
      </div>

      {meta ? (
        <TableFooter
          meta={{
            total: meta.total,
            page: meta.page,
            limit: typeof meta.limit === 'number' ? meta.limit : integrations.limit,
            totalPages: meta.totalPages,
          }}
          limit={integrations.limit}
          onLimitChange={integrations.setLimit}
          onPageChange={integrations.setPage}
          isVisible={meta.totalPages > 1}
        />
      ) : null}

      <IntegrationDelete
        item={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
