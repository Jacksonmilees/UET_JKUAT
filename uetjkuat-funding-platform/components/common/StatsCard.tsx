import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  trend,
  color = 'blue',
  className = '',
}) => {
  const colors = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]}`}>
          <div className="text-white">{icon}</div>
        </div>
        {trend && (
          <div className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
