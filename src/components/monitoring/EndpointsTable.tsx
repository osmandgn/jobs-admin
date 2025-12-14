'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { monitoringAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Globe, ArrowUpDown } from 'lucide-react';

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    PATCH: 'bg-orange-100 text-orange-800',
    DELETE: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[method] || 'bg-gray-100 text-gray-800'}`}>
      {method}
    </span>
  );
}

function ResponseTimeBadge({ time }: { time: number }) {
  let color = 'bg-green-100 text-green-800';
  if (time > 500) color = 'bg-red-100 text-red-800';
  else if (time > 200) color = 'bg-yellow-100 text-yellow-800';

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${color}`}>
      {time}ms
    </span>
  );
}

export function EndpointsTable() {
  const [sort, setSort] = useState<'count' | 'avgTime'>('count');

  const { data, isLoading } = useQuery({
    queryKey: ['monitoring', 'endpoints', sort],
    queryFn: () => monitoringAPI.getEndpointMetrics({ limit: 10, sort }),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
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

  const endpoints = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Top Endpoints
          </CardTitle>
          <button
            onClick={() => setSort(sort === 'count' ? 'avgTime' : 'count')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sort === 'count' ? 'By Requests' : 'By Response Time'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-gray-500">Endpoint</th>
                <th className="text-right py-2 font-medium text-gray-500">Requests</th>
                <th className="text-right py-2 font-medium text-gray-500">Avg Time</th>
                <th className="text-right py-2 font-medium text-gray-500">Errors</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No endpoint data available
                  </td>
                </tr>
              ) : (
                endpoints.map((endpoint: any, i: number) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <MethodBadge method={endpoint.method} />
                        <span className="font-mono text-xs truncate max-w-[200px]">
                          {endpoint.endpoint}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-2 font-medium">
                      {endpoint.count.toLocaleString()}
                    </td>
                    <td className="text-right py-2">
                      <ResponseTimeBadge time={endpoint.avgResponseTime} />
                    </td>
                    <td className="text-right py-2">
                      {endpoint.errorCount > 0 ? (
                        <Badge variant="danger">{endpoint.errorCount}</Badge>
                      ) : (
                        <span className="text-gray-400">0</span>
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
