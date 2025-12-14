'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  AlertTriangle,
  Shield,
  Ban,
  CheckCircle,
  Flag,
  User,
  Briefcase,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { reportsAPI, dashboardAPI } from '@/services/api';
import { formatDate } from '@/lib/utils';
import { Report } from '@/types';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports', page, search, statusFilter, typeFilter],
    queryFn: () =>
      reportsAPI.getAll({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution, action }: { id: string; resolution: string; action: string }) =>
      reportsAPI.resolve(id, { resolution, action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowReportModal(false);
      setResolutionNote('');
    },
  });

  // Extract data from API response
  // API returns: { data: { success: true, data: { reports: [], total, ... } } }
  const apiResponse = (reportsData as any)?.data;
  const reportsResponse = apiResponse?.data || apiResponse;
  const rawReports = reportsResponse?.reports || reportsResponse?.data;
  const reports: Report[] = Array.isArray(rawReports) ? rawReports : [];
  const totalPages = reportsResponse?.totalPages || 1;
  const totalReports = reportsResponse?.total || 0;

  // Get stats
  const stats = (statsData as any)?.data || statsData || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="secondary">Dismissed</Badge>;
      case 'escalated':
        return <Badge variant="danger">Escalated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'spam':
        return <Badge variant="info">Spam</Badge>;
      case 'fraud':
        return <Badge variant="danger">Fraud</Badge>;
      case 'harassment':
        return <Badge variant="danger">Harassment</Badge>;
      case 'inappropriate':
        return <Badge variant="warning">Inappropriate</Badge>;
      case 'fake':
        return <Badge variant="warning">Fake Profile</Badge>;
      case 'other':
        return <Badge variant="secondary">Other</Badge>;
      default:
        return <Badge>{reason}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'job':
        return <Briefcase className="w-4 h-4 text-green-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default:
        return <Flag className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleResolve = (action: string) => {
    if (selectedReport) {
      resolveMutation.mutate({
        id: selectedReport.id,
        resolution: resolutionNote,
        action,
      });
    }
  };

  const pendingCount = stats.reports?.pending || 0;

  if (isLoading) {
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Moderation</h1>
            <p className="text-gray-500 mt-1">Review and handle user reports ({totalReports} total)</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{pendingCount} pending reports require attention</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.reports?.pending || 0}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.reports?.investigating || 0}</div>
                  <div className="text-sm text-gray-500">Investigating</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.reports?.total || 0}</div>
                  <div className="text-sm text-gray-500">Total Reports</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.users?.banned || 0}</div>
                  <div className="text-sm text-gray-500">Users Banned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search reports..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'dismissed', label: 'Dismissed' },
                  { value: 'escalated', label: 'Escalated' },
                ]}
                className="w-40"
              />
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'user', label: 'User' },
                  { value: 'job', label: 'Job' },
                  { value: 'message', label: 'Message' },
                ]}
                className="w-40"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardContent className="p-0">
            {reports.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                No reports found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Reported Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className={report.status === 'pending' ? 'bg-amber-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(report.type)}
                          <span className="capitalize">{report.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getReasonBadge(report.reason)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={`${report.reporter?.firstName} ${report.reporter?.lastName}`}
                            src={(report.reporter as any)?.profilePhotoUrl}
                            size="sm"
                          />
                          <span className="text-sm">
                            {report.reporter?.firstName} {report.reporter?.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.type === 'user' && report.reportedUser && (
                          <span className="text-sm">
                            {report.reportedUser.firstName} {report.reportedUser.lastName}
                          </span>
                        )}
                        {report.type === 'job' && report.reportedJob && (
                          <span className="text-sm truncate max-w-[200px] block">
                            {report.reportedJob.title}
                          </span>
                        )}
                        {report.type === 'message' && (
                          <span className="text-sm text-gray-500">Message #{report.reportedId}</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{formatDate(report.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        {/* Report Detail Modal */}
        <Modal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setResolutionNote('');
          }}
          title="Report Details"
        >
          {selectedReport && (
            <div className="space-y-6">
              {/* Report Type and Reason */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedReport.type)}
                  <span className="font-medium capitalize">{selectedReport.type} Report</span>
                </div>
                {getReasonBadge(selectedReport.reason)}
                {getStatusBadge(selectedReport.status)}
              </div>

              {/* Reporter */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Avatar
                  name={`${selectedReport.reporter?.firstName} ${selectedReport.reporter?.lastName}`}
                />
                <div>
                  <p className="text-sm text-gray-500">Reported by</p>
                  <p className="font-medium">
                    {selectedReport.reporter?.firstName} {selectedReport.reporter?.lastName}
                  </p>
                </div>
              </div>

              {/* Reported Content */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium mb-2">Reported Content</p>
                {selectedReport.type === 'user' && selectedReport.reportedUser && (
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={`${selectedReport.reportedUser.firstName} ${selectedReport.reportedUser.lastName}`}
                    />
                    <div>
                      <p className="font-medium">
                        {selectedReport.reportedUser.firstName} {selectedReport.reportedUser.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{selectedReport.reportedUser.email}</p>
                    </div>
                  </div>
                )}
                {selectedReport.type === 'job' && selectedReport.reportedJob && (
                  <p className="font-medium">{selectedReport.reportedJob.title}</p>
                )}
                {selectedReport.type === 'message' && (
                  <p className="text-gray-700">Message ID: {selectedReport.reportedId}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Report Description</p>
                <p className="text-gray-700">{selectedReport.description}</p>
              </div>

              {/* Resolution (if resolved) */}
              {selectedReport.status !== 'pending' && selectedReport.resolution && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-medium mb-2">Resolution</p>
                  <p className="text-gray-700">{selectedReport.resolution}</p>
                  {selectedReport.resolvedBy && (
                    <p className="text-sm text-gray-500 mt-2">
                      Resolved by {selectedReport.resolvedBy.firstName} {selectedReport.resolvedBy.lastName}
                    </p>
                  )}
                </div>
              )}

              {/* Resolution Form (if pending) */}
              {selectedReport.status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution Note
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={3}
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Add a note about your resolution..."
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      onClick={() => handleResolve('warn')}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Warn User
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleResolve('ban')}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Ban User
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleResolve('remove')}
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Remove Content
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleResolve('dismiss')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Dismiss Report
                    </Button>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-gray-500 pt-4 border-t">
                <p>Submitted: {formatDate(selectedReport.createdAt)}</p>
                <p>Last updated: {formatDate(selectedReport.updatedAt)}</p>
              </div>

              {/* Close Button */}
              {selectedReport.status !== 'pending' && (
                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowReportModal(false)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
