'use client';

import { usePathname } from 'next/navigation';

import { Separator } from '@packages/ui/components/separator';
import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@packages/ui/components/sidebar';
import { ThemeToggle } from '@packages/ui/main/Theme.toggle';

import { AppSidebar } from '@/layouts/app.sidebar';
import { findAdminNavItem } from '@/layouts/routes';
import { useResourceMenu } from '@/layouts/use.resource-menu';

function AppHeader() {
  const pathname = usePathname();
  const { menu } = useResourceMenu();
  const { isMobile } = useSidebar();

  const current = findAdminNavItem(pathname, menu);
  const group = menu.find((candidate) =>
    candidate.items.some(
      (item) =>
        item.menuId === current?.menuId ||
        item.children?.some((child) => child.menuId === current?.menuId),
    ),
  );

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
      {isMobile ? (
        <>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-5" />
        </>
      ) : null}
      <div className="flex min-w-0 flex-col leading-none">
        {group ? (
          <span className="truncate text-[11px] text-muted-foreground">
            {group.label}
          </span>
        ) : null}
        <p className="truncate text-sm font-semibold">
          {current?.label ?? 'Restaurant Admin'}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="min-h-0 overflow-hidden">
        <AppHeader />
        <div className="flex min-h-0 flex-1 flex-col p-4">{children}</div>
      </SidebarInset>
    </>
  );
}
