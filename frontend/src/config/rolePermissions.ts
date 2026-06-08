export const USER_ROLES = ['super_admin', 'staff', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
}

const ALL_STAFF: UserRole[] = ['super_admin', 'staff', 'admin'];

export const routePermissions: RoutePermission[] = [
  { path: '/dashboard', allowedRoles: ALL_STAFF },
  { path: '/clients', allowedRoles: ALL_STAFF },
  { path: '/orders', allowedRoles: ALL_STAFF },
  { path: '/storage', allowedRoles: ALL_STAFF },
];

export const actionPermissions = {
  manageClients: ALL_STAFF,
  manageOrders: ALL_STAFF,
  manageStorage: ALL_STAFF,
};

export const canAccessRoute = (userRole: string | undefined, path: string): boolean => {
  if (!userRole) return false;
  const permission = routePermissions.find((p) => p.path === path);
  if (!permission) return true;
  // All authenticated staff can access portal pages
  return true;
};

export const canPerformAction = (
  userRole: string | undefined,
  action: keyof typeof actionPermissions
): boolean => {
  if (!userRole) return false;
  const allowedRoles = actionPermissions[action];
  if (!allowedRoles) return true;
  return allowedRoles.includes(userRole as UserRole);
};
