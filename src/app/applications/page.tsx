'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
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
import { applicationsAPI, dashboardAPI } from '@/services/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Application } from '@/types';

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['applications', page, search, statusFilter],
    queryFn: () =>
      applicationsAPI.getAll({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      applicationsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  // Extract data from API response
  // API returns: { data: { success: true, data: { applications: [], total, ... } } }
  const apiResponse = (applicationsData as any)?.data;
  const responseData = apiResponse?.data || apiResponse;
  const rawApplications = responseData?.applications || responseData?.data;
  const applications: Application[] = Array.isArray(rawApplications) ? rawApplications : [];
  const totalPages = responseData?.totalPages || 1;
  const totalApplications = responseData?.total || 0;

  // Get stats
  const stats = (statsData as any)?.data || statsData || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'hired':
        return <Badge variant="info">Hired</Badge>;
      case 'withdrawn':
        return <Badge variant="secondary">Withdrawn</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'hired':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-500 mt-1">View and manage all job applications ({totalApplications} total)</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.applications?.pending || 0}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.applications?.accepted || 0}</div>
                  <div className="text-sm text-gray-500">Accepted</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.applications?.rejected || 0}</div>
                  <div className="text-sm text-gray-500">Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.applications?.total || 0}</div>
                  <div className="text-sm text-gray-500">Total</div>
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
                    placeholder="Search by job title or applicant name..."
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
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'hired', label: 'Hired' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'withdrawn', label: 'Withdrawn' },
                  { value: 'completed', label: 'Completed' },
                ]}
                className="w-48"
              />
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-0">
            {applications.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                No applications found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Employer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Proposed Rate</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={`${application.applicant?.firstName} ${application.applicant?.lastName}`}
                            src={(application.applicant as any)?.profilePhotoUrl}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {application.applicant?.firstName} {application.applicant?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {application.applicant?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {application.job?.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(Number(application.job?.payAmount) || 0)} / {application.job?.payType}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">
                          {application.employer?.firstName} {application.employer?.lastName}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        {application.proposedRate ? (
                          <span className="font-medium">
                            {formatCurrency(Number(application.proposedRate))}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(application.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewApplication(application)}
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

        {/* Application Detail Modal */}
        <Modal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          title="Application Details"
        >
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar
                  name={`${selectedApplication.applicant?.firstName} ${selectedApplication.applicant?.lastName}`}
                  size="lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedApplication.applicant?.firstName}{' '}
                    {selectedApplication.applicant?.lastName}
                  </h3>
                  <p className="text-gray-500">{selectedApplication.applicant?.email}</p>
                  {selectedApplication.applicant?.rating && (
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="font-medium">
                        {selectedApplication.applicant.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Info */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Applied for</p>
                <p className="font-medium text-gray-900">{selectedApplication.job?.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Job rate: {formatCurrency(selectedApplication.job?.payAmount || 0)} /{' '}
                  {selectedApplication.job?.payType}
                </p>
              </div>

              {/* Status and Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedApplication.status)}
                    <span className="font-medium capitalize">{selectedApplication.status}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Proposed Rate</p>
                  <p className="font-medium">
                    {selectedApplication.proposedRate
                      ? formatCurrency(selectedApplication.proposedRate)
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Cover Letter</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* Employer Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Avatar
                  name={`${selectedApplication.employer?.firstName} ${selectedApplication.employer?.lastName}`}
                  size="sm"
                />
                <div>
                  <p className="text-sm text-gray-500">Employer</p>
                  <p className="font-medium">
                    {selectedApplication.employer?.firstName}{' '}
                    {selectedApplication.employer?.lastName}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-sm text-gray-500">
                <p>Applied: {formatDate(selectedApplication.createdAt)}</p>
                <p>Last updated: {formatDate(selectedApplication.updatedAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowApplicationModal(false)}>
                  Close
                </Button>
                <Button variant="outline">View Applicant Profile</Button>
                <Button variant="outline">View Job</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
