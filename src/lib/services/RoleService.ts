// src/lib/services/RoleService.ts
import { Role, Permission } from '../../features/users/types/permissions';

export interface RoleServiceResponse {
  roles: Role[];
  total: number;
}

export interface RoleResponse {
  role: Role;
  message?: string;
}

export interface RoleFilters {
  search?: string;
  isSystem?: boolean;
}

class RoleService {
  private baseUrl = '/api/users/roles';

  /**
   * 역할 목록 조회
   */
  async getRoles(filters?: RoleFilters): Promise<RoleServiceResponse> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isSystem !== undefined) params.append('isSystem', String(filters.isSystem));

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '역할 목록을 가져오는데 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('RoleService.getRoles error:', error);
      // 에러 발생 시 빈 배열 반환
      return {
        roles: [],
        total: 0
      };
    }
  }

  /**
   * 역할 상세 조회
   */
  async getRole(id: string): Promise<Role> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '역할 정보를 가져오는데 실패했습니다');
      }

      const data = await response.json();
      return data.role;
    } catch (error) {
      console.error('RoleService.getRole error:', error);
      throw error;
    }
  }

  /**
   * 역할 생성
   */
  async createRole(roleData: {
    name: string;
    description: string;
    permissions: Permission[];
  }): Promise<RoleResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '역할 생성에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('RoleService.createRole error:', error);
      throw error;
    }
  }

  /**
   * 역할 수정
   */
  async updateRole(id: string, updates: {
    name?: string;
    description?: string;
    permissions?: Permission[];
  }): Promise<RoleResponse> {
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
        throw new Error(errorData.message || '역할 수정에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('RoleService.updateRole error:', error);
      throw error;
    }
  }

  /**
   * 역할 권한 수정
   */
  async updateRolePermissions(id: string, permissions: Permission[]): Promise<RoleResponse> {
    return this.updateRole(id, { permissions });
  }

  /**
   * 역할 삭제
   */
  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '역할 삭제에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('RoleService.deleteRole error:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const roleService = new RoleService();
export default roleService;

