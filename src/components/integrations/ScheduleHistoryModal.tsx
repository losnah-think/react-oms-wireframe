import React, { useState } from 'react';
import { Modal, Button } from '../../design-system';
import { CronSchedule } from './CronScheduleModal';

interface ScheduleHistoryModalProps {
  open: boolean;
  onClose: () => void;
  schedule: CronSchedule;
}

interface ScheduleHistoryItem {
  id: string;
  scheduleId: string;
  startTime: string;
  endTime: string;
  status: 'success' | 'error' | 'running';
  recordsProcessed: number;
  recordsUpdated: number;
  recordsCreated: number;
  recordsFailed: number;
  errorMessage?: string;
  duration: number; // seconds
}

const ScheduleHistoryModal: React.FC<ScheduleHistoryModalProps> = ({
  open,
  onClose,
  schedule
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error' | 'running'>('all');

  // Mock 데이터 - 실제로는 API에서 가져올 데이터
  const mockHistory: ScheduleHistoryItem[] = [
    {
      id: '1',
      scheduleId: schedule.id!,
      startTime: '2025-01-15 14:00:00',
      endTime: '2025-01-15 14:02:30',
      status: 'success',
      recordsProcessed: 1250,
      recordsUpdated: 45,
      recordsCreated: 12,
      recordsFailed: 0,
      duration: 150
    },
    {
      id: '2',
      scheduleId: schedule.id!,
      startTime: '2025-01-15 12:00:00',
      endTime: '2025-01-15 12:01:45',
      status: 'success',
      recordsProcessed: 1180,
      recordsUpdated: 23,
      recordsCreated: 8,
      recordsFailed: 0,
      duration: 105
    },
    {
      id: '3',
      scheduleId: schedule.id!,
      startTime: '2025-01-15 10:00:00',
      endTime: '2025-01-15 10:00:15',
      status: 'error',
      recordsProcessed: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsFailed: 0,
      errorMessage: 'API 연결 시간 초과',
      duration: 15
    },
    {
      id: '4',
      scheduleId: schedule.id!,
      startTime: '2025-01-15 08:00:00',
      endTime: '2025-01-15 08:02:10',
      status: 'success',
      recordsProcessed: 1100,
      recordsUpdated: 67,
      recordsCreated: 15,
      recordsFailed: 0,
      duration: 130
    }
  ];

  const filteredHistory = mockHistory.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    
    const itemDate = new Date(item.startTime);
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        return itemDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= monthAgo;
      default:
        return true;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '성공';
      case 'error': return '실패';
      case 'running': return '실행중';
      default: return '알 수 없음';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${schedule.name} - 실행 내역`}
      size="big"
      footer={null}
    >
      <div className="p-6">
        {/* 스케줄 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">스케줄명:</span>
              <span className="ml-2 font-medium">{schedule.name}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">판매처:</span>
              <span className="ml-2 font-medium">{schedule.vendorName}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">크론 표현식:</span>
              <span className="ml-2 font-mono text-sm">{schedule.expression}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">상태:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {schedule.isActive ? '활성' : '비활성'}
              </span>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">오늘</option>
              <option value="week">최근 7일</option>
              <option value="month">최근 30일</option>
              <option value="all">전체</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="success">성공</option>
              <option value="error">실패</option>
              <option value="running">실행중</option>
            </select>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredHistory.length}</div>
            <div className="text-sm text-gray-600">총 실행</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredHistory.filter(h => h.status === 'success').length}
            </div>
            <div className="text-sm text-gray-600">성공</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredHistory.filter(h => h.status === 'error').length}
            </div>
            <div className="text-sm text-gray-600">실패</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {filteredHistory.reduce((sum, h) => sum + h.recordsProcessed, 0)}
            </div>
            <div className="text-sm text-gray-600">처리된 레코드</div>
          </div>
        </div>

        {/* 실행 내역 테이블 */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">실행 시간</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">처리 레코드</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">업데이트</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">생성</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">실패</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">소요 시간</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div>{item.startTime}</div>
                      {item.endTime && (
                        <div className="text-xs text-gray-500">종료: {item.endTime}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                      {item.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">{item.errorMessage}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{item.recordsProcessed.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{item.recordsUpdated.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-blue-600">{item.recordsCreated.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{item.recordsFailed.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{formatDuration(item.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              선택한 조건에 맞는 실행 내역이 없습니다.
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleHistoryModal;

