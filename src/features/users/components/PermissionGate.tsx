// src/features/users/components/PermissionGate.tsx
import React from 'react';
import { Permission, PermissionGroup, PERMISSION_GROUPS } from '../types/permissions';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  userId?: string;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  userId
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions({ userId });

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded h-4 w-full"></div>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    // 권한이 지정되지 않은 경우 항상 접근 허용
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// 특정 권한이 있을 때만 렌더링하는 컴포넌트
export const RequirePermission: React.FC<Omit<PermissionGateProps, 'requireAll'>> = (props) => {
  return <PermissionGate {...props} />;
};

// 모든 권한이 있을 때만 렌더링하는 컴포넌트
export const RequireAllPermissions: React.FC<Omit<PermissionGateProps, 'requireAll'>> = (props) => {
  return <PermissionGate {...props} requireAll={true} />;
};

// 권한이 없을 때만 렌더링하는 컴포넌트
export const RequireNoPermission: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  userId
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions({ userId });

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded h-4 w-full"></div>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  }

  return !hasAccess ? <>{children}</> : <>{fallback}</>;
};

// 권한 그룹별 접근 제어 컴포넌트
interface PermissionGroupGateProps {
  children: React.ReactNode;
  groupName: string;
  requireAll?: boolean;
  fallback?: React.ReactNode;
  userId?: string;
}

export const PermissionGroupGate: React.FC<PermissionGroupGateProps> = ({
  children,
  groupName,
  requireAll = false,
  fallback = null,
  userId
}) => {
  const group = PERMISSION_GROUPS.find(g => g.name === groupName);
  
  if (!group) {
    console.warn(`Permission group "${groupName}" not found`);
    return <>{fallback}</>;
  }

  return (
    <PermissionGate
      permissions={group.permissions}
      requireAll={requireAll}
      fallback={fallback}
      userId={userId}
    >
      {children}
    </PermissionGate>
  );
};

// 권한 기반 버튼 컴포넌트
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  userId?: string;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  userId,
  disabled,
  ...props
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions({ userId });

  if (loading) {
    return (
      <button {...props} disabled className="opacity-50 cursor-not-allowed">
        {children}
      </button>
    );
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    hasAccess = true;
  }

  return (
    <button
      {...props}
      disabled={disabled || !hasAccess}
      className={`${props.className || ''} ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

// 권한 기반 링크 컴포넌트
interface PermissionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  userId?: string;
}

export const PermissionLink: React.FC<PermissionLinkProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  userId,
  onClick,
  ...props
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions({ userId });

  if (loading) {
    return (
      <a {...props} className={`${props.className || ''} opacity-50 cursor-not-allowed`}>
        {children}
      </a>
    );
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    hasAccess = true;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasAccess) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a
      {...props}
      onClick={handleClick}
      className={`${props.className || ''} ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </a>
  );
};

export default PermissionGate;
