import React from "react";
import { useRouter } from "next/router";
import { Button, Badge } from "../../../design-system";
import type { BarcodeTemplate } from "../useBarcodeSettings";

type Props = {
  templates: BarcodeTemplate[];
  selectedTemplateId: string;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onSetDefault: (id: string) => void;
  onCreate: () => void;
};

const TemplatesPanel: React.FC<Props> = ({
  templates,
  selectedTemplateId,
  onDuplicate,
  onRemove,
  onSetDefault,
  onCreate,
}) => {
  const router = useRouter();

  const handleTemplateClick = (templateId: string) => {
    router.push(`/barcodes/template/${templateId}`);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">인쇄 템플릿 목록</h2>
          <p className="text-sm text-gray-500">템플릿을 클릭하여 편집하세요.</p>
        </div>
        <Button size="small" onClick={onCreate}>
          템플릿 만들기
        </Button>
      </div>

      <div className="space-y-2">
        {templates.map((template) => {
          const isSelected = template.id === selectedTemplateId;
          return (
            <button
              type="button"
              key={template.id}
              onClick={() => handleTemplateClick(template.id)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-primary-400 bg-primary-50"
                  : "border-gray-200 hover:border-primary-200 hover:bg-primary-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-gray-900">{template.name}</span>
                    {template.isDefault && (
                      <Badge size="small" variant="primary">
                        기본
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {template.labelWidth} × {template.labelHeight} mm · {template.paperType}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                      <Button
                        size="small"
                        variant="ghost"
                        onClick={(event: React.MouseEvent) => {
                          event.stopPropagation();
                          onDuplicate(template.id);
                        }}
                      >
                    복제
                  </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        onClick={(event: React.MouseEvent) => {
                          event.stopPropagation();
                          onRemove(template.id);
                        }}
                      >
                    삭제
                  </Button>
                      {!template.isDefault && (
                        <Button
                          size="small"
                          variant="outline"
                          onClick={(event: React.MouseEvent) => {
                            event.stopPropagation();
                            onSetDefault(template.id);
                          }}
                        >
                          기본 지정
                        </Button>
                      )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatesPanel;
