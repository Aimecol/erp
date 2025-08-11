import React from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource?: string;
  action?: string;
  role?: string;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL specified permissions/roles
}

export function PermissionGuard({
  children,
  resource,
  action,
  role,
  fallback = null,
  requireAll = false,
}: PermissionGuardProps) {
  const { hasPermission, hasRole, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  const checks: boolean[] = [];

  // Check permission
  if (resource && action) {
    checks.push(hasPermission(resource, action));
  }

  // Check role
  if (role) {
    checks.push(hasRole(role));
  }

  // If no checks specified, just check authentication
  if (checks.length === 0) {
    return <>{children}</>;
  }

  // Determine if user has access
  const hasAccess = requireAll 
    ? checks.every(check => check) 
    : checks.some(check => check);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Higher-order component version
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissions: {
    resource?: string;
    action?: string;
    role?: string;
    requireAll?: boolean;
  }
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard {...permissions}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

// Hook for permission checking in components
export function usePermissions() {
  const { hasPermission, hasRole, isAuthenticated, user } = useAuthStore();

  return {
    hasPermission,
    hasRole,
    isAuthenticated,
    user,
    canCreate: (resource: string) => hasPermission(resource, 'create'),
    canRead: (resource: string) => hasPermission(resource, 'read'),
    canUpdate: (resource: string) => hasPermission(resource, 'update'),
    canDelete: (resource: string) => hasPermission(resource, 'delete'),
    canApprove: (resource: string) => hasPermission(resource, 'approve'),
    canExport: (resource: string) => hasPermission(resource, 'export'),
    isAdmin: hasRole('admin'),
    isBursar: hasRole('bursar'),
    isStoreManager: hasRole('store_manager'),
    isAuditor: hasRole('auditor'),
    // Legacy role support for backward compatibility
    isAccountant: hasRole('bursar'), // Map to bursar for INES context
    isSalesRep: hasRole('bursar'), // Map to bursar for student billing
    isWarehouseClerk: hasRole('store_manager'),
    isProductionManager: hasRole('admin'),
  };
}
