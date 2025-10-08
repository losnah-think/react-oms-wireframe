import React, { useState } from "react";
import { Container, Card, Button, Input, Badge, Table, type TableColumn } from "../../design-system";

interface ActivityLog {
  id: string;
  user: string;
  company: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
}

const mockLogs: ActivityLog[] = [
  { id: "1", user: "김철수", company: "플고물류", action: "로그인", resource: "시스템", details: "정상 로그인", ipAddress: "192.168.1.100", timestamp: "2025-10-08 09:30:15", status: "success" },
  { id: "2", user: "이영희", company: "플고물류", action: "사용자 생성", resource: "사용자", details: "신규 사용자 등록 (오민지)", ipAddress: "192.168.1.101", timestamp: "2025-10-08 09:25:42", status: "success" },
  { id: "3", user: "박민수", company: "에이스전자", action: "로그인 시도", resource: "시스템", details: "비밀번호 오류", ipAddress: "192.168.1.102", timestamp: "2025-10-08 09:20:18", status: "failed" },
  { id: "4", user: "정수진", company: "플고물류", action: "상품 수정", resource: "상품", details: "상품 가격 변경 (상품ID: P-1001)", ipAddress: "192.168.1.103", timestamp: "2025-10-08 09:15:33", status: "success" },
  { id: "5", user: "김철수", company: "플고물류", action: "권한 변경", resource: "권한", details: "이영희 권한 수정", ipAddress: "192.168.1.100", timestamp: "2025-10-08 09:10:27", status: "warning" },
  { id: "6", user: "강미래", company: "베스트패션", action: "로그인", resource: "시스템", details: "정상 로그인", ipAddress: "192.168.2.50", timestamp: "2025-10-08 09:05:11", status: "success" },
  { id: "7", user: "한지민", company: "스마트식품", action: "주문 조회", resource: "주문", details: "주문 목록 조회", ipAddress: "192.168.3.30", timestamp: "2025-10-08 09:00:45", status: "success" },
  { id: "8", user: "최동욱", company: "에이스전자", action: "상품 등록", resource: "상품", details: "신규 상품 5개 등록", ipAddress: "192.168.1.105", timestamp: "2025-10-08 08:55:22", status: "success" },
  { id: "9", user: "윤서연", company: "베스트패션", action: "로그아웃", resource: "시스템", details: "정상 로그아웃", ipAddress: "192.168.2.51", timestamp: "2025-10-08 08:50:33", status: "success" },
  { id: "10", user: "송지훈", company: "스마트식품", action: "비밀번호 변경", resource: "계정", details: "비밀번호 재설정", ipAddress: "192.168.3.31", timestamp: "2025-10-08 08:45:19", status: "success" },
  { id: "11", user: "박민수", company: "에이스전자", action: "로그인 시도", resource: "시스템", details: "계정 잠금", ipAddress: "192.168.1.102", timestamp: "2025-10-08 08:40:08", status: "failed" },
  { id: "12", user: "김철수", company: "플고물류", action: "사용자 삭제", resource: "사용자", details: "비활성 계정 삭제", ipAddress: "192.168.1.100", timestamp: "2025-10-08 08:35:55", status: "warning" },
  { id: "13", user: "이영희", company: "플고물류", action: "주문 처리", resource: "주문", details: "주문 50건 처리 완료", ipAddress: "192.168.1.101", timestamp: "2025-10-08 08:30:44", status: "success" },
  { id: "14", user: "정수진", company: "플고물류", action: "재고 조정", resource: "재고", details: "재고 100개 입고", ipAddress: "192.168.1.103", timestamp: "2025-10-08 08:25:17", status: "success" },
  { id: "15", user: "한지민", company: "스마트식품", action: "배송 처리", resource: "배송", details: "배송 준비 20건", ipAddress: "192.168.3.30", timestamp: "2025-10-08 08:20:05", status: "success" },
  { id: "16", user: "강미래", company: "베스트패션", action: "상품 삭제", resource: "상품", details: "단종 상품 삭제", ipAddress: "192.168.2.50", timestamp: "2025-10-08 08:15:29", status: "warning" },
  { id: "17", user: "김철수", company: "플고물류", action: "시스템 설정", resource: "설정", details: "연동 설정 변경", ipAddress: "192.168.1.100", timestamp: "2025-10-08 08:10:12", status: "success" },
  { id: "18", user: "오민지", company: "플고물류", action: "로그인", resource: "시스템", details: "정상 로그인", ipAddress: "192.168.1.106", timestamp: "2025-10-08 08:05:39", status: "success" },
  { id: "19", user: "배성호", company: "에이스전자", action: "로그인 시도", resource: "시스템", details: "계정 정지 상태", ipAddress: "192.168.1.107", timestamp: "2025-10-08 08:00:26", status: "failed" },
  { id: "20", user: "서지우", company: "베스트패션", action: "데이터 조회", resource: "보고서", details: "월간 매출 보고서 조회", ipAddress: "192.168.2.52", timestamp: "2025-10-08 07:55:13", status: "success" },
];

const UsersActivityPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch = search
      ? log.user.includes(search) || log.action.includes(search) || log.resource.includes(search) || log.company.includes(search)
      : true;
    const matchesCompany = companyFilter ? log.company === companyFilter : true;
    const matchesStatus = statusFilter ? log.status === statusFilter : true;
    return matchesSearch && matchesCompany && matchesStatus;
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

  const columns: TableColumn<ActivityLog>[] = [
    {
      key: "user",
      title: "사용자",
      render: (value, log) => (
        <div>
          <div className="font-medium text-gray-900">{log.user}</div>
          <div className="text-sm text-gray-500">{log.company}</div>
        </div>
      ),
    },
    {
      key: "action",
      title: "작업",
      render: (value, log) => (
        <span className="text-sm text-gray-900">{log.action}</span>
      ),
    },
    {
      key: "resource",
      title: "리소스",
      render: (value, log) => (
        <span className="text-sm text-gray-700">{log.resource}</span>
      ),
    },
    {
      key: "details",
      title: "상세",
      render: (value, log) => (
        <span className="text-sm text-gray-600">{log.details}</span>
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

    </Container>
  );
};

export default UsersActivityPage;
