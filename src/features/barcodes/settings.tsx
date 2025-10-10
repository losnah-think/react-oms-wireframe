import React from "react";
import { Container, Button } from "../../design-system";
import { useBarcodeSettings, BarcodeTemplate } from "./useBarcodeSettings";
import TemplatesPanel from "./panels/TemplatesPanel";
import RulesPanel from "./panels/RulesPanel";
import CreateTemplateModal from "./modals/CreateTemplateModal";

const Tabs = ["Templates", "Rules"] as const;

const TAB_CONFIG = {
  Templates: { label: "템플릿", icon: null },
  Rules: { label: "자동정리", icon: null }
};

const BarcodeSettingsPage: React.FC = () => {
  const [active, setActive] = React.useState<typeof Tabs[number]>("Templates");
  const api = useBarcodeSettings();

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
            onDuplicate={api.duplicateTemplate}
            onRemove={api.removeTemplate}
            onSetDefault={api.handleSetDefaultTemplate}
            onCreate={() => api.setCreateModalOpen(true)}
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

      {/* 템플릿 생성 모달 */}
      {api.isCreateModalOpen && (
        <CreateTemplateModal
          onClose={() => api.setCreateModalOpen(false)}
          onCreate={api.createTemplate}
        />
      )}
    </div>
  );
};

export default BarcodeSettingsPage;