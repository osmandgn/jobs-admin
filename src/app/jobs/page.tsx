'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  MapPin,
  Download,
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
import { jobsAPI, dashboardAPI } from '@/services/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Job } from '@/types';

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', page, search, statusFilter],
    queryFn: () =>
      jobsAPI.getAll({
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

  const approveMutation = useMutation({
    mutationFn: jobsAPI.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowJobModal(false);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => jobsAPI.reject(id, 'Rejected by admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowJobModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: jobsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowDeleteModal(false);
      setSelectedJob(null);
    },
  });

  // Extract data from API response
  const jobsResponse = (jobsData as any)?.data;
  const rawJobs = jobsResponse?.data || jobsResponse?.jobs;
  const jobs: Job[] = Array.isArray(rawJobs) ? rawJobs : [];
  const totalPages = jobsResponse?.totalPages || 1;
  const totalJobs = jobsResponse?.total || 0;

  // Get stats from dashboard
  const stats = (statsData as any)?.data || statsData || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'completed':
        return <Badge variant="info">Completed</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleDeleteClick = (job: Job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
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
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-500 mt-1">Manage all job listings ({totalJobs} total)</p>
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
              <div className="text-2xl font-bold text-gray-900">{stats.jobs?.active || 0}</div>
              <div className="text-sm text-gray-500">Active Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-2xl font-bold text-amber-600">{stats.jobs?.pending || 0}</div>
              <div className="text-sm text-gray-500">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-2xl font-bold text-green-600">{stats.jobs?.total || 0}</div>
              <div className="text-sm text-gray-500">Total Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-2xl font-bold text-purple-600">{stats.jobs?.completed || 0}</div>
              <div className="text-sm text-gray-500">Completed</div>
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
                    placeholder="Search jobs by title..."
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
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending Review' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'expired', label: 'Expired' },
                ]}
                className="w-48"
              />
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardContent className="p-0">
            {jobs.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                No jobs found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Employer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pay</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {job.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {job.locationCity}
                            </span>
                            {job.isRemote && (
                              <Badge variant="info" className="text-xs">Remote</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={(job as any).employer?.name || `${job.employer?.firstName} ${job.employer?.lastName}`}
                            size="sm"
                          />
                          <span className="text-sm">
                            {(job as any).employer?.name || `${job.employer?.firstName} ${job.employer?.lastName}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(Number(job.payAmount))}</p>
                          <p className="text-xs text-gray-500 capitalize">{job.payType}</p>
                        </div>
                      </TableCell>
                      <TableCell>{job.applicationsCount}</TableCell>
                      <TableCell>{formatDate(job.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewJob(job)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(['pending', 'pending_review'].includes(job.status)) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => approveMutation.mutate(job.id)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => rejectMutation.mutate(job.id)}
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(job)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
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

        {/* Job Detail Modal */}
        <Modal
          isOpen={showJobModal}
          onClose={() => setShowJobModal(false)}
          title="Job Details"
        >
          {selectedJob && (
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold">{selectedJob.title}</h3>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {selectedJob.locationCity}, {selectedJob.locationPostcode}
                  {selectedJob.isRemote && (
                    <Badge variant="info" className="ml-2">Remote Available</Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{selectedJob.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedJob.category?.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{selectedJob.status}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Pay</p>
                  <p className="font-medium">
                    {formatCurrency(selectedJob.payAmount)} ({selectedJob.payType})
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Experience Level</p>
                  <p className="font-medium capitalize">{selectedJob.experienceLevel}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{selectedJob.estimatedDuration}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Applications</p>
                  <p className="font-medium">{selectedJob.applicationsCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Avatar
                  name={`${selectedJob.employer?.firstName} ${selectedJob.employer?.lastName}`}
                />
                <div>
                  <p className="font-medium">
                    {selectedJob.employer?.firstName} {selectedJob.employer?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">Employer</p>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>Posted: {formatDate(selectedJob.createdAt)}</p>
                {selectedJob.expiresAt && <p>Expires: {formatDate(selectedJob.expiresAt)}</p>}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowJobModal(false)}>
                  Close
                </Button>
                {selectedJob.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => approveMutation.mutate(selectedJob.id)}
                    >
                      Approve Job
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => rejectMutation.mutate(selectedJob.id)}
                    >
                      Reject Job
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Job"
        >
          {selectedJob && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete the job{' '}
                <span className="font-semibold">{selectedJob.title}</span>? This action
                cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => deleteMutation.mutate(selectedJob.id)}
                >
                  Delete Job
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
