import React from "react";
import {
  Container,
  Card,
  Button,
  Input,
  Dropdown,
  Badge,
  Stack,
  Modal,
  Table,
  type TableColumn,
} from "../../design-system";
import { mockVendors } from "../../data/mockVendors";
import { 
  allVendorIntegrations, 
  getIntegrationStatusCounts,
  updateIntegrationStatus,
  getIntegrationsByVendorId
} from "../../data/mockVendorIntegrations";
import { VendorIntegration, PLATFORM_OPTIONS, getPlatformLabel } from "../../types/vendor";

import ConnectionsList from "../../components/integrations/ConnectionsList";
import RegisterIntegrationForm from "../../components/integrations/RegisterIntegrationForm";
import ConnectorTable from "../../components/integrations/ConnectorTable";
import CollectionScheduleManager from "../../components/integrations/CollectionScheduleManager";
import CronScheduleModal, { CronSchedule } from "../../components/integrations/CronScheduleModal";
import ScheduleHistoryModal from "../../components/integrations/ScheduleHistoryModal";


const channelOptions = [
  { value: "", label: "전체" },
  ...PLATFORM_OPTIONS.map(opt => ({ value: opt.value, label: opt.label })),
];

// ConnectedShop 인터페이스 (기존 시스템과의 호환성 유지)
interface ConnectedShop {
  id: string;
  name: string;
  vendorId: string;
  platform: string;
  status: "연동중" | "오류" | "미연동" | "수집중";
  lastSync: string;
  nextSync: string;
  syncProgress?: number; // 수집 진행률 (0-100)
  syncStartTime?: string; // 수집 시작 시간
  lastRunTime?: string; // 마지막 크론 실행 시간
}

const mockConnectedShops: ConnectedShop[] = [
  {
    id: "shop-1",
    name: "카페24 베이직 몰",
    vendorId: "1",
    platform: "cafe24",
    status: "수집중",
    lastSync: "2024-04-20 08:30",
    nextSync: "2024-04-20 12:30",
    syncProgress: 65,
    syncStartTime: "2024-04-20 10:15",
    lastRunTime: "2024-04-20 10:15",
  },
  {
    id: "shop-2",
    name: "스마트스토어 메인",
    vendorId: "3",
    platform: "smartstore",
    status: "오류",
    lastSync: "2024-04-19 23:10",
    nextSync: "2024-04-20 11:00",
    lastRunTime: "2024-04-19 23:10",
  },
  {
    id: "shop-3",
    name: "쿠팡 마켓플레이스",
    vendorId: "5",
    platform: "coupang",
    status: "수집중",
    lastSync: "2024-04-20 09:05",
    nextSync: "2024-04-20 13:05",
    syncProgress: 23,
    syncStartTime: "2024-04-20 10:45",
    lastRunTime: "2024-04-20 10:45",
  },
  {
    id: "shop-4",
    name: "고도몰 파트너",
    vendorId: "2",
    platform: "godo",
    status: "미연동",
    lastSync: "-",
    nextSync: "-",
    lastRunTime: "-",
  },
];

const connectedShopOptions = mockConnectedShops.map((shop) => ({
  id: shop.id,
  name: shop.name,
  platform: shop.platform,
}));

