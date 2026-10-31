export const STANDARD_RESOURCE_ACTIONS = [
  'read',
  'add',
  'edit',
  'print',
  'export',
  'import',
  'delete',
] as const;

export const EXTRA_RESOURCE_ACTIONS = [
  'list',
  'view',
  'write',
  'manage',
  'approve',
  'reject',
  'assign',
  'restore',
  'archive',
  'download',
  'upload',
  'share',
  'impersonate',
] as const;

export const RESOURCE_ACTIONS = [
  ...STANDARD_RESOURCE_ACTIONS,
  ...EXTRA_RESOURCE_ACTIONS,
] as const;

export type StandardResourceAction = (typeof STANDARD_RESOURCE_ACTIONS)[number];
export type ExtraResourceAction = (typeof EXTRA_RESOURCE_ACTIONS)[number];
export type ResourceAction = (typeof RESOURCE_ACTIONS)[number];

export const SAFE_RESOURCE_ACTIONS = [
  'read',
  'list',
  'view',
  'print',
  'export',
  'download',
] as const;

export function isDangerousResourceAction(action: string) {
  return !(SAFE_RESOURCE_ACTIONS as readonly string[]).includes(action);
}
