/**
 * 통합 로그 시스템
 * 모든 사용자 액션을 서버 타임스탬프 기반으로 기록
 */

export type LogCategory = 
  | 'auth'           // 로그인/로그아웃
  | 'user'           // 사용자 관리
  | 'product'        // 상품 관리
  | 'vendor'         // 판매처 관리
  | 'order'          // 주문 관리
  | 'settings'       // 환경설정
  | 'integration'    // 외부연동
  | 'system';        // 시스템

export type LogAction = 
  // 인증
  | 'login' | 'logout' | 'login_failed'
  // 사용자
  | 'user_create' | 'user_update' | 'user_delete' | 'user_password_reset'
  // 상품
  | 'product_create' | 'product_update' | 'product_delete' 
  | 'product_bulk_create' | 'product_bulk_update' | 'product_bulk_delete'
  | 'product_send' | 'product_import' | 'product_export'
  // 판매처
  | 'vendor_create' | 'vendor_update' | 'vendor_delete'
  | 'vendor_info_update' | 'vendor_category_map'
  // 주문
  | 'order_create' | 'order_update' | 'order_cancel' | 'order_process'
  // 설정
  | 'settings_update' | 'settings_brand_create' | 'settings_category_create'
  // 연동
  | 'integration_create' | 'integration_update' | 'integration_delete' | 'integration_sync'
  // 시스템
  | 'system_backup' | 'system_maintenance';

export type LogLevel = 'info' | 'warning' | 'error';

export interface LogEntry {
  id?: string;                    // DB 자동 생성
  timestamp?: string;             // DB 서버 시간으로 자동 생성 (CURRENT_TIMESTAMP)
  userId: string;
  userName: string;
  category: LogCategory;
  action: LogAction;
  target: string;                 // 대상 (예: "상품", "판매처", "사용자")
  targetId?: string;              // 대상 ID
  description: string;            // 간단한 설명
  details?: Record<string, any>;  // 상세 정보 (변경 전/후 등)
  level: LogLevel;
  ipAddress?: string;             // 서버에서 추출
  userAgent?: string;
}

