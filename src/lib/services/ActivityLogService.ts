// src/lib/services/ActivityLogService.ts
import { ActivityLog, ActivityLogFilters, ActivityLogStats, LogAction, LogStatus, LogSeverity } from '../../src/features/users/types/activity';

const API_BASE_URL = '/api/activity-logs';

export class ActivityLogService {
  /**
   * 활동 로그 목록 조회
   */
  static async getActivityLogs(filters: ActivityLogFilters = {}): Promise<{
    logs: ActivityLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch activity logs');
      }

      return await response.json();
    } catch (error) {
      console.error('ActivityLogService.getActivityLogs error:', error);
      throw error;
    }
  }

  /**
   * 활동 로그 통계 조회
   */
  static async getActivityLogStats(filters: Partial<ActivityLogFilters> = {}): Promise<ActivityLogStats> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}/stats?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch activity log stats');
      }

      return await response.json();
    } catch (error) {
      console.error('ActivityLogService.getActivityLogStats error:', error);
      throw error;
    }
  }

  /**
   * 활동 로그 생성
   */
  static async createActivityLog(logData: {
    userId: string;
    userName: string;
    userEmail: string;
    action: LogAction;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status?: LogStatus;
    severity?: LogSeverity;
    sessionId?: string;
    duration?: number;
    metadata?: Record<string, any>;
  }): Promise<ActivityLog> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...logData,
          timestamp: new Date().toISOString(),
          status: logData.status || 'SUCCESS',
          severity: logData.severity || 'LOW',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create activity log');
      }

      return await response.json();
    } catch (error) {
      console.error('ActivityLogService.createActivityLog error:', error);
      throw error;
    }
  }

  /**
   * 활동 로그 내보내기
   */
  static async exportActivityLogs(filters: ActivityLogFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob | any> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      params.append('format', format);

      const response = await fetch(`${API_BASE_URL}/export?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export activity logs');
      }

      if (format === 'csv') {
        return await response.blob();
      } else {
        return await response.json();
      }
    } catch (error) {
      console.error('ActivityLogService.exportActivityLogs error:', error);
      throw error;
    }
  }

  /**
   * 활동 로그 삭제 (관리자만)
   */
  static async deleteActivityLog(logId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${logId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete activity log');
      }
    } catch (error) {
      console.error('ActivityLogService.deleteActivityLog error:', error);
      throw error;
    }
  }

  /**
   * 활동 로그 일괄 삭제 (관리자만)
   */
  static async batchDeleteActivityLogs(logIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/batch`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to batch delete activity logs');
      }
    } catch (error) {
      console.error('ActivityLogService.batchDeleteActivityLogs error:', error);
      throw error;
    }
  }

  /**
   * 활동 로그 검색
   */
  static async searchActivityLogs(query: string, filters: Partial<ActivityLogFilters> = {}): Promise<ActivityLog[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search activity logs');
      }

      return await response.json();
    } catch (error) {
      console.error('ActivityLogService.searchActivityLogs error:', error);
      throw error;
    }
  }

  /**
   * CSV 파일 다운로드 헬퍼
   */
  static downloadCSV(blob: Blob, filename: string = 'activity_logs_export.csv'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * 활동 로그 생성 헬퍼 (자동화된 로깅)
   */
  static async logUserAction(
    userId: string,
    userName: string,
    userEmail: string,
    action: LogAction,
    resource: string,
    options: {
      resourceId?: string;
      details?: Record<string, any>;
      status?: LogStatus;
      severity?: LogSeverity;
      duration?: number;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    try {
      await this.createActivityLog({
        userId,
        userName,
        userEmail,
        action,
        resource,
        resourceId: options.resourceId,
        details: options.details,
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
        status: options.status || 'SUCCESS',
        severity: options.severity || 'LOW',
        sessionId: this.getSessionId(),
        duration: options.duration,
        metadata: options.metadata,
      });
    } catch (error) {
      console.error('Failed to log user action:', error);
      // 로깅 실패는 앱 동작을 방해하지 않도록 조용히 처리
    }
  }

  /**
   * 클라이언트 IP 주소 가져오기 (시뮬레이션)
   */
  private static getClientIP(): string {
    // 실제로는 서버에서 IP를 추출하거나 다른 방법 사용
    return '127.0.0.1';
  }

  /**
   * 세션 ID 가져오기
   */
  private static getSessionId(): string {
    // 실제로는 세션 관리 시스템에서 가져옴
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 싱글톤 인스턴스 생성
export const activityLogService = new ActivityLogService();
export default activityLogService;
