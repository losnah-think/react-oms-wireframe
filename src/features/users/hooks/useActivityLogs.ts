// src/features/users/hooks/useActivityLogs.ts
import { useState, useEffect, useCallback } from 'react';
import { ActivityLog, ActivityLogFilters, ActivityLogStats } from '../types/activity';
import { ActivityLogService } from '../../../lib/services/ActivityLogService';

interface UseActivityLogsOptions {
  filters?: ActivityLogFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseActivityLogsReturn {
  logs: ActivityLog[];
  stats: ActivityLogStats | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  refresh: () => void;
  exportLogs: (format: 'csv' | 'json') => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  batchDeleteLogs: (logIds: string[]) => Promise<void>;
  searchLogs: (query: string) => Promise<ActivityLog[]>;
}

export const useActivityLogs = (options: UseActivityLogsOptions = {}): UseActivityLogsReturn => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ActivityLogService.getActivityLogs(options.filters || {});
      setLogs(response.logs);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);

      // 통계도 함께 가져오기
      const statsResponse = await ActivityLogService.getActivityLogStats(options.filters || {});
      setStats(statsResponse);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      setError('활동 로그를 불러오는데 실패했습니다');
      setLogs([]);
      setStats(null);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [options.filters]);

  const refresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  const exportLogs = useCallback(async (format: 'csv' | 'json') => {
    try {
      setError(null);
      const result = await ActivityLogService.exportActivityLogs(options.filters || {}, format);
      
      if (format === 'csv') {
        const filename = `activity_logs_export_${new Date().toISOString().split('T')[0]}.csv`;
        ActivityLogService.downloadCSV(result as Blob, filename);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '활동 로그 내보내기에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [options.filters]);

  const deleteLog = useCallback(async (logId: string) => {
    try {
      setError(null);
      await ActivityLogService.deleteActivityLog(logId);
      refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '활동 로그 삭제에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  const batchDeleteLogs = useCallback(async (logIds: string[]) => {
    try {
      setError(null);
      await ActivityLogService.batchDeleteActivityLogs(logIds);
      refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '활동 로그 일괄 삭제에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  const searchLogs = useCallback(async (query: string): Promise<ActivityLog[]> => {
    try {
      setError(null);
      return await ActivityLogService.searchActivityLogs(query, options.filters || {});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '활동 로그 검색에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [options.filters]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 자동 새로고침
  useEffect(() => {
    if (!options.autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, options.refreshInterval || 30000); // 기본 30초

    return () => clearInterval(interval);
  }, [fetchLogs, options.autoRefresh, options.refreshInterval]);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    if (options.filters?.userId || options.filters?.action || options.filters?.status || options.filters?.severity) {
      setPage(1);
    }
  }, [options.filters?.userId, options.filters?.action, options.filters?.status, options.filters?.severity]);

  return {
    logs,
    stats,
    loading,
    error,
    total,
    page,
    totalPages,
    refresh,
    exportLogs,
    deleteLog,
    batchDeleteLogs,
    searchLogs
  };
};

// 활동 로그 생성 헬퍼 훅
export const useActivityLogger = () => {
  const logAction = useCallback(async (
    userId: string,
    userName: string,
    userEmail: string,
    action: string,
    resource: string,
    options: {
      resourceId?: string;
      details?: Record<string, any>;
      status?: 'SUCCESS' | 'FAILED' | 'WARNING';
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      duration?: number;
      metadata?: Record<string, any>;
    } = {}
  ) => {
    try {
      await ActivityLogService.logUserAction(
        userId,
        userName,
        userEmail,
        action as any,
        resource,
        options
      );
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  }, []);

  return { logAction };
};
