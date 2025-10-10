import React, { useState } from "react";
import { BarcodeTemplate } from "../useBarcodeSettings";

interface CreateTemplateModalProps {
  onClose: () => void;
  onCreate: (templateForm: Partial<BarcodeTemplate> & { name: string }) => void;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    paperType: "전용 라벨지",
    description: "",
    columns: 3,
    rows: 5,
    labelWidth: 50,
    labelHeight: 30,
    fontSize: 12,
    marginTop: 2,
    marginLeft: 2,
    gap: 1,
    autoCut: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">새 템플릿 만들기</h3>
              <p className="text-sm text-gray-600 mt-1">바코드 라벨 템플릿을 생성합니다.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 모달 바디 */}
          <div className="p-6 space-y-6">
            {/* 기본 정보 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">기본 정보</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    템플릿 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 소형 제품 라벨"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    용지 타입
                  </label>
                  <select
                    value={formData.paperType}
                    onChange={(e) => handleChange('paperType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="전용 라벨지">전용 라벨지</option>
                    <option value="A4 용지">A4 용지</option>
                    <option value="롤 라벨">롤 라벨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    설명 (선택)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="템플릿에 대한 간단한 설명"
                  />
                </div>
              </div>
            </div>

            {/* 레이아웃 설정 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">레이아웃 설정</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    열 (columns)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.columns}
                    onChange={(e) => handleChange('columns', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    행 (rows)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.rows}
                    onChange={(e) => handleChange('rows', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 라벨 크기 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">라벨 크기 (mm)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    너비 (width)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={formData.labelWidth}
                    onChange={(e) => handleChange('labelWidth', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    높이 (height)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={formData.labelHeight}
                    onChange={(e) => handleChange('labelHeight', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 여백 설정 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">여백 설정 (mm)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    상단 (top)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={formData.marginTop}
                    onChange={(e) => handleChange('marginTop', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    좌측 (left)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={formData.marginLeft}
                    onChange={(e) => handleChange('marginLeft', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    라벨 간격 (gap)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={formData.gap}
                    onChange={(e) => handleChange('gap', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 기타 설정 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">기타 설정</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    글꼴 크기 (pt)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="72"
                    value={formData.fontSize}
                    onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoCut"
                    checked={formData.autoCut}
                    onChange={(e) => handleChange('autoCut', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoCut" className="ml-2 text-sm text-gray-700">
                    자동 재단 활성화
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 모달 푸터 */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              템플릿 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplateModal;

