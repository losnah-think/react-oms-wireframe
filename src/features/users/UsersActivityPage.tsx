import React, { useState } from "react";
import { Container, Card, Button, Input, Badge, Table, type TableColumn } from "../../design-system";

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
}

const mockLogs: ActivityLog[] = [
  {
    id: "1",
    user: "김철수",
    action: "로그인",
    resource: "시스템",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0.0.0",
    timestamp: "2025-01-15 09:30:15",
    status: "success",
  },
  {
    id: "2",
    user: "이영희",
    action: "사용자 생성",
    resource: "사용자 관리",
    ipAddress: "192.168.1.101",
    userAgent: "Firefox/121.0.0.0",
    timestamp: "2025-01-15 09:25:42",
    status: "success",
  },
  {
    id: "3",
    user: "박민수",
    action: "로그인 시도",
    resource: "시스템",
    ipAddress: "192.168.1.102",
    userAgent: "Safari/17.2.0",
    timestamp: "2025-01-15 09:20:18",
    status: "failed",
  },
  {
    id: "4",
    user: "정수진",
    action: "데이터 수정",
    resource: "상품 관리",
    ipAddress: "192.168.1.103",
    userAgent: "Chrome/120.0.0.0",
    timestamp: "2025-01-15 09:15:33",
    status: "success",
  },
  {
    id: "5",
    user: "최동현",
    action: "권한 변경",
    resource: "권한 관리",
    ipAddress: "192.168.1.104",
    userAgent: "Edge/120.0.0.0",
    timestamp: "2025-01-15 09:10:27",
    status: "warning",
  },
];

const UsersActivityPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch = search
      ? log.user.includes(search) || log.action.includes(search) || log.resource.includes(search)
      : true;
    const matchesAction = actionFilter ? log.action === actionFilter : true;
    const matchesStatus = statusFilter ? log.status === statusFilter : true;
    return matchesSearch && matchesAction && matchesStatus;
  });

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

  const getActionBadge = (action: string) => {
    switch (action) {
      case "로그인":
        return <Badge variant="primary" size="small">로그인</Badge>;
      case "사용자 생성":
        return <Badge variant="success" size="small">사용자 생성</Badge>;
      case "로그인 시도":
        return <Badge variant="warning" size="small">로그인 시도</Badge>;
      case "데이터 수정":
        return <Badge variant="info" size="small">데이터 수정</Badge>;
      case "권한 변경":
        return <Badge variant="danger" size="small">권한 변경</Badge>;
      default:
        return <Badge variant="secondary" size="small">{action}</Badge>;
    }
  };

  const columns: TableColumn<ActivityLog>[] = [
    {
      key: "user",
      title: "사용자",
      render: (log) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">
              {(log.user || "").charAt(0) || "?"}
            </span>
          </div>
          <span className="font-medium text-gray-900">{log.user}</span>
        </div>
      ),
    },
    {
      key: "action",
      title: "작업",
      render: (log) => getActionBadge(log.action),
    },
    {
      key: "resource",
      title: "리소스",
      render: (log) => (
        <span className="text-sm text-gray-900">{log.resource}</span>
      ),
    },
    {
      key: "ipAddress",
      title: "IP 주소",
      render: (log) => (
        <span className="text-sm text-gray-500 font-mono">{log.ipAddress}</span>
      ),
    },
    {
      key: "timestamp",
      title: "시간",
      render: (log) => (
        <span className="text-sm text-gray-500">{log.timestamp}</span>
      ),
    },
    {
      key: "status",
      title: "상태",
      render: (log) => getStatusBadge(log.status),
    },
  ];

  const actions = Array.from(new Set(mockLogs.map(log => log.action)));
  const statuses = Array.from(new Set(mockLogs.map(log => log.status)));

  return (
    <Container maxWidth="full" centered={false} padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">활동 로그</h1>
            <p className="text-sm text-gray-600 mt-1">
              사용자의 시스템 활동을 추적하고 모니터링할 수 있습니다.
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

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{mockLogs.length}</div>
              <div className="text-sm text-gray-600">전체 로그</div>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockLogs.filter(log => log.status === "success").length}
              </div>
              <div className="text-sm text-gray-600">성공</div>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {mockLogs.filter(log => log.status === "failed").length}
              </div>
              <div className="text-sm text-gray-600">실패</div>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mockLogs.filter(log => log.status === "warning").length}
              </div>
              <div className="text-sm text-gray-600">경고</div>
            </div>
          </Card>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card padding="lg" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="사용자, 작업, 리소스로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 작업</option>
            {actions.map((action) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 상태</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "success" ? "성공" : status === "failed" ? "실패" : "경고"}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* 활동 로그 테이블 */}
      <Card padding="none">
        <Table
          data={filteredLogs}
          columns={columns}
          keyField="id"
        />
      </Card>

      {/* 보안 이벤트 요약 */}
      <Card padding="lg" className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">보안 이벤트 요약</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">최근 실패한 로그인</h4>
            <div className="space-y-2">
              {mockLogs
                .filter(log => log.status === "failed")
                .slice(0, 3)
                .map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-red-900">{log.user}</div>
                      <div className="text-sm text-red-600">{log.ipAddress}</div>
                    </div>
                    <div className="text-sm text-red-500">{log.timestamp}</div>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">권한 변경 이력</h4>
            <div className="space-y-2">
              {mockLogs
                .filter(log => log.action === "권한 변경")
                .slice(0, 3)
                .map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="font-medium text-orange-900">{log.user}</div>
                      <div className="text-sm text-orange-600">{log.resource}</div>
                    </div>
                    <div className="text-sm text-orange-500">{log.timestamp}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default UsersActivityPage;
