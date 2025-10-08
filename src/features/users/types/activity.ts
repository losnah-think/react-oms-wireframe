// src/features/users/types/activity.ts
export type LogAction = 
  // 사용자 관리
  | 'user:login'
  | 'user:logout'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'user:password_reset'
  | 'user:status_change'
  
  // 상품 관리
  | 'product:create'
  | 'product:update'
  | 'product:delete'
  | 'product:import'
  | 'product:export'
  
  // 주문 관리
  | 'order:create'
  | 'order:update'
  | 'order:process'
  | 'order:cancel'
  
  // 설정 관리
  | 'settings:update'
  | 'settings:integration_create'
  | 'settings:integration_update'
  | 'settings:integration_delete'
  
  // 시스템 관리
  | 'system:backup'
  | 'system:maintenance'
  | 'system:config_change';

export type LogStatus = 'SUCCESS' | 'FAILED' | 'WARNING';

export type LogSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: LogAction;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: LogStatus;
  severity: LogSeverity;
  sessionId?: string;
  duration?: number; // 작업 소요 시간 (ms)
  metadata?: Record<string, any>;
}

export interface ActivityLogFilters {
  userId?: string;
  action?: LogAction;
  status?: LogStatus;
  severity?: LogSeverity;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'action' | 'status' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

export interface ActivityLogStats {
  total: number;
  success: number;
  failed: number;
  warning: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  topActions: Array<{ action: LogAction; count: number }>;
  topUsers: Array<{ userId: string; userName: string; count: number }>;
  severityDistribution: Record<LogSeverity, number>;
}

export const LOG_ACTION_LABELS: Record<LogAction, string> = {
  // 사용자 관리
  'user:login': '로그인',
  'user:logout': '로그아웃',
  'user:create': '사용자 생성',
  'user:update': '사용자 수정',
  'user:delete': '사용자 삭제',
  'user:password_reset': '비밀번호 초기화',
  'user:status_change': '사용자 상태 변경',
  
  // 상품 관리
  'product:create': '상품 생성',
  'product:update': '상품 수정',
  'product:delete': '상품 삭제',
  'product:import': '상품 가져오기',
  'product:export': '상품 내보내기',
  
  // 주문 관리
  'order:create': '주문 생성',
  'order:update': '주문 수정',
  'order:process': '주문 처리',
  'order:cancel': '주문 취소',
  
  // 설정 관리
  'settings:update': '설정 수정',
  'settings:integration_create': '연동 생성',
  'settings:integration_update': '연동 수정',
  'settings:integration_delete': '연동 삭제',
  
  // 시스템 관리
  'system:backup': '시스템 백업',
  'system:maintenance': '시스템 유지보수',
  'system:config_change': '설정 변경'
};

export const LOG_STATUS_LABELS: Record<LogStatus, string> = {
  SUCCESS: '성공',
  FAILED: '실패',
  WARNING: '경고'
};

export const LOG_SEVERITY_LABELS: Record<LogSeverity, string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
  CRITICAL: '심각'
};

export const LOG_SEVERITY_COLORS: Record<LogSeverity, string> = {
  LOW: 'green',
  MEDIUM: 'yellow',
  HIGH: 'orange',
  CRITICAL: 'red'
};

export const LOG_STATUS_COLORS: Record<LogStatus, string> = {
  SUCCESS: 'green',
  FAILED: 'red',
  WARNING: 'yellow'
};
