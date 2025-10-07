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
  type: 'product' | 'inventory' | 'category' | 'order';
  vendorId: string;
  vendorName: string;
  platform: string;
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

  const presetSchedules = [
    { value: 'hourly', label: '매시간', expression: '0 * * * *', description: '매시간 정각에 실행' },
    { value: '6hourly', label: '6시간마다', expression: '0 */6 * * *', description: '6시간마다 실행' },
    { value: 'daily', label: '매일', expression: '0 0 * * *', description: '매일 자정에 실행' },
    { value: 'weekly', label: '매주', expression: '0 0 * * 0', description: '매주 일요일 자정에 실행' },
    { value: 'custom', label: '사용자 정의', expression: '', description: '직접 크론 표현식 입력' }
  ];

  const handlePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue);
    const preset = presetSchedules.find(p => p.value === presetValue);
    if (preset && preset.value !== 'custom') {
      setSchedule(prev => ({
        ...prev,
        expression: preset.expression,
        description: preset.description
      }));
    }
  };

  const handleExpressionChange = (expression: string) => {
    setSchedule(prev => ({ ...prev, expression }));
  };

  const validateCronExpression = (expression: string): boolean => {
    const cronRegex = /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([0-2]?\d|3[01])) (\*|([0]?\d|1[0-2])) (\*|([0-6]))$/;
    return cronRegex.test(expression);
  };

  const getNextRunTimes = (expression: string): string[] => {
    // 실제로는 크론 라이브러리를 사용하여 다음 실행 시간을 계산
    // 여기서는 예시로 하드코딩
    const now = new Date();
    const nextRuns = [];
    
    for (let i = 1; i <= 5; i++) {
      const nextRun = new Date(now.getTime() + (i * 60 * 60 * 1000)); // 1시간씩 추가
      nextRuns.push(nextRun.toLocaleString('ko-KR'));
    }
    
    return nextRuns;
  };

  const handleSave = () => {
    if (!schedule.name.trim()) {
      alert('스케줄 이름을 입력해주세요.');
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
    
    onSave(schedule);
    onClose();
  };

  const cronExpressionParts = schedule.expression.split(' ');
  const isValid = schedule.expression.trim() && validateCronExpression(schedule.expression);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="수집 주기 설정"
      size="big"
      footer={null}
    >
      <div className="p-6 space-y-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
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
            >
              <option value="">판매처를 선택하세요</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} ({vendor.platform})
                </option>
              ))}
            </select>
          </div>

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
              수집 유형 *
            </label>
            <select
              value={schedule.type}
              onChange={(e) => setSchedule(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="product">상품 정보</option>
              <option value="inventory">재고 정보</option>
              <option value="category">카테고리 정보</option>
              <option value="order">주문 정보</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={schedule.description}
              onChange={(e) => setSchedule(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="스케줄에 대한 설명을 입력하세요"
            />
          </div>
        </div>

        {/* 크론 표현식 설정 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">실행 주기 설정</h3>
          
          {/* 미리 정의된 스케줄 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              미리 정의된 스케줄
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presetSchedules.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetChange(preset.value)}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    selectedPreset === preset.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-sm text-gray-600">{preset.description}</div>
                  {preset.expression && (
                    <div className="text-xs text-gray-500 mt-1 font-mono">{preset.expression}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 크론 표현식 직접 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              크론 표현식 *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={schedule.expression}
                onChange={(e) => handleExpressionChange(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                  schedule.expression && !isValid ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0 0 * * * (매일 자정)"
              />
              {isValid && (
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>형식: 분(0-59) 시(0-23) 일(1-31) 월(1-12) 요일(0-7)</p>
              <p>예시: 0 0 * * * (매일 자정), 0 */6 * * * (6시간마다), 0 9 * * 1-5 (평일 오전 9시)</p>
            </div>
          </div>

          {/* 크론 표현식 파싱 */}
          {isValid && cronExpressionParts.length === 5 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">실행 시간 해석</h4>
              <div className="grid grid-cols-5 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-medium">분</div>
                  <div className="text-gray-600">{cronExpressionParts[0]}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">시</div>
                  <div className="text-gray-600">{cronExpressionParts[1]}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">일</div>
                  <div className="text-gray-600">{cronExpressionParts[2]}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">월</div>
                  <div className="text-gray-600">{cronExpressionParts[3]}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">요일</div>
                  <div className="text-gray-600">{cronExpressionParts[4]}</div>
                </div>
              </div>
            </div>
          )}

          {/* 다음 실행 시간 미리보기 */}
          {isValid && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">예상 다음 실행 시간</h4>
              <div className="space-y-1 text-sm text-blue-800">
                {getNextRunTimes(schedule.expression).map((time, index) => (
                  <div key={index}>{index + 1}. {time}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 활성화 설정 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">스케줄 활성화</div>
            <div className="text-sm text-gray-600">체크 해제 시 스케줄이 일시 정지됩니다</div>
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
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={!schedule.name.trim() || !schedule.expression.trim() || !isValid}
          >
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CronScheduleModal;
