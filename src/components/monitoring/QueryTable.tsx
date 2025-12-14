'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { monitoringAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Database, Clock, Hash } from 'lucide-react';

function DurationBadge({ duration }: { duration: number }) {
  let color = 'bg-green-100 text-green-800';
  if (duration > 100) color = 'bg-red-100 text-red-800';
  else if (duration > 50) color = 'bg-yellow-100 text-yellow-800';

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${color}`}>
      {duration}ms
    </span>
  );
}

export function QueryTable() {
  const [view, setView] = useState<'slow' | 'frequent'>('slow');

  const { data, isLoading } = useQuery({
    queryKey: ['monitoring', 'queries'],
    queryFn: () => monitoringAPI.getQueryAnalytics(20),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Query Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { slowQueries = [], frequentQueries = [] } = data?.data || {};
  const queries = view === 'slow' ? slowQueries : frequentQueries;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Query Analytics
          </CardTitle>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('slow')}
              className={`px-3 py-1 text-sm rounded ${view === 'slow' ? 'bg-white shadow' : ''}`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              Slowest
            </button>
            <button
              onClick={() => setView('frequent')}
              className={`px-3 py-1 text-sm rounded ${view === 'frequent' ? 'bg-white shadow' : ''}`}
            >
              <Hash className="w-4 h-4 inline mr-1" />
              Most Frequent
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-gray-500">Model</th>
                <th className="text-left py-2 font-medium text-gray-500">Operation</th>
                <th className="text-right py-2 font-medium text-gray-500">
                  {view === 'slow' ? 'Avg Time' : 'Count'}
                </th>
                <th className="text-right py-2 font-medium text-gray-500">
                  {view === 'slow' ? 'Max Time' : 'Avg Time'}
                </th>
              </tr>
            </thead>
            <tbody>
              {queries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No query data available
                  </td>
                </tr>
              ) : (
                queries.map((query: any, i: number) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2">
                      <span className="font-medium">{query.model}</span>
                    </td>
                    <td className="py-2">
                      <Badge variant={
                        query.operation === 'findMany' ? 'info' :
                        query.operation === 'create' ? 'success' :
                        query.operation === 'update' ? 'warning' :
                        query.operation === 'delete' ? 'danger' : 'secondary'
                      }>
                        {query.operation}
                      </Badge>
                    </td>
                    <td className="text-right py-2">
                      {view === 'slow' ? (
                        <DurationBadge duration={query.avgDuration} />
                      ) : (
                        <span className="font-medium">{query.count.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="text-right py-2">
                      {view === 'slow' ? (
                        <span className="text-gray-500">{query.maxDuration}ms</span>
                      ) : (
                        <DurationBadge duration={query.avgDuration} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
