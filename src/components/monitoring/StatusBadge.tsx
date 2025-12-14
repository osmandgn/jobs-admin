'use client';

interface StatusBadgeProps {
  status: 'connected' | 'disconnected' | 'degraded';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = {
    connected: 'bg-green-500',
    disconnected: 'bg-red-500',
    degraded: 'bg-yellow-500',
  };

  const labels = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    degraded: 'Degraded',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${colors[status]} animate-pulse`} />
      <span className="text-sm text-gray-600">{label || labels[status]}</span>
    </div>
  );
}
