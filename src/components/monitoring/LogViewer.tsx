'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { monitoringAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Search, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: 'text-gray-500 bg-gray-100',
  INFO: 'text-blue-600 bg-blue-100',
  WARN: 'text-yellow-600 bg-yellow-100',
  ERROR: 'text-red-600 bg-red-100',
};

function LogEntry({ log }: { log: any }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded">
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${LEVEL_COLORS[log.level] || LEVEL_COLORS.INFO}`}>
        {log.level}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono break-all">{log.message}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
          {log.requestId && (
            <span className="font-mono">ID: {log.requestId.slice(0, 8)}</span>
          )}
          {log.source && <span>Source: {log.source}</span>}
        </div>
      </div>
    </div>
  );
}

export function LogViewer() {
  const [search, setSearch] = useState('');
  const [levels, setLevels] = useState<string[]>(['INFO', 'WARN', 'ERROR']);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['monitoring', 'logs', levels.join(','), search],
    queryFn: () => monitoringAPI.getLogs({
      level: levels.join(','),
      search: search || undefined,
      limit: 100,
    }),
    refetchInterval: 10000,
  });

  const toggleLevel = (level: string) => {
    setLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { logs = [], stats = {} } = data?.data || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Live Logs
          </CardTitle>

          <div className="flex items-center gap-3">
            {/* Level filters */}
            <div className="flex gap-1">
              {['DEBUG', 'INFO', 'WARN', 'ERROR'].map(level => (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    levels.includes(level)
                      ? LEVEL_COLORS[level]
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {level}
                  {stats[level] > 0 && (
                    <span className="ml-1 opacity-70">({stats[level]})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Refresh button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No logs found</p>
            </div>
          ) : (
            logs.map((log: any) => (
              <LogEntry key={log.id} log={log} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
