import React from "react";
import { Container, Button } from "../../design-system";
import { useBarcodeSettings } from "./useBarcodeSettings";
import TemplatesPanel from "./panels/TemplatesPanel";
import EditorPanel from "./panels/EditorPanel";
import RulesPanel from "./panels/RulesPanel";

const Tabs = ["Templates", "Editor", "Rules"] as const;

const TAB_CONFIG = {
  Templates: { label: "템플릿", icon: null },
  Editor: { label: "편집", icon: null },
  Rules: { label: "자동정리", icon: null }
};

const BarcodeSettingsPage: React.FC = () => {
  const [active, setActive] = React.useState<typeof Tabs[number]>("Templates");
  const api = useBarcodeSettings();
  const previewRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 극단적으로 단순한 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">바코드 설정</h1>
        </div>
      </div>

      {/* 극단적으로 큰 탭 버튼 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 py-4">
            {Tabs.map((tab) => {
              const config = TAB_CONFIG[tab];
              const isActive = active === tab;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  className={`flex-1 py-3 px-4 text-center rounded-md font-medium text-sm transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div>{config.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {active === "Templates" && (
          <TemplatesPanel
            templates={api.templates}
            selectedTemplateId={api.selectedTemplateId}
            onSelect={api.handleTemplateSelect}
            onDuplicate={api.duplicateTemplate}
            onRemove={api.removeTemplate}
            onSetDefault={api.handleSetDefaultTemplate}
            onCreate={() => api.setCreateModalOpen(true)}
          />
        )}

        {active === "Editor" && (
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
        )}

        {active === "Rules" && (
          <RulesPanel 
            rules={api.rules} 
            toggleRule={api.toggleRule} 
            addRule={api.addRule} 
          />
        )}
      </div>
    </div>
  );
};

export default BarcodeSettingsPage;