'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import {
  SystemOverview,
  ApiMetricsCards,
  EndpointsTable,
  ErrorList,
  QueryTable,
  LogViewer,
} from '@/components/monitoring';
import { Activity } from 'lucide-react';

export default function MonitoringPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6" />
              System Monitoring
            </h1>
            <p className="text-gray-500 mt-1">
              Real-time system health, API metrics, and logs
            </p>
          </div>
        </div>

        {/* System Overview */}
        <SystemOverview />

        {/* API Metrics */}
        <ApiMetricsCards />

        {/* Two Column Layout: Endpoints & Errors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EndpointsTable />
          <ErrorList />
        </div>

        {/* Query Analytics */}
        <QueryTable />

        {/* Live Logs */}
        <LogViewer />
      </div>
    </AdminLayout>
  );
}
