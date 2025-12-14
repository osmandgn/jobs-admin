import axios from 'axios';
import type {
  User,
  Job,
  Application,
  Category,
  Skill,
  Report,
  Review,
  DashboardStats,
  ChartData,
  PaginatedResponse,
  AdminLog,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<{ data: { user: User; accessToken: string; refreshToken: string } }>('/auth/login', { email, password }),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  me: () =>
    api.get<{ data: User }>('/auth/me'),
};

// Dashboard
export const dashboardAPI = {
  getStats: () =>
    api.get<{ data: DashboardStats }>('/admin/dashboard').then(res => res.data),

  getChartData: (days: number = 365) =>
    api.get<{ data: ChartData[] }>('/admin/chart', { params: { days } }).then(res => res.data),

  getRecentActivity: () =>
    api.get<{ data: AdminLog[] }>('/admin/activity').then(res => res.data),

  getTopEmployers: (limit: number = 5) =>
    api.get<{ data: Array<{ id: string; name: string; email: string; profilePhotoUrl: string | null; jobsCount: number }> }>('/admin/top-employers', { params: { limit } }).then(res => res.data),
};

// Users
export const usersAPI = {
  getAll: (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
    sort?: string;
  }) => api.get<{ data: PaginatedResponse<User> }>('/admin/users', { params }),

  getById: (id: string) =>
    api.get<{ data: User }>(`/admin/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    api.put<{ data: User }>(`/admin/users/${id}`, data),

  updateStatus: (id: string, status: string, reason?: string) => {
    // Map status to the correct backend endpoint
    if (status === 'suspended') {
      return api.post<{ data: User }>(`/admin/users/${id}/suspend`, { reason });
    } else if (status === 'active') {
      return api.post<{ data: User }>(`/admin/users/${id}/unsuspend`);
    } else if (status === 'banned') {
      return api.post<{ data: User }>(`/admin/users/${id}/ban`, { reason });
    }
    // Fallback for any other status
    return api.patch<{ data: User }>(`/admin/users/${id}`, { status });
  },

  delete: (id: string) =>
    api.delete(`/admin/users/${id}`),

  getJobs: (id: string) =>
    api.get<{ data: Job[] }>(`/admin/users/${id}/jobs`),

  getApplications: (id: string) =>
    api.get<{ data: Application[] }>(`/admin/users/${id}/applications`),

  getReviews: (id: string) =>
    api.get<{ data: Review[] }>(`/admin/users/${id}/reviews`),

  impersonate: (id: string) =>
    api.post<{ data: { token: string } }>(`/admin/users/${id}/impersonate`),
};

// Jobs
export const jobsAPI = {
  getAll: (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    categoryId?: string;
    sort?: string;
  }) => api.get<{ data: PaginatedResponse<Job> }>('/admin/jobs', { params }),

  getById: (id: string) =>
    api.get<{ data: Job }>(`/admin/jobs/${id}`),

  update: (id: string, data: Partial<Job>) =>
    api.put<{ data: Job }>(`/admin/jobs/${id}`, data),

  updateStatus: (id: string, status: Job['status']) =>
    api.patch<{ data: Job }>(`/admin/jobs/${id}/status`, { status }),

  delete: (id: string) =>
    api.delete(`/admin/jobs/${id}`),

  getApplications: (id: string) =>
    api.get<{ data: Application[] }>(`/admin/jobs/${id}/applications`),

  approve: (id: string) =>
    api.post(`/admin/jobs/${id}/approve`),

  reject: (id: string, reason: string) =>
    api.post(`/admin/jobs/${id}/reject`, { reason }),
};

// Applications
export const applicationsAPI = {
  getAll: (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sort?: string;
  }) => api.get<{ data: PaginatedResponse<Application> }>('/admin/applications', { params }),

  getById: (id: string) =>
    api.get<{ data: Application }>(`/admin/applications/${id}`),

  updateStatus: (id: string, status: string) =>
    api.patch<{ data: Application }>(`/admin/applications/${id}/status`, { status }),
};

// Categories
export const categoriesAPI = {
  getAll: () =>
    api.get<{ data: Category[] }>('/admin/categories'),

  create: (data: { name: string; slug: string; description?: string; emoji?: string; color?: string; parentId?: string }) =>
    api.post<{ data: Category }>('/admin/categories', data),

  update: (id: string, data: Partial<Category>) =>
    api.put<{ data: Category }>(`/admin/categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/categories/${id}`),

  reorder: (categories: { id: string; order: number }[]) =>
    api.post('/admin/categories/reorder', { categories }),
};

// Skills
export const skillsAPI = {
  getAll: (params?: { categoryId?: string }) =>
    api.get<{ data: Skill[] }>('/admin/skills', { params }),

  create: (data: { name: string; categoryId?: string }) =>
    api.post<{ data: Skill }>('/admin/skills', data),

  update: (id: string, data: Partial<Skill>) =>
    api.put<{ data: Skill }>(`/admin/skills/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/skills/${id}`),
};

// Reports
export const reportsAPI = {
  getAll: (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    sort?: string;
  }) => api.get<{ data: PaginatedResponse<Report> }>('/admin/reports', { params }),

  getById: (id: string) =>
    api.get<{ data: Report }>(`/admin/reports/${id}`),

  resolve: (id: string, data: { resolution: string; action?: string }) =>
    api.post<{ data: Report }>(`/admin/reports/${id}/action`, data),
};

// Reviews
export const reviewsAPI = {
  getAll: (params: {
    page?: number;
    limit?: number;
    sort?: string;
  }) => api.get<{ data: PaginatedResponse<Review> }>('/admin/reviews', { params }),

  delete: (id: string) =>
    api.delete(`/admin/reviews/${id}`),
};

// Settings
export const settingsAPI = {
  getAll: () =>
    api.get<{ data: Record<string, any> }>('/admin/settings'),

  update: (data: Record<string, any>) =>
    api.put('/admin/settings', data),

  getLegal: (type: string) =>
    api.get<{ data: { content: string; version: string } }>(`/admin/legal/${type}`),

  updateLegal: (type: string, content: string) =>
    api.put(`/admin/legal/${type}`, { content }),
};

// Admin Logs
export const logsAPI = {
  getAll: (params: {
    page?: number;
    limit?: number;
    action?: string;
    adminId?: string;
  }) => api.get<{ data: PaginatedResponse<AdminLog> }>('/admin/logs', { params }),
};

// System Monitoring
export const monitoringAPI = {
  getSystemOverview: () =>
    api.get('/admin/monitoring/system').then(res => res.data),

  getApiMetrics: () =>
    api.get('/admin/monitoring/api-metrics').then(res => res.data),

  getEndpointMetrics: (params?: { limit?: number; sort?: 'count' | 'avgTime' }) =>
    api.get('/admin/monitoring/endpoints', { params }).then(res => res.data),

  getSlowestEndpoints: (limit: number = 10) =>
    api.get('/admin/monitoring/endpoints/slowest', { params: { limit } }).then(res => res.data),

  getErrors: (params?: { limit?: number; type?: string }) =>
    api.get('/admin/monitoring/errors', { params }).then(res => res.data),

  getErrorTrends: (days: number = 7) =>
    api.get('/admin/monitoring/errors/trends', { params: { days } }).then(res => res.data),

  getErrorsByType: (date?: string) =>
    api.get('/admin/monitoring/errors/by-type', { params: { date } }).then(res => res.data),

  getQueryAnalytics: (limit: number = 20) =>
    api.get('/admin/monitoring/queries', { params: { limit } }).then(res => res.data),

  getLogs: (params?: { level?: string; search?: string; limit?: number }) =>
    api.get('/admin/monitoring/logs', { params }).then(res => res.data),
};

export default api;