const IntegrationPage: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [channelFilter, setChannelFilter] = React.useState(channelOptions[0].value);
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [isRegisterOpen, setRegisterOpen] = React.useState(false);
  const [selectedShop, setSelectedShop] = React.useState<string | null>(null);
  
  // 판매처 연동 관리 상태
  const [vendorSearch, setVendorSearch] = React.useState("");
  const [vendorStatusFilter, setVendorStatusFilter] = React.useState<string>("");
  const [selectedVendorIntegration, setSelectedVendorIntegration] = React.useState<string | null>(null);
  const [isVendorIntegrationModalOpen, setIsVendorIntegrationModalOpen] = React.useState(false);
  const [isCronModalOpen, setIsCronModalOpen] = React.useState(false);
  const [selectedCronSchedule, setSelectedCronSchedule] = React.useState<CronSchedule | undefined>(undefined);
  
  // 수집 진행률 실시간 업데이트를 위한 상태
  const [vendorIntegrations, setVendorIntegrations] = React.useState<VendorIntegration[]>(allVendorIntegrations);
  const [editIntegration, setEditIntegration] = React.useState<VendorIntegration | null>(null);
  const [isLoadingSync, setIsLoadingSync] = React.useState(false);
  const [cronSchedules, setCronSchedules] = React.useState<CronSchedule[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);
  const [selectedScheduleForHistory, setSelectedScheduleForHistory] = React.useState<CronSchedule | undefined>(undefined);

  // 수집중인 항목들의 진행률을 실시간으로 업데이트
  React.useEffect(() => {
    const interval = setInterval(() => {
      setVendorIntegrations(prev => 
        prev.map(integration => {
          if (integration.status === "수집중" && integration.syncProgress !== undefined) {
            // 진행률을 1-3%씩 증가 (완료되면 연동중으로 변경)
            const newProgress = Math.min(integration.syncProgress + Math.floor(Math.random() * 3) + 1, 100);
            
            if (newProgress >= 100) {
              const completedTime = new Date().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return {
                ...integration,
                status: "연동중" as const,
                syncProgress: undefined,
                syncStartTime: undefined,
                lastSync: completedTime,
                lastRunTime: completedTime
              };
            } else {
              return {
                ...integration,
                syncProgress: newProgress
              };
            }
          }
          return integration;
        })
      );
    }, 2000); // 2초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  const filteredVendorIntegrations = React.useMemo(() => {
    return vendorIntegrations.filter((integration) => {
      const matchesSearch = vendorSearch
        ? integration.vendorName.includes(vendorSearch) || integration.vendorId.includes(vendorSearch)
        : true;
      const matchesChannel = channelFilter ? integration.platform === channelFilter : true;
      const matchesStatus = vendorStatusFilter ? integration.status === vendorStatusFilter : true;
      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [vendorSearch, channelFilter, vendorStatusFilter]);

  // 크론 스케줄 관리 함수
  const handleCronScheduleSave = (schedule: CronSchedule) => {
    if (selectedCronSchedule?.id) {
      // 수정
      setCronSchedules(prev => prev.map(s => s.id === selectedCronSchedule.id ? { ...schedule, id: selectedCronSchedule.id } : s));
    } else {
      // 새로 추가
      const newSchedule = { ...schedule, id: Date.now().toString() };
      setCronSchedules(prev => [...prev, newSchedule]);
    }
    setSelectedCronSchedule(undefined);
  };

  const handleCronScheduleEdit = (schedule: CronSchedule) => {
    setSelectedCronSchedule(schedule);
    setIsCronModalOpen(true);
  };

  const handleCronScheduleDelete = (scheduleId: string) => {
    if (confirm('정말로 이 스케줄을 삭제하시겠습니까?')) {
      setCronSchedules(prev => prev.filter(s => s.id !== scheduleId));
    }
  };

  const handleViewHistory = (schedule: CronSchedule) => {
    setSelectedScheduleForHistory(schedule);
    setIsHistoryModalOpen(true);
  };

  const handleCronScheduleToggle = (scheduleId: string) => {
    setCronSchedules(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  // 판매처 목록을 크론 스케줄 모달에 전달하기 위한 변환
  const vendorOptions = React.useMemo(() => {
    return allVendorIntegrations.map((integration: VendorIntegration) => ({
      id: integration.id,
      name: integration.vendorName,
      platform: integration.platform
    }));
  }, []);


  // 데이터 수집 실행 함수
  const runDataSync = async (integrationId: string) => {
    setIsLoadingSync(true);
    
    // 수집 상태로 변경
    const startTime = new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    setVendorIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? {
              ...integration,
              status: "수집중" as const,
              syncProgress: 0,
              syncStartTime: startTime,
              lastRunTime: startTime
            }
          : integration
      )
    );
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoadingSync(false);
  };

  // 판매처 연동 설정 함수
  const configureVendorIntegration = (integrationId: string) => {
    setSelectedVendorIntegration(integrationId);
    // prefill editable copy
    const found = vendorIntegrations.find(i => i.id === integrationId) || allVendorIntegrations.find(i => i.id === integrationId);
    setEditIntegration(found ? { ...found } : null);
    setIsVendorIntegrationModalOpen(true);
  };

  // 판매처 연동 통계
  const vendorSummary = React.useMemo(() => {
    const total = vendorIntegrations.length;
    const active = vendorIntegrations.filter((integration) => integration.status === "연동중").length;
    const collecting = vendorIntegrations.filter((integration) => integration.status === "수집중").length;
    const pending = vendorIntegrations.filter((integration) => integration.status === "미연동").length;
    const error = vendorIntegrations.filter((integration) => integration.status === "오류").length;
    return { total, active, collecting, pending, error };
  }, [vendorIntegrations]);

  const columns: TableColumn<ConnectedShop>[] = [
    {
      key: "name",
      title: "판매처",
      render: (_, record) => (
        <div className="font-semibold text-gray-900 text-lg">{record.name}</div>
      ),
    },
    {
      key: "platform",
      title: "플랫폼",
      render: (value) => (
        <span className="text-base">{channelOptions.find((option) => option.value === value)?.label ?? value}</span>
      ),
    },
    {
      key: "status",
      title: "상태",
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            value === "연동중" ? "bg-green-500" : value === "오류" ? "bg-red-500" : "bg-gray-400"
          }`} />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    { 
      key: "lastSync", 
      title: "마지막 수집",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">외부 연동 관리</h1>
            <div className="flex gap-3">
              <Button 
                size="big"
                onClick={() => {
                  setSelectedCronSchedule({
                    name: '',
                    expression: '',
                    description: '',
                    isActive: true,
                    type: 'product',
                    types: [],
                    vendorId: '',
                    vendorName: '',
                    platform: '',
                    isGlobal: true,
                    vendorIds: [],
                    runCount: 0,
                    successCount: 0,
                    errorCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
                  setIsCronModalOpen(true);
                }}
              >
                전체 판매처 스케줄 추가
              </Button>
              <Button 
                size="big"
                onClick={() => setRegisterOpen(true)}
              >
                새 판매처 연결
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 거대한 통계 카드 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-5 gap-4 mb-8">
          <button 
            onClick={() => setVendorStatusFilter("")}
            className={`rounded-xl p-6 text-center shadow-sm hover:shadow-md transition ${
              vendorStatusFilter === "" ? "bg-gray-200" : "bg-white"
            }`}
          >
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {vendorSummary.total}
            </div>
            <div className="text-gray-600 text-sm">전체 판매처</div>
          </button>
          
          <button 
            onClick={() => setVendorStatusFilter("연동중")}
            className={`rounded-xl p-6 text-center shadow-sm hover:shadow-md transition ${
              vendorStatusFilter === "연동중" ? "bg-green-200" : "bg-green-50"
            }`}
          >
            <div className="text-4xl font-bold text-green-600 mb-2">
              {vendorSummary.active}
            </div>
            <div className="text-green-700 font-medium text-sm">연동중</div>
          </button>
          
          <button 
            onClick={() => setVendorStatusFilter("수집중")}
            className={`rounded-xl p-6 text-center shadow-sm hover:shadow-md transition ${
              vendorStatusFilter === "수집중" ? "bg-blue-200" : "bg-blue-50"
            }`}
          >
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {vendorSummary.collecting}
            </div>
            <div className="text-blue-700 font-medium text-sm">수집중</div>
          </button>
          
          <button 
            onClick={() => setVendorStatusFilter("미연동")}
            className={`rounded-xl p-6 text-center shadow-sm hover:shadow-md transition ${
              vendorStatusFilter === "미연동" ? "bg-gray-300" : "bg-gray-100"
            }`}
          >
            <div className="text-4xl font-bold text-gray-600 mb-2">
              {vendorSummary.pending}
            </div>
            <div className="text-gray-700 text-sm">미연동</div>
          </button>
          
          <button 
            onClick={() => setVendorStatusFilter("오류")}
            className={`rounded-xl p-6 text-center shadow-sm hover:shadow-md transition ${
              vendorStatusFilter === "오류" ? "bg-red-200" : "bg-red-50"
            }`}
          >
            <div className="text-4xl font-bold text-red-600 mb-2">
              {vendorSummary.error}
            </div>
            <div className="text-red-700 font-medium text-sm">오류</div>
          </button>
        </div>

        {/* 전체 판매처 스케줄 목록 */}
        {(() => {
          const globalSchedules = cronSchedules.filter(s => s.isGlobal);
          if (globalSchedules.length === 0) return null;
          
          return (
            <div className="bg-blue-50 rounded-xl p-6 mb-6 shadow-sm border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">전체 판매처 스케줄</h2>
                  <p className="text-sm text-gray-600 mt-1">모든 판매처에 일괄 적용</p>
                </div>
                <div className="text-sm text-gray-600">
                  활성 {globalSchedules.filter(s => s.isActive).length}개 / 전체 {globalSchedules.length}개
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {globalSchedules.map((schedule) => (
                  <div key={schedule.id} className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${schedule.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">{schedule.name}</div>
                          <div className="text-xs text-gray-500">
                            {(() => {
                              const types = schedule.types || [schedule.type];
                              const typeLabels = types.map(t => 
                                t === 'product' ? '상품' :
                                t === 'inventory' ? '재고' :
                                t === 'category' ? '카테고리' : '주문'
                              );
                              return typeLabels.join(', ');
                            })()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCronScheduleToggle(schedule.id!);
                        }}
                        className={`px-2 py-1 text-xs rounded-full transition-colors flex-shrink-0 ${
                          schedule.isActive 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {schedule.isActive ? '활성' : '비활성'}
                      </button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">주기:</span> 
                        <span className="ml-1 font-mono bg-gray-100 px-1 rounded">{schedule.expression}</span>
                      </div>
                      <div className="text-xs text-gray-500">{schedule.description}</div>
                      <div className="text-xs text-gray-600">
                        전체 판매처 ({schedule.vendorIds?.length || vendorIntegrations.length}개)
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewHistory(schedule);
                          }}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          내역
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCronScheduleEdit(schedule);
                          }}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          수정
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCronScheduleDelete(schedule.id!);
                        }}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 검색 필터 - 크고 단순하게 */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="판매처 검색"
              value={vendorSearch}
              onChange={(event) => setVendorSearch(event.target.value)}
              fullWidth
              className="text-lg py-3"
            />
            <Dropdown
              options={channelOptions}
              value={channelFilter}
              onChange={setChannelFilter}
              fullWidth
            />
            <Dropdown
              options={[
                { value: "", label: "모든 상태" },
                { value: "연동중", label: "연동중" },
                { value: "오류", label: "오류" },
                { value: "미연동", label: "미연동" },
                { value: "수집중", label: "수집중" },
              ]}
              value={vendorStatusFilter}
              onChange={setVendorStatusFilter}
              fullWidth
            />
          </div>
        </div>

        {/* 판매처 연동 테이블 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">판매처</th>
                  <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">플랫폼</th>
                  <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품 수</th>
                  <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수집 주기</th>
                  <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">마지막 실행</th>
                  <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendorIntegrations.map((integration) => {
                  const isExpanded = selectedVendorIntegration === integration.id;
                  const vendorSchedules = cronSchedules.filter(s => !s.isGlobal && s.vendorId === integration.id);
                  const activeSchedules = vendorSchedules.filter(s => s.isActive);
                  
                  return (
                    <React.Fragment key={integration.id}>
                      <tr 
                        onClick={() => setSelectedVendorIntegration(isExpanded ? null : integration.id)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVendorIntegration(isExpanded ? null : integration.id);
                              }}
                              className="mr-2 p-1 hover:bg-gray-200 rounded"
                            >
                              {isExpanded ? (
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </button>
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              integration.status === "연동중" ? "bg-green-500" : 
                              integration.status === "오류" ? "bg-red-500" : 
                              integration.status === "수집중" ? "bg-blue-500 animate-pulse" : "bg-gray-400"
                            }`} />
                            <div className="text-sm font-medium text-gray-900 truncate">{integration.vendorName}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {channelOptions.find(o => o.value === integration.platform)?.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            integration.status === "연동중" ? "bg-green-100 text-green-800" : 
                            integration.status === "오류" ? "bg-red-100 text-red-800" : 
                            integration.status === "수집중" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {integration.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {integration.status === "수집중" ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-blue-600 font-medium">수집 중...</span>
                                <span className="text-gray-500">{integration.syncProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${integration.syncProgress || 0}%` }}
                                ></div>
                              </div>
                              {integration.syncStartTime && (
                                <div className="text-xs text-gray-400">
                                  시작: {integration.syncStartTime}
                                </div>
                              )}
                            </div>
                          ) : (
                            `${integration.productCount}개`
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {vendorSchedules.length > 0 ? (
                              <span className="text-sm text-gray-600">
                                {activeSchedules.length}/{vendorSchedules.length}개 활성
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">설정 없음</span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCronSchedule({
                                  name: '',
                                  expression: '',
                                  description: '',
                                  isActive: true,
                                  type: 'product',
                                  types: [],
                                  vendorId: integration.id,
                                  vendorName: integration.vendorName,
                                  platform: integration.platform,
                                  isGlobal: false,
                                  runCount: 0,
                                  successCount: 0,
                                  errorCount: 0,
                                  createdAt: new Date().toISOString(),
                                  updatedAt: new Date().toISOString()
                                });
                                setIsCronModalOpen(true);
                              }}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            >
                              추가
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <span className={integration.lastRunTime === "-" ? "text-gray-400" : "text-gray-700"}>
                              {integration.lastRunTime || "-"}
                            </span>
                            {integration.lastRunTime && integration.lastRunTime !== "-" && (
                              <span className="text-xs text-gray-400">
                                {(() => {
                                  const lastRun = new Date(integration.lastRunTime);
                                  const now = new Date();
                                  const diffMs = now.getTime() - lastRun.getTime();
                                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                  const diffDays = Math.floor(diffHours / 24);
                                  
                                  if (diffDays > 0) {
                                    return `${diffDays}일 전`;
                                  } else if (diffHours > 0) {
                                    return `${diffHours}시간 전`;
                                  } else {
                                    const diffMinutes = Math.floor(diffMs / (1000 * 60));
                                    return `${diffMinutes}분 전`;
                                  }
                                })()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                runDataSync(integration.id);
                              }}
                              disabled={isLoadingSync || integration.status === "수집중" || integration.status === "미연동"}
                              title="데이터 수집 실행"
                              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                integration.status === "수집중" || integration.status === "미연동"
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                                  : isLoadingSync 
                                    ? "bg-blue-500 text-white opacity-50" 
                                    : "bg-blue-500 text-white hover:bg-blue-600"
                              }`}
                            >
                              {integration.status === "수집중" ? "수집 중..." : 
                               isLoadingSync ? "실행 중..." : "실행"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                configureVendorIntegration(integration.id);
                              }}
                              title="연동 설정 및 상세 정보"
                              className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                            >
                              상세
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* 확장된 하위 컨텐츠 - 수집 주기 목록 및 내역 */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-6">
                              {/* 수집 주기 목록 */}
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold text-gray-900">수집 주기 목록</h3>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCronSchedule({
                                        name: '',
                                        expression: '',
                                        description: '',
                                        isActive: true,
                                        type: 'product',
                                        types: [],
                                        vendorId: integration.id,
                                        vendorName: integration.vendorName,
                                        platform: integration.platform,
                                        isGlobal: false,
                                        runCount: 0,
                                        successCount: 0,
                                        errorCount: 0,
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString()
                                      });
                                      setIsCronModalOpen(true);
                                    }}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    스케줄 추가
                                  </button>
                                </div>
                                
                                {vendorSchedules.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {vendorSchedules.map((schedule) => (
                                      <div key={schedule.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${schedule.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        <div className="flex-1">
                                          <div className="font-semibold text-gray-900 text-sm">{schedule.name}</div>
                                          <div className="text-xs text-gray-500">
                                            {(() => {
                                              const types = schedule.types || [schedule.type];
                                              const typeLabels = types.map(t => 
                                                t === 'product' ? '상품' :
                                                t === 'inventory' ? '재고' :
                                                t === 'category' ? '카테고리' : '주문'
                                              );
                                              return typeLabels.join(', ');
                                            })()}
                                          </div>
                                        </div>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCronScheduleToggle(schedule.id!);
                                            }}
                                            className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                              schedule.isActive 
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                          >
                                            {schedule.isActive ? '활성' : '비활성'}
                                          </button>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                          <div className="text-xs text-gray-600">
                                            <span className="font-medium">주기:</span> 
                                            <span className="ml-1 font-mono bg-gray-100 px-1 rounded">{schedule.expression}</span>
                                          </div>
                                          <div className="text-xs text-gray-500">{schedule.description}</div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewHistory(schedule);
                                              }}
                                              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                            >
                                              내역
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCronScheduleEdit(schedule);
                                              }}
                                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                            >
                                              수정
                                            </button>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCronScheduleDelete(schedule.id!);
                                            }}
                                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                          >
                                            삭제
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 mb-4">설정된 수집 주기가 없습니다.</p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCronSchedule({
                                          name: '',
                                          expression: '',
                                          description: '',
                                          isActive: true,
                                          type: 'product',
                                          types: [],
                                          vendorId: integration.id,
                                          vendorName: integration.vendorName,
                                          platform: integration.platform,
                                          isGlobal: false,
                                          runCount: 0,
                                          successCount: 0,
                                          errorCount: 0,
                                          createdAt: new Date().toISOString(),
                                          updatedAt: new Date().toISOString()
                                        });
                                        setIsCronModalOpen(true);
                                      }}
                                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                      스케줄 추가
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        {filteredVendorIntegrations.length > 10 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              총 <span className="font-medium">{filteredVendorIntegrations.length}</span>개의 판매처
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                이전
              </button>
              <span className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md">1</span>
              <span className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">2</span>
              <span className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">3</span>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 모달 */}
      <Modal
        open={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        title="새 판매처 연결"
        footer={null}
        size="big"
      >
        <RegisterIntegrationForm
          vendors={mockVendors}
          onClose={() => setRegisterOpen(false)}
          onRegistered={() => setRegisterOpen(false)}
        />
      </Modal>

      {/* 판매처 연동 설정 모달 */}
      <Modal
        open={isVendorIntegrationModalOpen}
        onClose={() => setIsVendorIntegrationModalOpen(false)}
        title="판매처 연동 설정"
        footer={null}
        size="big"
      >
        {selectedVendorIntegration && editIntegration && (
          <div className="p-6">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">{editIntegration.vendorName}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">플랫폼:</span>
                    <span className="ml-2 font-medium">{channelOptions.find(o => o.value === editIntegration.platform)?.label}</span>
                  </div>
                  <div>
                    <label className="text-gray-600">상태</label>
                    <select
                      value={editIntegration.status}
                      onChange={(e) => setEditIntegration({ ...editIntegration, status: e.target.value as VendorIntegration['status'] })}
                      className="ml-2 px-2 py-1 border rounded text-sm"
                    >
                      <option value="연동중">연동중</option>
                      <option value="수집중">수집중</option>
                      <option value="오류">오류</option>
                      <option value="미연동">미연동</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-600">상품 수</label>
                    <input
                      type="number"
                      value={editIntegration.productCount}
                      onChange={(e) => setEditIntegration({ ...editIntegration, productCount: Number(e.target.value) })}
                      className="ml-2 px-2 py-1 border rounded text-sm w-32"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API 키</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editIntegration.apiKey}
                    onChange={(e) => setEditIntegration({ ...editIntegration, apiKey: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                  <button
                    onClick={() => navigator.clipboard?.writeText(editIntegration.apiKey)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    복사
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">수집 스케줄은 <strong>스케줄 관리</strong>에서 설정할 수 있습니다.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => { setIsVendorIntegrationModalOpen(false); setEditIntegration(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (!editIntegration) return;
                    // update local state
                    setVendorIntegrations(prev => prev.map(i => i.id === editIntegration.id ? { ...i, ...editIntegration } : i));
                    // update mock store
                    updateIntegrationStatus(editIntegration.id, editIntegration.status, {
                      apiKey: editIntegration.apiKey,
                      productCount: editIntegration.productCount,
                      lastRunTime: editIntegration.lastRunTime,
                      syncProgress: editIntegration.syncProgress,
                    });
                    setIsVendorIntegrationModalOpen(false);
                    setEditIntegration(null);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 크론 스케줄 설정 모달 */}
      <CronScheduleModal
        open={isCronModalOpen}
        onClose={() => {
          setIsCronModalOpen(false);
          setSelectedCronSchedule(undefined);
        }}
        onSave={handleCronScheduleSave}
        initialSchedule={selectedCronSchedule}
        vendors={vendorOptions}
      />

      {/* 스케줄 실행 내역 모달 */}
      {selectedScheduleForHistory && (
        <ScheduleHistoryModal
          open={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedScheduleForHistory(undefined);
          }}
          schedule={selectedScheduleForHistory}
        />
      )}
    </div>
  );
};

export default IntegrationPage;