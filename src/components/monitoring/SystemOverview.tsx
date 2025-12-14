'use client';

import { useQuery } from '@tanstack/react-query';
import { monitoringAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from './StatusBadge';
import { Cpu, HardDrive, Clock, Users, Database, Server } from 'lucide-react';

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color?: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-semibold">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, color = 'blue' }: { value: number; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const barColor = value > 90 ? 'red' : value > 70 ? 'yellow' : color;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${colors[barColor]} transition-all duration-300`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export function SystemOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['monitoring', 'system'],
    queryFn: () => monitoringAPI.getSystemOverview(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const system = data?.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          System Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <MetricCard
            title="Uptime"
            value={system?.uptimeFormatted || '-'}
            icon={Clock}
            color="green"
          />
          <MetricCard
            title="CPU Usage"
            value={`${system?.cpu?.usage || 0}%`}
            subtitle={`${system?.cpu?.cores || 0} cores`}
            icon={Cpu}
            color="blue"
          />
          <MetricCard
            title="Memory"
            value={`${system?.memory?.percentage || 0}%`}
            subtitle={`${formatBytes(system?.memory?.used || 0)} / ${formatBytes(system?.memory?.total || 0)}`}
            icon={HardDrive}
            color="purple"
          />
          <MetricCard
            title="Connections"
            value={system?.activeConnections || 0}
            icon={Users}
            color="yellow"
          />
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Redis</p>
                <StatusBadge status={system?.redis?.status || 'disconnected'} />
                {system?.redis?.memoryUsage && (
                  <p className="text-xs text-gray-400">{system.redis.memoryUsage}</p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Database</p>
                <StatusBadge status={system?.database?.status || 'disconnected'} />
                {system?.database?.responseTime && (
                  <p className="text-xs text-gray-400">{system.database.responseTime}ms</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>CPU Load</span>
              <span>{system?.cpu?.usage || 0}%</span>
            </div>
            <ProgressBar value={system?.cpu?.usage || 0} color="blue" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Memory Usage</span>
              <span>{system?.memory?.percentage || 0}%</span>
            </div>
            <ProgressBar value={system?.memory?.percentage || 0} color="purple" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-400">
          <span>Node {system?.nodeVersion}</span>
          <span>{system?.platform}</span>
        </div>
      </CardContent>
    </Card>
  );
}
