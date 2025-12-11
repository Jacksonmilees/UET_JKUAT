import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow' | 'indigo' | 'pink';
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

const colorClasses = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    icon: 'bg-blue-500/10 text-blue-500',
    text: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    gradient: 'from-green-500 to-emerald-600',
    icon: 'bg-green-500/10 text-green-500',
    text: 'text-green-600 dark:text-green-400'
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    icon: 'bg-orange-500/10 text-orange-500',
    text: 'text-orange-600 dark:text-orange-400'
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    icon: 'bg-purple-500/10 text-purple-500',
    text: 'text-purple-600 dark:text-purple-400'
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    icon: 'bg-red-500/10 text-red-500',
    text: 'text-red-600 dark:text-red-400'
  },
  yellow: {
    gradient: 'from-yellow-500 to-yellow-600',
    icon: 'bg-yellow-500/10 text-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400'
  },
  indigo: {
    gradient: 'from-indigo-500 to-indigo-600',
    icon: 'bg-indigo-500/10 text-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400'
  },
  pink: {
    gradient: 'from-pink-500 to-pink-600',
    icon: 'bg-pink-500/10 text-pink-500',
    text: 'text-pink-600 dark:text-pink-400'
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  onClick,
  loading = false,
  className = ''
}: StatCardProps) {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className={`bg-card border border-border rounded-2xl p-6 animate-pulse ${className}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-secondary rounded-xl"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-secondary rounded"></div>
          <div className="h-8 w-32 bg-secondary rounded"></div>
          <div className="h-3 w-24 bg-secondary rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group bg-card border border-border rounded-2xl p-6 transition-all hover:shadow-lg hover:border-primary/20 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.icon} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`text-sm font-medium px-2 py-1 rounded-lg ${
            trend.isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Gradient variant for featured stats
export function GradientStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  onClick,
  loading = false,
  className = '',
  actionButton
}: StatCardProps & { actionButton?: React.ReactNode }) {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-6 text-white animate-pulse ${className}`}>
        <div className="space-y-3">
          <div className="h-5 w-32 bg-white/20 rounded"></div>
          <div className="h-10 w-40 bg-white/20 rounded"></div>
          <div className="h-4 w-28 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-gradient-to-br ${colors.gradient} rounded-2xl p-6 text-white shadow-xl transition-transform hover:scale-[1.02] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>

      {/* Action button */}
      {actionButton && (
        <div className="absolute top-4 right-4 z-10" onClick={e => e.stopPropagation()}>
          {actionButton}
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium opacity-90">{title}</span>
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {subtitle && (
          <p className="text-sm opacity-75">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
