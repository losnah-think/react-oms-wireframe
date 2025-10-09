import React, { useState } from "react";
import { Container, Card, Button, Input, Badge, Table, type TableColumn, Modal } from "../../design-system";

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  company: string;
  companyId: string;
  action: string;
  actionType: string;
  resource: string;
  resourceId?: string;
  details: string;
  changes?: Record<string, { from: any; to: any }>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
  errorMessage?: string;
}

const mockLogs: ActivityLog[] = [
  { id: "1", userId: "1", userName: "김철수", userEmail: "kim@fulgo.com", company: "플고물류", companyId: "company-1", action: "로그인", actionType: "auth.login", resource: "시스템", details: "정상 로그인", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", sessionId: "sess_001", timestamp: "2025-10-08 09:30:15", status: "success" },
  { id: "2", userId: "2", userName: "이영희", userEmail: "lee@fulgo.com", company: "플고물류", companyId: "company-1", action: "사용자 생성", actionType: "user.create", resource: "사용자", resourceId: "10", details: "신규 사용자 등록", changes: { name: { from: null, to: "오민지" }, email: { from: null, to: "oh@fulgo.com" } }, ipAddress: "192.168.1.101", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", sessionId: "sess_002", timestamp: "2025-10-08 09:25:42", status: "success" },
  { id: "3", userId: "4", userName: "박민수", userEmail: "park@ace.com", company: "에이스전자", companyId: "company-2", action: "로그인 시도", actionType: "auth.login.failed", resource: "시스템", details: "비밀번호 오류", errorMessage: "Invalid password. 2 attempts remaining", ipAddress: "192.168.1.102", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", sessionId: "sess_003", timestamp: "2025-10-08 09:20:18", status: "failed" },
  { id: "4", userId: "3", userName: "정수진", userEmail: "jung@fulgo.com", company: "플고물류", companyId: "company-1", action: "상품 수정", actionType: "product.update", resource: "상품", resourceId: "P-1001", details: "상품 가격 변경", changes: { price: { from: 10000, to: 12000 } }, ipAddress: "192.168.1.103", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", sessionId: "sess_004", timestamp: "2025-10-08 09:15:33", status: "success" },
  { id: "5", userId: "1", userName: "김철수", userEmail: "kim@fulgo.com", company: "플고물류", companyId: "company-1", action: "권한 변경", actionType: "user.permission.update", resource: "권한", resourceId: "2", details: "사용자 권한 수정", changes: { role: { from: "user", to: "manager" } }, ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", sessionId: "sess_001", timestamp: "2025-10-08 09:10:27", status: "warning" },
  { id: "6", userId: "6", userName: "강미래", userEmail: "kang@best.com", company: "베스트패션", companyId: "company-3", action: "로그인", actionType: "auth.login", resource: "시스템", details: "정상 로그인", ipAddress: "192.168.2.50", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)", sessionId: "sess_006", timestamp: "2025-10-08 09:05:11", status: "success" },
  { id: "7", userId: "8", userName: "한지민", userEmail: "han@smart.com", company: "스마트식품", companyId: "company-4", action: "주문 조회", actionType: "order.read", resource: "주문", details: "주문 목록 조회", ipAddress: "192.168.3.30", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", sessionId: "sess_007", timestamp: "2025-10-08 09:00:45", status: "success" },
  { id: "8", userId: "5", userName: "최동욱", userEmail: "choi@ace.com", company: "에이스전자", companyId: "company-2", action: "상품 등록", actionType: "product.bulk.create", resource: "상품", details: "신규 상품 5개 등록", changes: { count: { from: 0, to: 5 } }, ipAddress: "192.168.1.105", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", sessionId: "sess_008", timestamp: "2025-10-08 08:55:22", status: "success" },
  { id: "9", userId: "7", userName: "윤서연", userEmail: "yoon@best.com", company: "베스트패션", companyId: "company-3", action: "로그아웃", actionType: "auth.logout", resource: "시스템", details: "정상 로그아웃", ipAddress: "192.168.2.51", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)", sessionId: "sess_009", timestamp: "2025-10-08 08:50:33", status: "success" },
  { id: "10", userId: "9", userName: "송지훈", userEmail: "song@smart.com", company: "스마트식품", companyId: "company-4", action: "비밀번호 변경", actionType: "user.password.reset", resource: "계정", resourceId: "9", details: "비밀번호 재설정", ipAddress: "192.168.3.31", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", sessionId: "sess_010", timestamp: "2025-10-08 08:45:19", status: "success" },
  { id: "11", userId: "4", userName: "박민수", userEmail: "park@ace.com", company: "에이스전자", companyId: "company-2", action: "로그인 시도", actionType: "auth.login.locked", resource: "시스템", details: "계정 잠금", errorMessage: "Account locked due to multiple failed login attempts", ipAddress: "192.168.1.102", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", sessionId: "sess_011", timestamp: "2025-10-08 08:40:08", status: "failed" },
  { id: "12", userId: "1", userName: "김철수", userEmail: "kim@fulgo.com", company: "플고물류", companyId: "company-1", action: "사용자 삭제", actionType: "user.delete", resource: "사용자", resourceId: "99", details: "비활성 계정 삭제", changes: { status: { from: "inactive", to: "deleted" } }, ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", sessionId: "sess_001", timestamp: "2025-10-08 08:35:55", status: "warning" },
];

const UsersActivityPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch = search
      ? log.userName.includes(search) || log.userEmail.includes(search) || log.action.includes(search) || log.resource.includes(search) || log.company.includes(search) || log.userId.includes(search)
      : true;
    const matchesCompany = companyFilter ? log.company === companyFilter : true;
    const matchesStatus = statusFilter ? log.status === statusFilter : true;
    return matchesSearch && matchesCompany && matchesStatus;
  });

  const handleViewDetail = (log: ActivityLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="success" size="small">성공</Badge>;
      case "failed":
        return <Badge variant="danger" size="small">실패</Badge>;
      case "warning":
        return <Badge variant="warning" size="small">경고</Badge>;
      default:
        return <Badge variant="secondary" size="small">{status}</Badge>;
    }
  };

  const columns: TableColumn<ActivityLog>[] = [
    {
      key: "userId",
      title: "사용자 ID",
      render: (value, log) => (
        <div>
          <div className="text-xs font-mono text-gray-500">{log.userId}</div>
          <div className="text-sm font-medium text-gray-900">{log.userName}</div>
          <div className="text-xs text-gray-500">{log.userEmail}</div>
        </div>
      ),
    },
    {
      key: "action",
      title: "작업",
      render: (value, log) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{log.action}</div>
          <div className="text-xs font-mono text-gray-500">{log.actionType}</div>
          <div className="text-xs text-gray-500">{log.company}</div>
        </div>
      ),
    },
    {
      key: "resource",
      title: "리소스",
      render: (value, log) => (
        <div>
          <div className="text-sm text-gray-700">{log.resource}</div>
          {log.resourceId && (
            <div className="text-xs font-mono text-gray-500">ID: {log.resourceId}</div>
          )}
        </div>
      ),
    },
    {
      key: "details",
      title: "상세 내역",
      render: (value, log) => (
        <div>
          <div className="text-sm text-gray-600">{log.details}</div>
          {log.changes && (
            <div className="text-xs text-gray-500 mt-1">
              {Object.keys(log.changes).length}개 변경사항
            </div>
          )}
          {log.errorMessage && (
            <div className="text-xs text-red-600 mt-1">{log.errorMessage}</div>
          )}
        </div>
      ),
    },
    {
      key: "ipAddress",
      title: "접속 정보",
      render: (value, log) => (
        <div>
          <div className="text-xs font-mono text-gray-600">{log.ipAddress}</div>
          <div className="text-xs text-gray-500 truncate max-w-[120px]" title={log.userAgent}>
            {log.userAgent.split(' ')[0]}
          </div>
          <div className="text-xs font-mono text-gray-400">
            {log.sessionId.substring(0, 10)}
          </div>
        </div>
      ),
    },
    {
      key: "timestamp",
      title: "시간",
      render: (value, log) => (
        <span className="text-sm text-gray-500">{log.timestamp}</span>
      ),
    },
    {
      key: "status",
      title: "상태",
      render: (value, log) => getStatusBadge(log.status),
    },
    {
      key: "actions",
      title: "작업",
      render: (value, log) => (
        <Button
          variant="ghost"
          size="small"
          onClick={() => handleViewDetail(log)}
        >
          상세
        </Button>
      ),
    },
  ];

  const companies = Array.from(new Set(mockLogs.map(log => log.company)));

  return (
    <Container maxWidth="full" centered={false} padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">활동 로그</h1>
            <p className="text-sm text-gray-600 mt-1">
              사용자 활동 추적
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => console.log("Export logs")}>
              내보내기
            </Button>
            <Button onClick={() => console.log("Refresh logs")}>
              새로고침
            </Button>
          </div>
        </div>

      </div>

      {/* 검색 및 필터 */}
      <Card padding="lg" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="사용자, 회사, 작업으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 회사</option>
            {companies.map((company) => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 상태</option>
            <option value="success">성공</option>
            <option value="failed">실패</option>
            <option value="warning">경고</option>
          </select>
        </div>
      </Card>

      {/* 활동 로그 테이블 */}
      <Card padding="none">
        <Table
          data={filteredLogs}
          columns={columns}
        />
      </Card>

      {/* 로그 상세 보기 모달 */}
      {selectedLog && (
        <Modal
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedLog(null);
          }}
          title="활동 로그 상세"
          size="big"
        >
          <div className="space-y-4">
            {/* 사용자 정보 */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">사용자 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">사용자 ID</div>
                  <div className="text-sm font-mono font-medium text-gray-900">{selectedLog.userId}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">이름</div>
                  <div className="text-sm font-medium text-gray-900">{selectedLog.userName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">이메일</div>
                  <div className="text-sm text-gray-900">{selectedLog.userEmail}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">회사</div>
                  <div className="text-sm text-gray-900">{selectedLog.company}</div>
                </div>
              </div>
            </div>

            {/* 작업 정보 */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">작업 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">작업</div>
                  <div className="text-sm font-medium text-gray-900">{selectedLog.action}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">작업 타입</div>
                  <div className="text-sm font-mono text-gray-900">{selectedLog.actionType}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">리소스</div>
                  <div className="text-sm text-gray-900">{selectedLog.resource}</div>
                </div>
                {selectedLog.resourceId && (
                  <div>
                    <div className="text-xs text-gray-500">리소스 ID</div>
                    <div className="text-sm font-mono text-gray-900">{selectedLog.resourceId}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-gray-500">상태</div>
                  <div className="text-sm">{getStatusBadge(selectedLog.status)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">시간</div>
                  <div className="text-sm text-gray-900">{selectedLog.timestamp}</div>
                </div>
              </div>
            </div>

            {/* 상세 내역 */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">상세 내역</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">{selectedLog.details}</p>
              </div>
            </div>

            {/* 변경 사항 */}
            {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">변경 사항</h3>
                <div className="space-y-2">
                  {Object.entries(selectedLog.changes).map(([key, value]) => (
                    <div key={key} className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs font-semibold text-blue-900 mb-1">{key}</div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-600 line-through">{String(value.from ?? 'null')}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-600 font-medium">{String(value.to)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {selectedLog.errorMessage && (
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-red-900 mb-3">에러 정보</h3>
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm text-red-700">{selectedLog.errorMessage}</p>
                </div>
              </div>
            )}

            {/* 접속 정보 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">접속 정보</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="text-xs text-gray-500">IP 주소</div>
                  <div className="text-sm font-mono text-gray-900">{selectedLog.ipAddress}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">User Agent</div>
                  <div className="text-sm font-mono text-gray-900 break-all">{selectedLog.userAgent}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">세션 ID</div>
                  <div className="text-sm font-mono text-gray-900">{selectedLog.sessionId}</div>
                </div>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedLog(null);
                }}
              >
                닫기
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </Container>
  );
};

export default UsersActivityPage;
