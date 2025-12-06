'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
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
import { usersAPI } from '@/services/api';
import { formatDate } from '@/lib/utils';
import { User } from '@/types';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', page, search, statusFilter, roleFilter],
    queryFn: () =>
      usersAPI.getAll({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      usersAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowUserModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDeleteModal(false);
      setSelectedUser(null);
    },
  });

  // Extract data from API response
  const usersResponse = (usersData as any)?.data;
  const rawUsers = usersResponse?.data || usersResponse?.users;
  const users: User[] = Array.isArray(rawUsers) ? rawUsers : [];
  const totalPages = usersResponse?.totalPages || 1;
  const totalUsers = usersResponse?.total || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'suspended':
        return <Badge variant="danger">Suspended</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'banned':
        return <Badge variant="danger">Banned</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'worker':
        return <Badge variant="info">Worker</Badge>;
      case 'employer':
        return <Badge variant="secondary">Employer</Badge>;
      case 'both':
        return <Badge variant="default">Both</Badge>;
      case 'admin':
        return <Badge variant="danger">Admin</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: userId, status: newStatus });
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
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
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-500 mt-1">Manage all platform users ({totalUsers} total)</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
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
                  { value: 'pending', label: 'Pending' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'banned', label: 'Banned' },
                ]}
                className="w-40"
              />
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Roles' },
                  { value: 'worker', label: 'Worker' },
                  { value: 'employer', label: 'Employer' },
                  { value: 'both', label: 'Both' },
                  { value: 'admin', label: 'Admin' },
                ]}
                className="w-40"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                No users found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={(user as any).profilePhotoUrl || user.profilePhoto}
                            name={`${user.firstName} ${user.lastName}`}
                            size="md"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                              {(user.isVerified || (user as any).emailVerified) && (
                                <CheckCircle className="inline w-4 h-4 ml-1 text-blue-500" />
                              )}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role || ((user as any).isEmployer ? 'employer' : 'worker'))}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.rating && user.rating > 0 ? (
                          <span className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            {user.rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{(user as any).jobsCount ?? user.totalJobs ?? 0}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(user.id, 'suspended')}
                            >
                              <Ban className="w-4 h-4 text-red-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(user.id, 'active')}
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
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

        {/* User Detail Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          title="User Details"
        >
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar
                  src={(selectedUser as any).profilePhotoUrl || selectedUser.profilePhoto}
                  name={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  size="lg"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <p className="text-gray-500">{selectedUser.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{selectedUser.role || ((selectedUser as any).isEmployer ? 'employer' : 'worker')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{selectedUser.status}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-medium">
                    {selectedUser.rating && selectedUser.rating > 0 ? `${selectedUser.rating.toFixed(1)} ★` : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Jobs</p>
                  <p className="font-medium">{(selectedUser as any).jobsCount ?? selectedUser.totalJobs ?? 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Applications</p>
                  <p className="font-medium">{(selectedUser as any).applicationsCount ?? 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Verified</p>
                  <p className="font-medium">{(selectedUser.isVerified || (selectedUser as any).emailVerified) ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {selectedUser.bio && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Bio</p>
                  <p className="text-gray-700">{selectedUser.bio}</p>
                </div>
              )}

              <div className="text-sm text-gray-500">
                <p>Joined: {formatDate(selectedUser.createdAt)}</p>
                <p>Last updated: {formatDate(selectedUser.updatedAt)}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowUserModal(false)}
                >
                  Close
                </Button>
                <Button
                  variant={selectedUser.status === 'active' ? 'danger' : 'primary'}
                  disabled={updateStatusMutation.isPending}
                  onClick={() => {
                    handleStatusChange(
                      selectedUser.id,
                      selectedUser.status === 'active' ? 'suspended' : 'active'
                    );
                  }}
                >
                  {updateStatusMutation.isPending ? 'Processing...' : selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete User"
        >
          {selectedUser && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {selectedUser.firstName} {selectedUser.lastName}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => deleteMutation.mutate(selectedUser.id)}
                >
                  Delete User
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
