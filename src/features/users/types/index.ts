// src/features/users/types/index.ts
import { Permission as PermissionType } from './permissions';

export interface Company {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName?: string;
  department: string;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  phone?: string;
  groups: string[]; // 그룹 이름 배열 (표시용)
  groupIds: string[]; // 그룹 ID 배열
  permissions: PermissionType[]; // 개별 권한
  effectivePermissions?: PermissionType[]; // 그룹 권한 + 개별 권한
}

// API 요청/응답 타입
export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  phone?: string;
  status?: UserStatus;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
  admins: number;
  managers: number;
  operators: number;
  users: number;
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type UserRole = 'admin' | 'manager' | 'operator' | 'user';

export interface UserGroup {
  id: string;
  name: string;
  companyId: string;
  companyName?: string;
  description: string;
  memberCount: number;
  permissions: string[];
  createdAt: string;
  members: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  isSystem: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
  sessionId?: string;
}

export interface UserSettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
  };
  sessionSettings: {
    timeoutMinutes: number;
    maxConcurrentSessions: number;
    requireReauth: boolean;
  };
  notificationSettings: {
    emailNotifications: boolean;
    loginAlerts: boolean;
    securityAlerts: boolean;
    systemUpdates: boolean;
  };
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
  admins: number;
  managers: number;
  operators: number;
  users: number;
  todayLogins: number;
  weeklyLogins: number;
  monthlyLogins: number;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  companyId?: string;
  department?: string;
  group?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface UserSort {
  field: keyof User;
  direction: 'asc' | 'desc';
}
