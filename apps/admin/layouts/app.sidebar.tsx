'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@packages/ui/components/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from '@packages/ui/components/sidebar';
import { Skeleton } from '@packages/ui/components/skeleton';

import { isAdminNavItemActive } from '@/layouts/routes';
import { useResourceMenu } from '@/layouts/use.resource-menu';
import { UserMenu } from '@/layouts/user.menu';
import { ADMIN_APP_HOME } from '@/lib/routes';
import { Icons } from '@/utils/icons';

export { resourceMenuQueryKey } from '@/layouts/use.resource-menu';

const BrandIcon = Icons.brand;
const ToggleIcon = Icons.sidebarToggle;

const navButtonClass = [
  'h-9 gap-2.5 rounded-lg px-2.5 text-sidebar-foreground/75',
  'transition-colors duration-150',
  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
  'data-active:bg-sidebar-primary/10 data-active:font-semibold data-active:text-sidebar-primary',
].join(' ');

function BrandHeader() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-2 py-0">
      <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
        <Button
          size="icon"
          onClick={toggleSidebar}
          aria-label={state === 'collapsed' ? 'Меню дэлгэх' : 'Меню хураах'}
          className="group/brand relative cursor-pointer bg-sidebar-primary text-sidebar-primary-foreground shadow-sm ring-1 ring-sidebar-primary/20 hover:bg-sidebar-primary/90 focus-visible:ring-sidebar-ring/50"
        >
          <BrandIcon className="size-4 transition-opacity duration-150 group-hover/brand:opacity-0" />
          <ToggleIcon className="absolute size-4 opacity-0 transition-opacity duration-150 group-hover/brand:opacity-100" />
        </Button>

        <Link
          href={ADMIN_APP_HOME}
          className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden"
        >
          <span className="truncate text-sm font-semibold tracking-tight">
            Food Order
          </span>
          <span className="mt-0.5 truncate text-[11px] text-sidebar-foreground/55">
            Админ консол
          </span>
        </Link>
      </div>
    </SidebarHeader>
  );
}

function MenuSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-2">
      {[0, 1, 2].map((group) => (
        <div key={group} className="flex flex-col gap-2">
          <Skeleton className="ml-2.5 h-2.5 w-16 group-data-[collapsible=icon]:hidden" />
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex items-center gap-2.5 px-2.5">
              <Skeleton className="size-4 shrink-0 rounded" />
              <Skeleton className="h-3 flex-1 group-data-[collapsible=icon]:hidden" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SidebarNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 py-6 text-center text-xs text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
      {children}
    </p>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { menu, isPending, isError } = useResourceMenu();

  return (
    <Sidebar collapsible="icon">
      <BrandHeader />

      <SidebarContent className="gap-1 py-2">
        {isPending ? <MenuSkeleton /> : null}

        {isError ? (
          <SidebarNotice>Меню татахад алдаа гарлаа.</SidebarNotice>
        ) : null}

        {!isPending && !isError && menu.length === 0 ? (
          <SidebarNotice>Илэрц олдсонгүй.</SidebarNotice>
        ) : null}

        {menu.map((group) => (
          <SidebarGroup key={group.id} className="gap-1 py-1">
            <SidebarGroupLabel className="h-6 px-2.5 text-[11px] font-semibold tracking-[0.08em] text-sidebar-foreground/45 uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isAdminNavItemActive(item, pathname);

                  return (
                    <SidebarMenuItem key={item.menuId}>
                      <SidebarMenuButton
                        render={<Link href={item.path} />}
                        isActive={active}
                        tooltip={item.label}
                        className={navButtonClass}
                      >
                        <Icon />
                        <span className="truncate">{item.label}</span>
                      </SidebarMenuButton>
                      {active ? (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute top-1/2 -left-2 h-4 w-0.75 -translate-y-1/2 rounded-r-full bg-sidebar-primary group-data-[collapsible=icon]:hidden"
                        />
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-0 border-t border-sidebar-border p-2">
        <UserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
