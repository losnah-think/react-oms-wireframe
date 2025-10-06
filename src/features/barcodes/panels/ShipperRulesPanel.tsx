import React, { useState } from 'react';

// 타입 정의
interface Shipper {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  barcodeRules: BarcodeRule[];
  createdAt: string;
}

interface BarcodeRule {
  id: string;
  shipperId: string;
  templateId: string;
  priority: number;
  conditions: BarcodeCondition[];
  isActive: boolean;
  createdAt: string;
}

interface BarcodeCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn';
  value: string | string[];
  description?: string;
}

interface BarcodeTemplate {
  id: string;
  name: string;
  description: string;
  format: string;
  isActive: boolean;
}

// Mock 데이터
const mockShippers: Shipper[] = [
  {
    id: 'SHIPPER-1',
    name: 'CJ대한통운',
    code: 'CJ',
    description: '국내 최대 물류 기업',
    isActive: true,
    barcodeRules: [
      {
        id: 'RULE-1',
        shipperId: 'SHIPPER-1',
        templateId: 'TEMPLATE-1',
        priority: 1,
        conditions: [
          {
            field: 'productCategory',
            operator: 'equals',
            value: '신발',
            description: '신발 카테고리 상품'
          }
        ],
        isActive: true,
        createdAt: '2024-01-01'
      },
      {
        id: 'RULE-1-2',
        shipperId: 'SHIPPER-1',
        templateId: 'TEMPLATE-2',
        priority: 2,
        conditions: [
          {
            field: 'productCategory',
            operator: 'equals',
            value: '의류',
            description: '의류 카테고리 상품'
          }
        ],
        isActive: true,
        createdAt: '2024-01-01'
      }
    ],
    createdAt: '2024-01-01'
  },
  {
    id: 'SHIPPER-2',
    name: '한진택배',
    code: 'HANJIN',
    description: '국내 주요 택배 기업',
    isActive: true,
    barcodeRules: [
      {
        id: 'RULE-2',
        shipperId: 'SHIPPER-2',
        templateId: 'TEMPLATE-2',
        priority: 1,
        conditions: [
          {
            field: 'productCategory',
            operator: 'in',
            value: ['의류', '액세서리'],
            description: '의류 및 액세서리 상품'
          }
        ],
        isActive: true,
        createdAt: '2024-01-01'
      }
    ],
    createdAt: '2024-01-01'
  }
];

const mockTemplates: BarcodeTemplate[] = [
  {
    id: 'TEMPLATE-1',
    name: '기본 상품 바코드',
    description: '상품명, 가격, 바코드가 포함된 기본 템플릿',
    format: 'EAN13',
    isActive: true
  },
  {
    id: 'TEMPLATE-2',
    name: 'QR 코드 템플릿',
    description: 'QR 코드와 상품 정보가 포함된 템플릿',
    format: 'QR',
    isActive: true
  },
  {
    id: 'TEMPLATE-3',
    name: '전자제품 바코드',
    description: '전자제품용 특화 바코드 템플릿',
    format: 'EAN13',
    isActive: true
  },
  {
    id: 'TEMPLATE-4',
    name: '화장품 바코드',
    description: '화장품용 특화 바코드 템플릿',
    format: 'QR',
    isActive: true
  }
];

