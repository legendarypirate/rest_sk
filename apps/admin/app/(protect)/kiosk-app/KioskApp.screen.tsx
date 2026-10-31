'use client';

import { ExportButton } from '@packages/ui/main/MButtons';
import { MImageUpload } from '@packages/ui/main/MImage.upload';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  getKioskInstallerMeta,
  KIOSK_INSTALLER_DOWNLOAD_URL,
  uploadKioskInstaller,
} from '@/services/kiosk/installer.service';
import { PlatformPermission } from '@/types/routes';

const installerQueryKey = ['kiosk', 'installer'] as const;
const EXE_ACCEPT = '.exe,application/x-msdownload,application/octet-stream';

export function KioskAppScreen() {
  const { can } = usePermission();
  const canUpload = can(PlatformPermission.KioskDevicesEdit);
  const queryClient = useQueryClient();
  const meta = useQuery({
    queryKey: installerQueryKey,
    queryFn: getKioskInstallerMeta,
  });
  const file = meta.data;

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Киоск програм</h1>
          <p className="text-sm text-muted-foreground">
            Exe оруулаад солино. Татах товч хамгийн сүүлийн файлыг өгнө.
          </p>
        </div>
        <ExportButton
          text="Татах"
          tooltip="Киоск татах"
          disabled={!file?.exists}
          onClick={() => {
            window.location.assign(KIOSK_INSTALLER_DOWNLOAD_URL);
          }}
        />
      </div>
      <div className="px-4 pt-4">
        <MImageUpload
          kind="file"
          label="Киоск exe"
          accept={EXE_ACCEPT}
          maxSizeMB={400}
          emptyText="Exe файл байхгүй"
          helperText="EXE · 400MB хүртэл"
          className="max-w-sm"
          showRemove={false}
          disabled={!canUpload || meta.isPending}
          value={file?.exists ? file.filename : ''}
          onChange={() => undefined}
          onUpload={async (picked) => {
            try {
              const result = await uploadKioskInstaller(picked);
              void queryClient.invalidateQueries({ queryKey: installerQueryKey });
              return result.filename;
            } catch (error) {
              throw new Error(getApiErrorMessage(error));
            }
          }}
        />
      </div>
    </div>
  );
}
