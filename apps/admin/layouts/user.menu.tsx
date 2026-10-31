'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@packages/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@packages/ui/components/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@packages/ui/components/sidebar';
import { Skeleton } from '@packages/ui/components/skeleton';

import { useLogout } from '@/hooks/use.logout';
import { usePermission } from '@/hooks/use.permission';
import { Icons } from '@/utils/icons';

const ExpandIcon = Icons.expandVertical;
const LogoutIcon = Icons.logout;
const AdminBadgeIcon = Icons.roles;

function userLabel(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
}) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return user.displayName || fullName || user.username || user.email || 'Админ';
}

function userInitials(label: string) {
  const parts = label.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'A';
}

export function UserMenu() {
  const { user, isLoading, isPlatformAdmin, roles } = usePermission();
  const logout = useLogout();

  if (isLoading && !user) {
    return (
      <div className="flex h-12 items-center gap-2.5 rounded-lg px-1.5">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const name = userLabel(user);
  const initials = userInitials(name);
  const roleLabel = isPlatformAdmin
    ? 'Платформ админ'
    : (roles[0] ?? user.email ?? '');

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-12 cursor-pointer gap-2.5 rounded-lg px-1.5 data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 shrink-0">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={name} />
              ) : null}
              <AvatarFallback className="bg-sidebar-primary/12 text-xs font-semibold text-sidebar-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col text-left leading-none group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-medium">{name}</span>
              {roleLabel ? (
                <span className="mt-1 truncate text-[11px] text-sidebar-foreground/55">
                  {roleLabel}
                </span>
              ) : null}
            </div>
            <ExpandIcon className="size-3.5 shrink-0 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-60"
          >
            <div className="flex items-center gap-2.5 px-1.5 py-2">
              <Avatar className="size-9 shrink-0">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={name} />
                ) : null}
                <AvatarFallback className="bg-primary/12 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col leading-none">
                <p className="truncate text-sm font-medium text-foreground">
                  {name}
                </p>
                {user.email ? (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                ) : null}
              </div>
            </div>

            {isPlatformAdmin ? (
              <div className="mx-1.5 mb-1 flex items-center gap-1.5 rounded-md bg-primary/8 px-2 py-1.5 text-[11px] font-medium text-primary">
                <AdminBadgeIcon className="size-3.5" />
                Платформ админ
              </div>
            ) : null}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <LogoutIcon />
              Гарах
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
