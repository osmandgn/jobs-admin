'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { monitoringAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ErrorItem({ error }: { error: any }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyStack = () => {
    if (error.stack) {
      navigator.clipboard.writeText(error.stack);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="danger">{error.statusCode}</Badge>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(error.timestamp), { addSuffix: true })}
            </span>
          </div>
          <p className="font-medium text-sm truncate">{error.message}</p>
          <p className="text-xs text-gray-500 font-mono">
            {error.method} {error.endpoint}
          </p>
        </div>
        <button className="p-1 hover:bg-gray-200 rounded">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Stack Trace</span>
            {error.stack && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyStack();
                }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          {error.stack ? (
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto max-h-48">
              {error.stack}
            </pre>
          ) : (
            <p className="text-xs text-gray-400 italic">No stack trace available</p>
          )}
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span>Type: <span className="font-medium">{error.type}</span></span>
            <span>Code: <span className="font-medium">{error.code}</span></span>
            {error.requestId && <span>Request ID: <span className="font-mono">{error.requestId}</span></span>}
          </div>
        </div>
      )}
    </div>
  );
}

export function ErrorList() {
  const [selectedType, setSelectedType] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['monitoring', 'errors', selectedType],
    queryFn: () => monitoringAPI.getErrors({ limit: 20, type: selectedType || undefined }),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { errors = [], types = [] } = data?.data || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Recent Errors
            {errors.length > 0 && (
              <Badge variant="danger">{errors.length}</Badge>
            )}
          </CardTitle>
          {types.length > 0 && (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="">All Types</option>
              {types.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {errors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No errors recorded</p>
            </div>
          ) : (
            errors.map((error: any) => (
              <ErrorItem key={error.id} error={error} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
