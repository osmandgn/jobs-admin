'use client';

import { useQuery } from '@tanstack/react-query';
import { monitoringAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'red' | 'yellow';
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${colors[color]} text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <TrendingUp className={`w-3 h-3 ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <span className={trend.value >= 0 ? 'text-green-500' : 'text-red-500'}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-gray-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

export function ApiMetricsCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['monitoring', 'api-metrics'],
    queryFn: () => monitoringAPI.getApiMetrics(),
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const metrics = data?.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          API Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Requests Today"
            value={metrics?.requestsToday?.toLocaleString() || 0}
            subtitle={`${metrics?.requestsThisHour || 0} this hour`}
            icon={Activity}
            color="blue"
          />
          <StatCard
            title="Error Rate"
            value={`${metrics?.errorRate || 0}%`}
            subtitle={`${metrics?.errorCount || 0} errors`}
            icon={AlertTriangle}
            color={metrics?.errorRate > 5 ? 'red' : metrics?.errorRate > 1 ? 'yellow' : 'green'}
          />
          <StatCard
            title="Avg Response"
            value={`${metrics?.avgResponseTime || 0}ms`}
            subtitle="Average response time"
            icon={Clock}
            color={metrics?.avgResponseTime > 500 ? 'red' : metrics?.avgResponseTime > 200 ? 'yellow' : 'green'}
          />
          <StatCard
            title="P95 Response"
            value={`${metrics?.p95ResponseTime || 0}ms`}
            subtitle="95th percentile"
            icon={TrendingUp}
            color={metrics?.p95ResponseTime > 1000 ? 'red' : metrics?.p95ResponseTime > 500 ? 'yellow' : 'blue'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
