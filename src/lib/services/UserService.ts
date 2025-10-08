// src/lib/services/UserService.ts
import { User, UserFilters, CreateUserRequest, UpdateUserRequest, UserStats } from '../../features/users/types';

export interface UserServiceResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserResponse {
  user: User;
  message: string;
}

export interface UpdateUserResponse {
  user: User;
  message: string;
}

export interface DeleteUserResponse {
  message: string;
}

class UserService {
  private baseUrl = '/api/users';

  /**
   * 사용자 목록 조회
   */
  async getUsers(filters?: UserFilters): Promise<UserServiceResponse> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 목록을 가져오는데 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('UserService.getUsers error:', error);
      throw error;
    }
  }

  /**
   * 사용자 상세 조회
   */
  async getUser(id: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 정보를 가져오는데 실패했습니다');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('UserService.getUser error:', error);
      throw error;
    }
  }

  /**
   * 사용자 생성
   */
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 생성에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('UserService.createUser error:', error);
      throw error;
    }
  }

  /**
   * 사용자 수정
   */
  async updateUser(id: string, updates: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 수정에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('UserService.updateUser error:', error);
      throw error;
    }
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(id: string): Promise<DeleteUserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 삭제에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('UserService.deleteUser error:', error);
      throw error;
    }
  }

  /**
   * 사용자 상태 변경
   */
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'pending' | 'suspended'): Promise<UpdateUserResponse> {
    return this.updateUser(id, { status });
  }

  /**
   * 사용자 역할 변경
   */
  async updateUserRole(id: string, role: 'admin' | 'manager' | 'operator' | 'user'): Promise<UpdateUserResponse> {
    return this.updateUser(id, { role });
  }

  /**
   * 사용자 통계 조회
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 통계를 가져오는데 실패했습니다');
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('UserService.getUserStats error:', error);
      throw error;
    }
  }

  /**
   * 일괄 작업 - 사용자 상태 변경
   */
  async batchUpdateStatus(userIds: string[], status: 'active' | 'inactive' | 'pending' | 'suspended'): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/batch/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds, status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '일괄 상태 변경에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('UserService.batchUpdateStatus error:', error);
      throw error;
    }
  }

  /**
   * 일괄 작업 - 사용자 삭제
   */
  async batchDeleteUsers(userIds: string[]): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/batch`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '일괄 삭제에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('UserService.batchDeleteUsers error:', error);
      throw error;
    }
  }

  /**
   * 사용자 검색 (자동완성용)
   */
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 검색에 실패했습니다');
      }

      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('UserService.searchUsers error:', error);
      throw error;
    }
  }

  /**
   * 사용자 데이터 내보내기
   */
  async exportUsers(userIds: string[], format: 'csv' | 'json' = 'csv'): Promise<Blob | any> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds, format }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '사용자 데이터 내보내기에 실패했습니다');
      }

      if (format === 'csv') {
        return await response.blob();
      } else {
        return await response.json();
      }
    } catch (error) {
      console.error('UserService.exportUsers error:', error);
      throw error;
    }
  }

  /**
   * 비밀번호 초기화
   */
  async resetPasswords(userIds: string[]): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '비밀번호 초기화에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('UserService.resetPasswords error:', error);
      throw error;
    }
  }

  /**
   * CSV 파일 다운로드 헬퍼
   */
  downloadCSV(blob: Blob, filename: string = 'users_export.csv'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// 싱글톤 인스턴스 생성
export const userService = new UserService();
export default userService;
