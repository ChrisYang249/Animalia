import { useAuthStore } from '../store/authStore';
import { canAccessRoute, canPerformAction, actionPermissions } from '../config/rolePermissions';

export const usePermissions = () => {
  const { user } = useAuthStore();
  const userRole = user?.role;

  return {
    userRole,
    canAccess: (path: string) => canAccessRoute(userRole, path),
    canPerform: (action: keyof typeof actionPermissions) => canPerformAction(userRole, action),
    isAdmin: () => userRole === 'super_admin' || userRole === 'admin',
  };
};
