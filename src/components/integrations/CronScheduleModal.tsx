import React, { useState } from 'react';
import { Modal, Button } from '../../design-system';

interface CronScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (schedule: CronSchedule) => void;
  initialSchedule?: CronSchedule;
  vendors?: Array<{ id: string; name: string; platform: string }>;
}

export interface CronSchedule {
  id?: string;
  name: string;
  expression: string;
  description: string;
  isActive: boolean;
  type: 'product' | 'inventory' | 'category' | 'order'; // 하위 호환성을 위해 유지
  types?: ('product' | 'inventory' | 'category' | 'order')[]; // 멀티 셀렉트
  vendorId: string;
  vendorName: string;
  platform: string;
  isGlobal?: boolean; // 전체 판매처 대상 여부
  vendorIds?: string[]; // 글로벌 스케줄일 경우 선택된 판매처 ID 목록
  lastRun?: string;
  nextRun?: string;
  runCount?: number;
  successCount?: number;
  errorCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const CronScheduleModal: React.FC<CronScheduleModalProps> = ({
  open,
  onClose,
  onSave,
  initialSchedule,
  vendors = []
}) => {
  const [schedule, setSchedule] = useState<CronSchedule>(
    initialSchedule || {
      name: '',
      expression: '',
      description: '',
      isActive: true,
      type: 'product',
      vendorId: '',
      vendorName: '',
      platform: '',
      runCount: 0,
      successCount: 0,
      errorCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [scheduleType, setScheduleType] = useState<'interval' | 'daily' | 'weekly' | 'custom'>('daily');
  const [intervalValue, setIntervalValue] = useState<number>(1);
  const [intervalUnit, setIntervalUnit] = useState<'minutes' | 'hours' | 'days'>('hours');
  const [dailyTime, setDailyTime] = useState<string>('09:00');
  const [weeklyDay, setWeeklyDay] = useState<number>(1); // 1=월요일
  const [weeklyTime, setWeeklyTime] = useState<string>('09:00');

  // initialSchedule이 변경될 때 schedule 업데이트
  React.useEffect(() => {
    if (open) {
      if (initialSchedule) {
        setSchedule(initialSchedule);
      } else {
        setSchedule({
          name: '',
          expression: '',
          description: '',
          isActive: true,
          type: 'product',
          types: ['product'],
          vendorId: '',
          vendorName: '',
          platform: '',
          runCount: 0,
          successCount: 0,
          errorCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  }, [open, initialSchedule]);

  // 크론 표현식 생성 함수들
  const generateCronExpression = (): string => {
    switch (scheduleType) {
      case 'interval':
        if (intervalUnit === 'minutes') {
          return `*/${intervalValue} * * * *`;
        } else if (intervalUnit === 'hours') {
          return `0 */${intervalValue} * * *`;
        } else if (intervalUnit === 'days') {
          return `0 0 */${intervalValue} * *`;
        }
        return '';
      
      case 'daily':
        const [hour, minute] = dailyTime.split(':');
        return `${minute} ${hour} * * *`;
      
      case 'weekly':
        const [weekHour, weekMinute] = weeklyTime.split(':');
        return `${weekMinute} ${weekHour} * * ${weeklyDay}`;
      
      case 'custom':
        return schedule.expression;
      
      default:
        return '';
    }
  };

  const getScheduleDescription = (): string => {
    switch (scheduleType) {
      case 'interval':
        if (intervalUnit === 'minutes') {
          return `매 ${intervalValue}분마다 실행`;
        } else if (intervalUnit === 'hours') {
          return `매 ${intervalValue}시간마다 실행`;
        } else if (intervalUnit === 'days') {
          return `매 ${intervalValue}일마다 실행`;
        }
        return '';
      
      case 'daily':
        return `매일 ${dailyTime}에 실행`;
      
      case 'weekly':
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        return `매주 ${dayNames[weeklyDay]}요일 ${weeklyTime}에 실행`;
      
      case 'custom':
        return '사용자 정의 크론 표현식';
      
      default:
        return '';
    }
  };

  // 스케줄 타입 변경 시 크론 표현식 업데이트
  React.useEffect(() => {
    const expression = generateCronExpression();
    const description = getScheduleDescription();
    setSchedule(prev => ({
      ...prev,
      expression,
      description
    }));
  }, [scheduleType, intervalValue, intervalUnit, dailyTime, weeklyDay, weeklyTime]);

  const handleExpressionChange = (expression: string) => {
    setSchedule(prev => ({ ...prev, expression }));
  };

  const validateCronExpression = (expression: string): boolean => {
    if (!expression.trim()) return false;
    
    // 기본적인 크론 표현식 형태 검증 (더 유연하게)
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return false;
    
    // 각 부분이 숫자, *, 또는 */숫자 형태인지 확인
    const cronPartRegex = /^(\*|\*\/\d+|\d+(-\d+)?(,\d+(-\d+)?)*)$/;
    return parts.every(part => cronPartRegex.test(part));
  };


  const handleSave = () => {
    if (!schedule.name.trim()) {
      alert('스케줄 이름을 입력해주세요.');
      return;
    }
    
    // 수집 유형 검증
    const selectedTypes = schedule.types || [];
    if (!selectedTypes.length) {
      alert('최소 하나 이상의 수집 유형을 선택해주세요.');
      return;
    }
    
    if (!schedule.expression.trim()) {
      alert('크론 표현식을 입력해주세요.');
      return;
    }
    
    if (!validateCronExpression(schedule.expression)) {
      alert('올바른 크론 표현식을 입력해주세요.');
      return;
    }
    
    // 판매처 선택 검증
    if (schedule.isGlobal) {
      // 글로벌 스케줄: 자동으로 모든 판매처 ID 설정
      const finalSchedule = {
        ...schedule,
        vendorIds: vendors.map(v => v.id)
      };
      onSave(finalSchedule);
    } else {
      // 개별 스케줄: vendorId 필수
      if (!schedule.vendorId) {
        alert('판매처를 선택해주세요.');
        return;
      }
      onSave(schedule);
    }
    
    onClose();
  };


  return (
    <Modal
      open={open}
      onClose={onClose}
      title="수집 주기 설정"
      size="big"
      footer={null}
    >
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* 왼쪽: 기본 정보 */}
          <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">기본 정보</h3>
          
          {/* 판매처 선택 */}
          {schedule.isGlobal ? (
            // 전체 판매처 일괄 적용
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="space-y-2">
                <div className="text-gray-900 font-medium">적용 대상</div>
                <div className="text-gray-700 text-sm">
                  전체 판매처 일괄 적용 (현재 {vendors.length}개)
                </div>
              </div>
            </div>
          ) : (
            // 개별 판매처 선택
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                판매처 선택 *
              </label>
              <select
                value={schedule.vendorId}
                onChange={(e) => {
                  const selectedVendor = vendors.find(v => v.id === e.target.value);
                  setSchedule(prev => ({ 
                    ...prev, 
                    vendorId: e.target.value,
                    vendorName: selectedVendor?.name || '',
                    platform: selectedVendor?.platform || ''
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!initialSchedule?.vendorId}
              >
                <option value="">판매처를 선택하세요</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.platform})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              스케줄 이름 *
            </label>
            <input
              type="text"
              value={schedule.name}
              onChange={(e) => setSchedule(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 상품 정보 수집"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수집 유형 * (복수 선택 가능)
            </label>
            <div className="space-y-2 border border-gray-300 rounded-lg p-3">
              {[
                { value: 'product', label: '상품 정보' },
                { value: 'order', label: '주문 정보' }
              ].map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`type-${option.value}`}
                    checked={(schedule.types || [schedule.type]).includes(option.value as any)}
                    onChange={(e) => {
                      const currentTypes = schedule.types || [schedule.type];
                      const newTypes = e.target.checked
                        ? [...currentTypes.filter(t => t), option.value as any]
                        : currentTypes.filter(t => t !== option.value);
                      setSchedule(prev => ({ 
                        ...prev, 
                        types: newTypes,
                        type: newTypes[0] || 'product' // 하위 호환성
                      }));
                    }}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`type-${option.value}`} className="text-sm text-gray-700 cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={schedule.description}
              onChange={(e) => setSchedule(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="스케줄에 대한 설명을 입력하세요"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">스케줄 설정 가이드</div>
              <div className="space-y-1">
                <div>• 전체 적용: 모든 판매처에 동일한 스케줄 적용</div>
                <div>• 개별 적용: 특정 판매처에만 적용</div>
                <div>• 수집 유형은 복수 선택 가능</div>
              </div>
            </div>
          </div>
          </div>

          {/* 오른쪽: 실행 주기 설정 */}
          <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">실행 주기 설정</h3>
          
          {/* 스케줄 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              실행 방식 선택
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setScheduleType('interval')}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  scheduleType === 'interval'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-sm">주기적 반복</div>
                <div className="text-xs text-gray-600">정해진 간격으로 반복</div>
              </button>
              
              <button
                type="button"
                onClick={() => setScheduleType('daily')}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  scheduleType === 'daily'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-sm">매일 실행</div>
                <div className="text-xs text-gray-600">특정 시간에 실행</div>
              </button>
              
              <button
                type="button"
                onClick={() => setScheduleType('weekly')}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  scheduleType === 'weekly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-sm">매주 실행</div>
                <div className="text-xs text-gray-600">특정 요일과 시간</div>
              </button>
              
              <button
                type="button"
                onClick={() => setScheduleType('custom')}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  scheduleType === 'custom'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-sm">직접 설정</div>
                <div className="text-xs text-gray-600">크론 표현식</div>
              </button>
            </div>
          </div>

          {/* 주기적 반복 설정 */}
          {scheduleType === 'interval' && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">반복 간격 설정</h4>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">매</span>
                <input
                  type="number"
                  min="1"
                  max="59"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minutes">분</option>
                  <option value="hours">시간</option>
                  <option value="days">일</option>
                </select>
                <span className="text-sm text-gray-700">마다 실행</span>
              </div>
              <div className="text-sm text-gray-600">
                예: 매 2시간마다 실행, 매 30분마다 실행
              </div>
            </div>
          )}

          {/* 매일 실행 설정 */}
          {scheduleType === 'daily' && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">매일 실행 시간</h4>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">매일</span>
                <input
                  type="time"
                  value={dailyTime}
                  onChange={(e) => setDailyTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">에 실행</span>
              </div>
              <div className="text-sm text-gray-600">
                예: 매일 오전 9시에 실행, 매일 오후 6시에 실행
              </div>
            </div>
          )}

          {/* 매주 실행 설정 */}
          {scheduleType === 'weekly' && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">매주 실행 설정</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">매주</span>
                  <select
                    value={weeklyDay}
                    onChange={(e) => setWeeklyDay(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>일요일</option>
                    <option value={1}>월요일</option>
                    <option value={2}>화요일</option>
                    <option value={3}>수요일</option>
                    <option value={4}>목요일</option>
                    <option value={5}>금요일</option>
                    <option value={6}>토요일</option>
                  </select>
                  <input
                    type="time"
                    value={weeklyTime}
                    onChange={(e) => setWeeklyTime(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">에 실행</span>
                </div>
                <div className="text-sm text-gray-600">
                  예: 매주 월요일 오전 9시에 실행, 매주 금요일 오후 6시에 실행
                </div>
              </div>
            </div>
          )}

          {/* 사용자 정의 크론 표현식 */}
          {scheduleType === 'custom' && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">크론 표현식 직접 입력</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={schedule.expression}
                  onChange={(e) => handleExpressionChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="0 0 * * * (매일 자정)"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>형식: 분(0-59) 시(0-23) 일(1-31) 월(1-12) 요일(0-7)</p>
                <p>예시: 0 0 * * * (매일 자정), 0 */6 * * * (6시간마다), 0 9 * * 1-5 (평일 오전 9시)</p>
              </div>
            </div>
          )}

          {/* 현재 설정 미리보기 */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-1 text-sm">현재 설정</h4>
            <div className="text-sm text-blue-800">
              <div className="font-medium text-sm">{getScheduleDescription()}</div>
              <div className="text-xs text-blue-600 mt-1 font-mono">
                {schedule.expression}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* 활성화 설정 및 버튼 */}
        <div className="mt-6 pt-6 border-t space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 text-sm">스케줄 활성화</div>
              <div className="text-xs text-gray-600">체크 해제 시 스케줄이 일시 정지됩니다</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={schedule.isActive}
                onChange={(e) => setSchedule(prev => ({ ...prev, isActive: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={!schedule.name.trim() || !schedule.expression.trim() || !(schedule.types && schedule.types.length > 0)}
            >
              저장
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CronScheduleModal;