const ShipperRulesPanel: React.FC = () => {
  const [shippers, setShippers] = useState<Shipper[]>(mockShippers);
  const [templates] = useState<BarcodeTemplate[]>(mockTemplates);
  const [selectedShipper, setSelectedShipper] = useState<Shipper | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<BarcodeRule | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // 화주사별 사용 가능한 템플릿 필터링
  const getAvailableTemplates = (shipper: Shipper | null) => {
    if (!shipper) return [];
    
    const shipperTemplateIds = shipper.barcodeRules
      .filter(rule => rule.isActive)
      .map(rule => rule.templateId);
    
    return templates.filter(template => 
      shipperTemplateIds.includes(template.id)
    );
  };

  // 규칙 추가/편집 핸들러
  const handleAddRule = () => {
    if (!selectedShipper) {
      setToastMessage("화주사를 먼저 선택해주세요.");
      return;
    }
    setEditingRule(null);
    setShowRuleModal(true);
  };

  const handleEditRule = (rule: BarcodeRule) => {
    setEditingRule(rule);
    setShowRuleModal(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!selectedShipper) return;
    
    setShippers(prev => prev.map(shipper => 
      shipper.id === selectedShipper.id
        ? {
            ...shipper,
            barcodeRules: shipper.barcodeRules.filter(rule => rule.id !== ruleId)
          }
        : shipper
    ));
    
    setToastMessage("바코드 규칙이 삭제되었습니다.");
  };

  const handleToggleRule = (ruleId: string) => {
    if (!selectedShipper) return;
    
    setShippers(prev => prev.map(shipper => 
      shipper.id === selectedShipper.id
        ? {
            ...shipper,
            barcodeRules: shipper.barcodeRules.map(rule => 
              rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
            )
          }
        : shipper
    ));
  };

  const handleSaveRule = (ruleData: Partial<BarcodeRule>) => {
    if (!selectedShipper) return;

    const newRule: BarcodeRule = {
      id: editingRule?.id || `RULE-${Date.now()}`,
      shipperId: selectedShipper.id,
      templateId: ruleData.templateId || '',
      priority: ruleData.priority || 1,
      conditions: ruleData.conditions || [],
      isActive: ruleData.isActive !== undefined ? ruleData.isActive : true,
      createdAt: editingRule?.createdAt || new Date().toISOString().split('T')[0]
    };

    setShippers(prev => prev.map(shipper => 
      shipper.id === selectedShipper.id
        ? {
            ...shipper,
            barcodeRules: editingRule
              ? shipper.barcodeRules.map(rule => rule.id === editingRule.id ? newRule : rule)
              : [...shipper.barcodeRules, newRule]
          }
        : shipper
    ));

    setShowRuleModal(false);
    setEditingRule(null);
    setToastMessage(editingRule ? "바코드 규칙이 수정되었습니다." : "바코드 규칙이 추가되었습니다.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">화주사별 바코드 규칙 관리</h2>
          <p className="text-gray-600 mt-1">각 화주사별로 바코드 템플릿과 적용 조건을 설정할 수 있습니다.</p>
        </div>
        <button
          onClick={handleAddRule}
          disabled={!selectedShipper}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          규칙 추가
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 화주사 선택 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">화주사 선택</h3>
              <p className="text-sm text-gray-600 mt-1">바코드 규칙을 설정할 화주사를 선택하세요</p>
            </div>
            <div className="p-4 space-y-3">
              {shippers.map((shipper) => (
                <button
                  key={shipper.id}
                  onClick={() => setSelectedShipper(shipper)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedShipper?.id === shipper.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{shipper.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{shipper.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {shipper.code}
                        </span>
                        <span className="text-xs text-gray-500">
                          규칙 {shipper.barcodeRules.length}개
                        </span>
                      </div>
                    </div>
                    {selectedShipper?.id === shipper.id && (
                      <div className="text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 바코드 규칙 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedShipper ? `${selectedShipper.name} 바코드 규칙` : '화주사를 선택해주세요'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedShipper 
                  ? `총 ${selectedShipper.barcodeRules.length}개의 규칙이 설정되어 있습니다.`
                  : '화주사를 선택하면 해당 화주사의 바코드 규칙을 관리할 수 있습니다.'
                }
              </p>
            </div>
            <div className="p-4">
              {selectedShipper ? (
                <div className="space-y-3">
                  {selectedShipper.barcodeRules.length === 0 ? (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        바코드 규칙이 없습니다
                      </h3>
                      <p className="text-gray-600 text-sm">
                        "규칙 추가" 버튼을 클릭하여 첫 번째 바코드 규칙을 추가하세요.
                      </p>
                    </div>
                  ) : (
                    selectedShipper.barcodeRules
                      .sort((a, b) => a.priority - b.priority)
                      .map((rule) => {
                        const template = templates.find(t => t.id === rule.templateId);
                        return (
                          <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium text-gray-900">
                                    우선순위 {rule.priority}
                                  </h4>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    rule.isActive 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {rule.isActive ? '활성' : '비활성'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  템플릿: {template?.name || '알 수 없음'}
                                </p>
                                <div className="text-sm text-gray-500">
                                  조건: {rule.conditions.map(c => c.description || `${c.field} ${c.operator} ${Array.isArray(c.value) ? c.value.join(', ') : c.value}`).join(', ')}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleRule(rule.id)}
                                  className={`px-3 py-1 text-xs rounded ${
                                    rule.isActive 
                                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {rule.isActive ? '비활성화' : '활성화'}
                                </button>
                                <button
                                  onClick={() => handleEditRule(rule)}
                                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  편집
                                </button>
                                <button
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    화주사를 선택해주세요
                  </h3>
                  <p className="text-gray-600 text-sm">
                    좌측에서 화주사를 선택하면 해당 화주사의 바코드 규칙을 관리할 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 규칙 추가/편집 모달 */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* 배경 오버레이 */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowRuleModal(false)}
            ></div>

            {/* 모달 컨텐츠 */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRule ? '바코드 규칙 편집' : '바코드 규칙 추가'}
                  </h2>
                  <button
                    onClick={() => setShowRuleModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <RuleEditForm
                  rule={editingRule}
                  shipper={selectedShipper}
                  templates={templates}
                  onSave={handleSaveRule}
                  onCancel={() => setShowRuleModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

// 규칙 편집 폼 컴포넌트
interface RuleEditFormProps {
  rule: BarcodeRule | null;
  shipper: Shipper | null;
  templates: BarcodeTemplate[];
  onSave: (ruleData: Partial<BarcodeRule>) => void;
  onCancel: () => void;
}

const RuleEditForm: React.FC<RuleEditFormProps> = ({
  rule,
  shipper,
  templates,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    templateId: rule?.templateId || '',
    priority: rule?.priority || 1,
    isActive: rule?.isActive !== undefined ? rule.isActive : true,
    conditions: rule?.conditions || []
  });

  const [newCondition, setNewCondition] = useState({
    field: 'productCategory',
    operator: 'equals' as const,
    value: '',
    description: ''
  });

  const handleAddCondition = () => {
    if (!newCondition.value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { ...newCondition, value: newCondition.value.split(',').map(v => v.trim()) }]
    }));
    
    setNewCondition({
      field: 'productCategory',
      operator: 'equals',
      value: '',
      description: ''
    });
  };

  const handleRemoveCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!formData.templateId) {
      alert('템플릿을 선택해주세요.');
      return;
    }
    
    if (formData.conditions.length === 0) {
      alert('최소 하나의 조건을 추가해주세요.');
      return;
    }

    onSave(formData);
  };

  const fieldOptions = [
    { value: 'productCategory', label: '상품 카테고리' },
    { value: 'productName', label: '상품명' },
    { value: 'productCode', label: '상품코드' },
    { value: 'representativeSellingPrice', label: '판매가' },
    { value: 'stock', label: '재고' }
  ];

  const operatorOptions = [
    { value: 'equals', label: '같음' },
    { value: 'contains', label: '포함' },
    { value: 'startsWith', label: '시작' },
    { value: 'endsWith', label: '끝남' },
    { value: 'in', label: '포함됨 (여러 값)' },
    { value: 'notIn', label: '포함 안됨 (여러 값)' }
  ];

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            화주사
          </label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-900">{shipper?.name}</span>
            <span className="text-sm text-gray-600 ml-2">({shipper?.code})</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            바코드 템플릿 *
          </label>
          <select
            value={formData.templateId}
            onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">템플릿을 선택하세요</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.format})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우선순위
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">활성화</span>
            </label>
          </div>
        </div>
      </div>

      {/* 조건 설정 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">적용 조건</h3>
        
        {/* 기존 조건 목록 */}
        {formData.conditions.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.conditions.map((condition, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">
                    {fieldOptions.find(f => f.value === condition.field)?.label}
                  </span>
                  <span className="text-gray-600 mx-2">
                    {operatorOptions.find(o => o.value === condition.operator)?.label}
                  </span>
                  <span className="text-gray-700">
                    {Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
                  </span>
                  {condition.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {condition.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveCondition(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 새 조건 추가 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">새 조건 추가</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">필드</label>
              <select
                value={newCondition.field}
                onChange={(e) => setNewCondition(prev => ({ ...prev, field: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {fieldOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">연산자</label>
              <select
                value={newCondition.operator}
                onChange={(e) => setNewCondition(prev => ({ ...prev, operator: e.target.value as any }))}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {operatorOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">값</label>
              <input
                type="text"
                value={newCondition.value}
                onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                placeholder="값을 입력하세요"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAddCondition}
                className="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                추가
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">설명 (선택사항)</label>
            <input
              type="text"
              value={newCondition.description}
              onChange={(e) => setNewCondition(prev => ({ ...prev, description: e.target.value }))}
              placeholder="조건에 대한 설명"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {rule ? '수정' : '추가'}
        </button>
      </div>
    </div>
  );
};

export default ShipperRulesPanel;
