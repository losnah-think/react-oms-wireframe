// src/features/users/components/UserRoleBadge.tsx
import React from 'react';
import { Badge } from '../../../design-system';

interface UserRoleBadgeProps {
  role: string;
  size?: 'small' | 'default';
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ 
  role, 
  size = 'default' 
}) => {
  const roleConfig: Record<string, {
    variant: 'danger' | 'primary' | 'secondary' | 'success';
    text: string;
    description: string;
  }> = {
    'ADMIN': {
      variant: 'danger',
      text: '관리자',
      description: '관리자 권한'
    },
    'admin': {
      variant: 'danger',
      text: '관리자',
      description: '관리자 권한'
    },
    'MANAGER': {
      variant: 'primary',
      text: '매니저',
      description: '일반 운영 관리 권한'
    },
    'manager': {
      variant: 'primary',
      text: '매니저',
      description: '일반 운영 관리 권한'
    },
    'OPERATOR': {
      variant: 'secondary',
      text: '운영자',
      description: '제한된 운영 권한'
    },
    'operator': {
      variant: 'secondary',
      text: '운영자',
      description: '제한된 운영 권한'
    },
    'USER': {
      variant: 'secondary',
      text: '사용자',
      description: '기본 사용자 권한'
    },
    'user': {
      variant: 'secondary',
      text: '사용자',
      description: '기본 사용자 권한'
    }
  };

  // role이 없거나 config가 없을 때 기본값 사용
  const config = roleConfig[role] || roleConfig['user'];

  return (
    <Badge 
      variant={config.variant} 
      size={size}
      title={config.description}
    >
      {config.text}
    </Badge>
  );
};

export default UserRoleBadge;

