// src/features/users/components/UserStatsCard.tsx
import React from 'react';
import { Card } from '../../../design-system';

interface UserStatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  onClick
}) => {
  const colorConfig = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', value: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600', value: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', value: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', value: 'text-orange-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600', value: 'text-red-600' }
  };

  const config = colorConfig[color];

  return (
    <Card 
      padding="lg" 
      interactive={!!onClick}
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${config.value}`}>{value.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs ${
                trend.direction === 'up' ? 'text-green-600' : 
                trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} 
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs 이전 기간</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${config.bg} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default UserStatsCard;
