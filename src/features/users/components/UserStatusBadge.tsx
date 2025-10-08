// src/features/users/components/UserStatusBadge.tsx
import React from 'react';
import { Badge } from '../../../design-system';

interface UserStatusBadgeProps {
  status: string;
  size?: 'small' | 'default';
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ 
  status, 
  size = 'default' 
}) => {
  const statusConfig: Record<string, {
    variant: 'success' | 'secondary' | 'warning' | 'danger';
    text: string;
    description: string;
  }> = {
    'ACTIVE': {
      variant: 'success',
      text: '활성',
      description: '활성 사용자'
    },
    'active': {
      variant: 'success',
      text: '활성',
      description: '활성 사용자'
    },
    'INACTIVE': {
      variant: 'secondary',
      text: '비활성',
      description: '비활성 사용자'
    },
    'inactive': {
      variant: 'secondary',
      text: '비활성',
      description: '비활성 사용자'
    },
    'PENDING': {
      variant: 'warning',
      text: '대기중',
      description: '대기 중'
    },
    'pending': {
      variant: 'warning',
      text: '대기중',
      description: '대기 중'
    },
    'SUSPENDED': {
      variant: 'danger',
      text: '정지',
      description: '정지됨'
    },
    'suspended': {
      variant: 'danger',
      text: '정지',
      description: '정지됨'
    }
  };

  // status가 없거나 config가 없을 때 기본값 사용
  const config = statusConfig[status] || statusConfig['active'];

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

export default UserStatusBadge;
