import { AppShell } from '@/layouts/app.shell';
import { AuthProvider, SidebarAppProvider } from '@/providers';
import { DialogProvider } from '@packages/ui/main/MDialog.context';

export default function ProtectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarAppProvider>
        <DialogProvider>
          <AppShell>{children}</AppShell>
        </DialogProvider>
      </SidebarAppProvider>
    </AuthProvider>
  );
}
