'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import Chart from '@/components/dashboard/Chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { dashboardAPI } from '@/services/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard-chart'],
    queryFn: () => dashboardAPI.getChartData(),
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: dashboardAPI.getRecentActivity,
  });

  const { data: employersData, isLoading: employersLoading } = useQuery({
    queryKey: ['dashboard-top-employers'],
    queryFn: () => dashboardAPI.getTopEmployers(),
  });

  // Extract data from API responses
  const stats = (statsData as any)?.data || statsData || {};
  const chart = Array.isArray((chartData as any)?.data) ? (chartData as any).data : (Array.isArray(chartData) ? chartData : []);
  const activities = Array.isArray((activityData as any)?.data) ? (activityData as any).data : (Array.isArray(activityData) ? activityData : []);
  const employers = Array.isArray((employersData as any)?.data) ? (employersData as any).data : (Array.isArray(employersData) ? employersData : []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'job_created':
        return <Briefcase className="w-4 h-4 text-green-500" />;
      case 'report_created':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'application_received':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'job_completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (statsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.users?.total || 0}
            change={stats.users?.growthRate}
            changeLabel="vs last month"
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <StatsCard
            title="Active Jobs"
            value={stats.jobs?.active || 0}
            icon={Briefcase}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          <StatsCard
            title="Total Applications"
            value={stats.applications?.total || 0}
            icon={FileText}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
          <StatsCard
            title="Pending Reports"
            value={stats.reports?.pending || 0}
            icon={AlertTriangle}
            iconColor="text-red-600"
            iconBg="bg-red-100"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="New Users Today"
            value={stats.users?.today || 0}
            icon={TrendingUp}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-100"
          />
          <StatsCard
            title="Total Jobs"
            value={stats.jobs?.total || 0}
            icon={Briefcase}
            iconColor="text-teal-600"
            iconBg="bg-teal-100"
          />
          <StatsCard
            title="Completed This Week"
            value={stats.jobs?.completedThisWeek || 0}
            icon={CheckCircle}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100"
          />
          <StatsCard
            title="Avg Rating"
            value={stats.reviews?.averageRating?.toFixed(1) || '0.0'}
            icon={DollarSign}
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
        </div>

        {/* Chart */}
        {chartLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-[320px]">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </CardContent>
          </Card>
        ) : chart.length > 0 ? (
          <Chart data={chart} title="Platform Growth Overview" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Platform Growth Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[280px] text-gray-500">
              No chart data available yet
            </CardContent>
          </Card>
        )}

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((item: any, index: number) => (
                    <div key={item.id || index} className="flex items-start gap-3">
                      <div className="mt-1">{getActivityIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{item.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(item.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>

          {/* Top Employers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Employers</CardTitle>
            </CardHeader>
            <CardContent>
              {employersLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : employers.length > 0 ? (
                <div className="space-y-4">
                  {employers.map((employer: any, index: number) => (
                    <div key={employer.id} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        #{index + 1}
                      </span>
                      <Avatar
                        name={employer.name}
                        src={employer.profilePhotoUrl}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {employer.name}
                        </p>
                      </div>
                      <Badge variant="secondary">{employer.jobsCount} jobs</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No employers yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/users"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Users</span>
              </a>
              <a
                href="/jobs"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Briefcase className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Jobs</span>
              </a>
              <a
                href="/reports"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">View Reports</span>
              </a>
              <a
                href="/categories"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Categories</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
