// src/features/users/components/UserAvatar.tsx
import React from 'react';

interface UserAvatarProps {
  name: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showEmail?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  email,
  size = 'md',
  showName = false,
  showEmail = false,
  className = ''
}) => {
  const sizeConfig = {
    sm: { container: 'w-8 h-8', text: 'text-sm', icon: 'w-4 h-4' },
    md: { container: 'w-10 h-10', text: 'text-base', icon: 'w-5 h-5' },
    lg: { container: 'w-12 h-12', text: 'text-lg', icon: 'w-6 h-6' }
  };

  const config = sizeConfig[size];
  const initials = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${config.container} bg-blue-100 rounded-full flex items-center justify-center mr-3`}>
        <span className={`${config.text} font-medium text-blue-600`}>
          {initials}
        </span>
      </div>
      {(showName || showEmail) && (
        <div className="flex flex-col">
          {showName && (
            <span className="font-medium text-gray-900">{name}</span>
          )}
          {showEmail && email && (
            <span className="text-sm text-gray-500">{email}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
