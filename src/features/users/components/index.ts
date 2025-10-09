// src/features/users/components/index.ts
export { default as UserAvatar } from './UserAvatar';
export { default as UserStatusBadge } from './UserStatusBadge';
export { default as UserRoleBadge } from './UserRoleBadge';
export { default as UserStatsCard } from './UserStatsCard';
export { default as UserFormModal } from './UserFormModal';
export { default as UserPermissionsModal } from './UserPermissionsModal';
export { default as ConfirmModal } from './ConfirmModal';
export { default as BatchActions } from './BatchActions';
export { default as UserFilters } from './UserFilters';
export { default as AutoCompleteSearch } from './AutoCompleteSearch';
export { default as ToastMessage } from './ToastMessage';
export { default as SecurityValidator } from './SecurityValidator';

// Permission components
export { 
  default as PermissionGate,
  RequirePermission,
  RequireAllPermissions,
  RequireNoPermission,
  PermissionGroupGate,
  PermissionButton,
  PermissionLink
} from './PermissionGate';

// Context exports
export { ToastProvider, useToast } from '../contexts/ToastContext';
