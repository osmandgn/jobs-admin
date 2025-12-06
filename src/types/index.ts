export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePhoto?: string | null;
  profilePhotoUrl?: string;
  role: 'user' | 'admin' | 'super_admin' | 'worker' | 'employer' | 'both';
  status: 'active' | 'suspended' | 'banned' | 'deleted' | 'pending';
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isVerified?: boolean;
  bio?: string;
  locationPostcode?: string;
  locationCity?: string;
  averageRating?: number;
  rating?: number;
  totalReviews?: number;
  totalJobs?: number;
  totalEarnings?: number;
  totalJobsPosted?: number;
  totalJobsCompleted?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'active' | 'in_progress' | 'completed' | 'cancelled' | 'expired' | 'rejected';
  payAmount: number;
  payType: 'hourly' | 'daily' | 'fixed';
  locationPostcode?: string;
  locationCity?: string;
  isRemote?: boolean;
  jobDate?: string;
  startTime?: string;
  endTime?: string;
  expiresAt?: string;
  experienceLevel?: 'entry' | 'intermediate' | 'expert' | 'senior';
  estimatedDuration?: string;
  applicationsCount?: number;
  viewsCount?: number;
  isFeatured?: boolean;
  poster?: Partial<User>;
  posterId?: string;
  employer?: Partial<User>;
  employerId?: string;
  category?: Partial<Category>;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'hired' | 'completed';
  message?: string;
  coverLetter?: string;
  proposedRate?: number;
  job: Partial<Job>;
  jobId: string;
  applicant: Partial<User>;
  applicantId: string;
  employer?: Partial<User>;
  employerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  emoji?: string;
  icon?: string;
  color?: string;
  jobsCount?: number;
  jobCount?: number;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  createdAt?: string;
}

export interface Skill {
  id: string;
  name: string;
  slug?: string;
  categoryId?: string;
  category?: Partial<Category>;
  usersCount?: number;
  createdAt?: string;
}

export interface Report {
  id: string;
  type: 'user' | 'job' | 'review' | 'message';
  reason: 'spam' | 'harassment' | 'inappropriate' | 'fraud' | 'fake' | 'other';
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed' | 'escalated';
  targetId?: string;
  reportedId?: string;
  reportedUser?: Partial<User>;
  reportedJob?: Partial<Job>;
  targetUser?: Partial<User>;
  targetJob?: Partial<Job>;
  reporter?: Partial<User>;
  reporterId: string;
  resolvedBy?: Partial<User>;
  resolvedById?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  reviewer: User;
  reviewerId: string;
  reviewee: User;
  revieweeId: string;
  job: Job;
  jobId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalJobs: number;
  activeJobs: number;
  newJobsToday: number;
  completedJobs: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  totalReports: number;
  pendingReports: number;
  totalReviews: number;
  averageRating: number;
}

export interface ChartData {
  date: string;
  users: number;
  jobs: number;
  applications: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
  admin: User;
  adminId: string;
  createdAt: string;
}
