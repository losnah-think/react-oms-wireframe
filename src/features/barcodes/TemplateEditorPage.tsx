import React from "react";
import { useRouter } from "next/router";
import { useBarcodeSettings } from "./useBarcodeSettings";
import EditorPanel from "./panels/EditorPanel";

const BarcodeTemplateEditorPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const api = useBarcodeSettings();
  const previewRef = React.useRef<HTMLDivElement | null>(null);

  // URL의 id와 선택된 템플릿 동기화
  React.useEffect(() => {
    if (id && typeof id === 'string' && id !== api.selectedTemplateId) {
      api.setSelectedTemplateId(id);
    }
  }, [id, api.selectedTemplateId, api.setSelectedTemplateId]);

  const handleBack = () => {
    router.push('/barcodes/settings');
  };

  if (!api.selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">템플릿을 찾을 수 없습니다.</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">뒤로가기</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">템플릿 편집</h1>
              <p className="text-sm text-gray-600 mt-1">{api.selectedTemplate.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <EditorPanel
          template={api.selectedTemplate}
          elements={api.elements}
          selectedElementId={api.selectedElementId}
          onUpdateField={api.updateTemplateField}
          onDuplicate={api.duplicateTemplate}
          onSetDefault={api.handleSetDefaultTemplate}
          mmToPreviewPx={api.mmToPreviewPx}
          clamp={api.clamp}
          previewRef={previewRef}
          onAddElement={api.addElementToTemplate}
          onMoveElement={api.moveElement}
          onRemoveElement={api.removeElement}
          onUpdateElementField={api.updateElementField}
          componentPalette={[
            { type: "text", label: "상품명", hint: "상품 이름" },
            { type: "sku", label: "상품코드", hint: "SKU" },
            { type: "price", label: "가격", hint: "판매가" },
            { type: "barcode", label: "바코드", hint: "1D 바코드" },
            { type: "qr", label: "QR", hint: "QR 코드" },
            { type: "custom", label: "텍스트", hint: "자유 입력" },
          ]}
          selectedElement={api.selectedElement}
          onOpenCreate={() => api.setCreateModalOpen(true)}
        />
      </div>
    </div>
  );
};

export default BarcodeTemplateEditorPage;