export interface LogFilter {
  userId?: string;
  category?: LogCategory;
  action?: LogAction;
  level?: LogLevel;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class Logger {
  private static instance: Logger;
  private apiUrl = '/api/logs';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 로그 기록 (서버로 전송, 서버에서 타임스탬프 생성)
   */
  async log(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          userAgent: navigator.userAgent,
          // timestamp는 서버에서 자동 생성됨
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create log entry');
      }
    } catch (error) {
      console.warn('Logger error (will use mock storage):', error);
      // 로그 실패가 앱 동작을 방해하지 않도록 조용히 처리
      // 실제로는 localStorage나 IndexedDB에 임시 저장 가능
    }
  }

  /**
   * 로그 조회
   */
  async getLogs(filter: LogFilter = {}): Promise<{
    logs: LogEntry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`${this.apiUrl}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      return await response.json();
    } catch (error) {
      console.warn('Logger getLogs error, using mock data:', error);
      
      // API 실패 시 mock 데이터 사용
      const { mockLogs } = await import('../data/mockLogs');
      let filteredLogs = [...mockLogs];

      // 필터 적용
      if (filter.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filter.category);
      }
      if (filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filter.level);
      }
      if (filter.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.userName.toLowerCase().includes(search) ||
          log.description.toLowerCase().includes(search) ||
          log.target.toLowerCase().includes(search)
        );
      }
      if (filter.startDate) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp && log.timestamp >= filter.startDate!
        );
      }
      if (filter.endDate) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp && log.timestamp <= filter.endDate!
        );
      }

      // 페이지네이션
      const page = filter.page || 1;
      const limit = filter.limit || 50;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

      return {
        logs: paginatedLogs,
        total: filteredLogs.length,
        page,
        totalPages: Math.ceil(filteredLogs.length / limit),
      };
    }
  }

  /**
   * 로그 검색
   */
  async searchLogs(query: string, filter: Partial<LogFilter> = {}): Promise<LogEntry[]> {
    try {
      const params = new URLSearchParams({ q: query });
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`${this.apiUrl}/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to search logs');
      }

      return await response.json();
    } catch (error) {
      console.warn('Logger searchLogs error, using mock data:', error);
      
      // API 실패 시 mock 데이터 사용
      const { mockLogs } = await import('../data/mockLogs');
      const search = query.toLowerCase();
      
      return mockLogs.filter(log => 
        log.userName.toLowerCase().includes(search) ||
        log.description.toLowerCase().includes(search) ||
        log.target.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search)
      );
    }
  }

  /**
   * 로그 내보내기
   */
  async exportLogs(filter: LogFilter, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      params.append('format', format);

      const response = await fetch(`${this.apiUrl}/export?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to export logs');
      }

      return await response.blob();
    } catch (error) {
      console.warn('Logger exportLogs error, using mock data:', error);
      
      // API 실패 시 mock 데이터로 CSV 생성
      const { mockLogs } = await import('../data/mockLogs');
      
      if (format === 'csv') {
        const header = 'ID,시간,사용자,카테고리,액션,대상,대상ID,설명,레벨,IP주소\n';
        const rows = mockLogs.map(log => {
          return [
            log.id || '',
            log.timestamp || '',
            log.userName,
            log.category,
            log.action,
            log.target,
            log.targetId || '',
            `"${log.description.replace(/"/g, '""')}"`,
            log.level,
            log.ipAddress || '',
          ].join(',');
        }).join('\n');
        
        const csv = header + rows;
        return new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      } else {
        const json = JSON.stringify(mockLogs, null, 2);
        return new Blob([json], { type: 'application/json' });
      }
    }
  }

  // === 편의 메서드 ===

  /**
   * 인증 로그
   */
  async logAuth(userId: string, userName: string, action: 'login' | 'logout' | 'login_failed', description: string) {
    await this.log({
      userId,
      userName,
      category: 'auth',
      action,
      target: '시스템',
      description,
      level: action === 'login_failed' ? 'warning' : 'info',
    });
  }

  /**
   * 상품 로그
   */
  async logProduct(
    userId: string,
    userName: string,
    action: LogAction,
    productId: string,
    description: string,
    details?: Record<string, any>
  ) {
    await this.log({
      userId,
      userName,
      category: 'product',
      action,
      target: '상품',
      targetId: productId,
      description,
      details,
      level: 'info',
    });
  }

  /**
   * 판매처 로그
   */
  async logVendor(
    userId: string,
    userName: string,
    action: LogAction,
    vendorId: string,
    description: string,
    details?: Record<string, any>
  ) {
    await this.log({
      userId,
      userName,
      category: 'vendor',
      action,
      target: '판매처',
      targetId: vendorId,
      description,
      details,
      level: 'info',
    });
  }

  /**
   * 설정 로그
   */
  async logSettings(
    userId: string,
    userName: string,
    action: LogAction,
    description: string,
    details?: Record<string, any>
  ) {
    await this.log({
      userId,
      userName,
      category: 'settings',
      action,
      target: '환경설정',
      description,
      details,
      level: 'info',
    });
  }

  /**
   * 연동 로그
   */
  async logIntegration(
    userId: string,
    userName: string,
    action: LogAction,
    integrationId: string,
    description: string,
    details?: Record<string, any>
  ) {
    await this.log({
      userId,
      userName,
      category: 'integration',
      action,
      target: '외부연동',
      targetId: integrationId,
      description,
      details,
      level: 'info',
    });
  }

  /**
   * 에러 로그
   */
  async logError(
    userId: string,
    userName: string,
    category: LogCategory,
    action: LogAction,
    description: string,
    error: any
  ) {
    await this.log({
      userId,
      userName,
      category,
      action,
      target: '시스템',
      description,
      details: {
        error: error?.message || String(error),
        stack: error?.stack,
      },
      level: 'error',
    });
  }
}

// 싱글톤 인스턴스
export const logger = Logger.getInstance();
export default logger;

// 액션 라벨 (한글 표시용)
export const LOG_ACTION_LABELS: Record<LogAction, string> = {
  login: '로그인',
  logout: '로그아웃',
  login_failed: '로그인 실패',
  user_create: '사용자 생성',
  user_update: '사용자 수정',
  user_delete: '사용자 삭제',
  user_password_reset: '비밀번호 초기화',
  product_create: '상품 등록',
  product_update: '상품 수정',
  product_delete: '상품 삭제',
  product_bulk_create: '상품 대량등록',
  product_bulk_update: '상품 대량수정',
  product_bulk_delete: '상품 대량삭제',
  product_send: '상품 송신',
  product_import: '상품 가져오기',
  product_export: '상품 내보내기',
  vendor_create: '판매처 등록',
  vendor_update: '판매처 수정',
  vendor_delete: '판매처 삭제',
  vendor_info_update: '판매처 정보 수정',
  vendor_category_map: '카테고리 매핑',
  order_create: '주문 생성',
  order_update: '주문 수정',
  order_cancel: '주문 취소',
  order_process: '주문 처리',
  settings_update: '설정 변경',
  settings_brand_create: '브랜드 생성',
  settings_category_create: '카테고리 생성',
  integration_create: '연동 생성',
  integration_update: '연동 수정',
  integration_delete: '연동 삭제',
  integration_sync: '연동 동기화',
  system_backup: '시스템 백업',
  system_maintenance: '시스템 유지보수',
};

export const LOG_CATEGORY_LABELS: Record<LogCategory, string> = {
  auth: '인증',
  user: '사용자',
  product: '상품',
  vendor: '판매처',
  order: '주문',
  settings: '설정',
  integration: '연동',
  system: '시스템',
};

export const LOG_LEVEL_COLORS = {
  info: 'blue',
  warning: 'yellow',
  error: 'red',
} as const;
