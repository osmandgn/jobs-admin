'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-100',
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center text-sm font-medium',
              isPositive && 'text-green-600',
              isNegative && 'text-red-600',
              !isPositive && !isNegative && 'text-gray-500'
            )}
          >
            {isPositive && <TrendingUp className="w-4 h-4 mr-1" />}
            {isNegative && <TrendingDown className="w-4 h-4 mr-1" />}
            {isPositive && '+'}
            {change}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</h3>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
        {changeLabel && <p className="text-xs text-gray-400 mt-1">{changeLabel}</p>}
      </div>
    </div>
  );
}
