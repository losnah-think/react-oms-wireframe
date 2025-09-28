import React from "react";
import { Container, Card, Button, Input } from "../../design-system";

type BarcodeTemplate = {
  id: string;
  name: string;
  value: string;
  barcodeType: string;
  scale: number;
  height: number;
  includetext: boolean;
  quantity: number;
};

const STORAGE_KEY = "barcode_templates_v1";

const defaultTemplates: BarcodeTemplate[] = [
  {
    id: "t-default",
    name: "기본 템플릿",
    value: "012345678901",
    barcodeType: "code128",
    scale: 3,
    height: 10,
    includetext: true,
    quantity: 1,
  },
  {
    id: "t-small",
    name: "작은 라벨",
    value: "ABC-0001",
    barcodeType: "code128",
    scale: 2,
    height: 8,
    includetext: false,
    quantity: 1,
  },
];

function loadTemplates(): BarcodeTemplate[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return defaultTemplates;
}

function saveTemplates(templates: BarcodeTemplate[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {}
}

export default function BarcodeSettingsPage() {
  const [templates, setTemplates] = React.useState<BarcodeTemplate[]>(() =>
    loadTemplates(),
  );
  const [newTemplateName, setNewTemplateName] = React.useState("");

  React.useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  const addTemplate = () => {
    if (!newTemplateName.trim()) return;
    const template: BarcodeTemplate = {
      id: `t-${Date.now()}`,
      name: newTemplateName.trim(),
      value: "",
      barcodeType: "code128",
      scale: 3,
      height: 10,
      includetext: true,
      quantity: 1,
    };
    setTemplates((prev) => [...prev, template]);
    setNewTemplateName("");
  };

  const removeTemplate = (id: string) => {
    if (!confirm("템플릿을 삭제하시겠습니까?")) return;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">바코드 템플릿 관리</h1>
            <p className="text-gray-600">
              바코드 템플릿을 추가 및 삭제합니다.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="템플릿명"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
            />
            <Button onClick={addTemplate}>추가</Button>
          </div>
        </div>

        <div className="space-y-3">
          {templates.length === 0 && (
            <div className="text-sm text-gray-500">
              등록된 템플릿이 없습니다.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500">
                    {template.barcodeType} • {template.value || "값 없음"}
                  </div>
                </div>
                <Button variant="ghost" onClick={() => removeTemplate(template.id)}>
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Container>
  );
}
