import React from "react";
import { Card, Input, Dropdown, Stack, Button, Badge, Modal } from "../../../design-system";
import type { BarcodeTemplate, CustomElement, CustomElementType } from "../useBarcodeSettings";

type Props = {
  template: BarcodeTemplate | null;
  elements: CustomElement[];
  selectedElementId: string | null;
  onUpdateField: <K extends keyof BarcodeTemplate>(key: K, value: BarcodeTemplate[K]) => void;
  onDuplicate: (id: string) => void;
  onSetDefault: (id: string) => void;
  mmToPreviewPx: (mm: number) => number;
  clamp: (v: number, a: number, b: number) => number;
  previewRef: React.RefObject<HTMLDivElement>;
  onAddElement: (payload: { type: CustomElementType; x: number; y: number }) => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onRemoveElement: (id: string) => void;
  onUpdateElementField: (id: string, key: any, value: any) => void;
  componentPalette: { type: CustomElementType; label: string; hint: string }[];
  selectedElement: CustomElement | null;
  onOpenCreate: () => void;
};

const labelSizePresets = [
  { value: "35x20", label: "35 × 20 mm" },
  { value: "50x30", label: "50 × 30 mm" },
  { value: "60x40", label: "60 × 40 mm" },
  { value: "80x50", label: "80 × 50 mm" },
];

const EditorPanel: React.FC<Props> = ({
  template,
  elements,
  selectedElementId,
  onUpdateField,
  onDuplicate,
  onSetDefault,
  mmToPreviewPx,
  clamp,
  previewRef,
  onAddElement,
  onMoveElement,
  onRemoveElement,
  onUpdateElementField,
  componentPalette,
  selectedElement,
  onOpenCreate,
}) => {
  const handlePreviewDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();

  const parseDragPayload = (event: React.DragEvent<HTMLDivElement>) => {
    try {
      const raw = event.dataTransfer.getData("application/json");
      if (!raw) return null;
      return JSON.parse(raw) as
        | { kind: "palette"; elementType: CustomElementType }
        | { kind: "element"; elementId: string; offsetX: number; offsetY: number };
    } catch (err) {
      return null;
    }
  };

  const handlePreviewDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!template) return;
    const payload = parseDragPayload(event);
    if (!payload) return;

    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleWidth = mmToPreviewPx(template.labelWidth);
    const scaleHeight = mmToPreviewPx(template.labelHeight);

    if (payload.kind === "palette") {
      const x = clamp(event.clientX - rect.left - 30, 0, scaleWidth - 60);
      const y = clamp(event.clientY - rect.top - 12, 0, scaleHeight - 30);
      onAddElement({ type: payload.elementType, x, y });
      return;
    }

    if (payload.kind === "element") {
      const x = clamp(event.clientX - rect.left - payload.offsetX, 0, scaleWidth - 20);
      const y = clamp(event.clientY - rect.top - payload.offsetY, 0, scaleHeight - 20);
      onMoveElement(payload.elementId, x, y);
    }
  };

  const handlePaletteDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    elementType: CustomElementType,
  ) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/json", JSON.stringify({ kind: "palette", elementType }));
  };

  const handleElementDragStart = (event: React.DragEvent<HTMLDivElement>, element: CustomElement) => {
    event.dataTransfer.effectAllowed = "move";
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offsetX = event.clientX - (rect.left + element.x);
    const offsetY = event.clientY - (rect.top + element.y);
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ kind: "element", elementId: element.id, offsetX, offsetY }),
    );
  };

  const renderElementPreview = (element: CustomElement) => {
    if (element.type === "barcode") {
      return (
        <div className="h-full w-full overflow-hidden rounded bg-white">
          <div className="h-full w-full bg-[repeating-linear-gradient(90deg,#fff,#fff_2px,#000,#000_4px)]" />
        </div>
      );
    }
    if (element.type === "qr") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gray-900 text-[8px] font-semibold text-white">
          QR
        </div>
      );
    }
    return (
      <span className={element.bold ? "font-semibold" : ""} style={{ fontSize: element.fontSize }}>
        {element.label}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {template ? (
        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)]">
          <div className="space-y-5">
            <Input
              label="템플릿 이름"
              value={template.name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("name", event.target.value)}
              fullWidth
            />
            <Dropdown
              label="라벨지 종류"
              options={[{ value: template.paperType, label: template.paperType }]}
              value={template.paperType}
              onChange={(value: any) => onUpdateField("paperType", value)}
              fullWidth
            />
            <Input
              label="설명"
              value={template.description}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("description", event.target.value)}
              fullWidth
            />
            <Stack direction="row" gap={4}>
              <Input
                type="number"
                label="가로 라벨 개수"
                value={template.columns}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("columns", Number(event.target.value) || 1)}
                fullWidth
              />
              <Input
                type="number"
                label="세로 라벨 개수"
                value={template.rows}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("rows", Number(event.target.value) || 1)}
                fullWidth
              />
              <Input
                type="number"
                label="세로 라벨 개수"
                value={template.rows}
                onChange={(event) => onUpdateField("rows", Number(event.target.value) || 1)}
                fullWidth
              />
            </Stack>
              <Dropdown
              label="라벨 크기 프리셋"
              options={labelSizePresets}
              placeholder="프리셋 선택"
              onChange={(value) => {
                const [w, h] = value.split("x");
                onUpdateField("labelWidth", Number(w));
                onUpdateField("labelHeight", Number(h));
              }}
              fullWidth
            />

            <Stack direction="row" gap={4}>
              <Input
                type="number"
                label="라벨 가로 (mm)"
                value={template.labelWidth}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("labelWidth", Number(event.target.value) || 10)}
                fullWidth
              />
              <Input
                type="number"
                label="라벨 세로 (mm)"
                value={template.labelHeight}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("labelHeight", Number(event.target.value) || 10)}
                fullWidth
              />
            </Stack>

            <Stack direction="row" gap={4}>
              <Input
                type="number"
                label="상단 여백 (mm)"
                value={template.marginTop}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("marginTop", Number(event.target.value) || 0)}
                fullWidth
              />
              <Input
                type="number"
                label="좌측 여백 (mm)"
                value={template.marginLeft}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("marginLeft", Number(event.target.value) || 0)}
                fullWidth
              />
            </Stack>
            <Stack direction="row" gap={4}>
              <Input
                type="number"
                label="라벨 간격 (mm)"
                value={template.gap}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("gap", Number(event.target.value) || 0)}
                fullWidth
              />
              <Input
                type="number"
                label="폰트 크기 (pt)"
                value={template.fontSize}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("fontSize", Number(event.target.value) || 8)}
                fullWidth
              />
            </Stack>
            <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={template.autoCut}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("autoCut", event.target.checked)}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">출력 후 자동 커팅</span>
                <p className="text-xs text-gray-500">라벨기가 자동 컷팅하도록 신호를 전송합니다.</p>
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <Card padding="md" className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">드래그 앤 드롭 미리보기</h3>
                <p className="mt-1 text-xs text-gray-500">좌측 요소를 드래그해서 배치하고, 요소를 다시 드래그하여 위치를 조정할 수 있습니다.</p>
              </div>
              <div className="overflow-auto">
                <div
                  ref={previewRef}
                  className="relative mx-auto flex min-h-[160px] min-w-[160px] items-center justify-center overflow-hidden rounded border border-dashed border-gray-300 bg-white"
                  style={{
                    width: mmToPreviewPx(template.labelWidth),
                    height: mmToPreviewPx(template.labelHeight),
                  }}
                  onDragOver={handlePreviewDragOver}
                  onDrop={handlePreviewDrop}
                >
                  {elements.length === 0 && (
                    <span className="px-3 text-center text-xs text-gray-400">팔레트에서 요소를 끌어다 놓으세요.</span>
                  )}
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      draggable
                      onDragStart={(event: React.DragEvent<HTMLDivElement>) => handleElementDragStart(event, element)}
                      onClick={() => onUpdateElementField(element.id, "selected", true)}
                      className={`absolute cursor-move rounded border px-2 py-1 text-xs shadow-sm ${
                        selectedElementId === element.id ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white"
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {renderElementPreview(element)}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card padding="md" className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">사용 가능한 요소</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {componentPalette.map((component) => (
                  <div
                    key={component.type}
                    draggable
                    onDragStart={(event: React.DragEvent<HTMLDivElement>) => handlePaletteDragStart(event, component.type)}
                    className="cursor-grab rounded-md border border-gray-200 px-3 py-3 shadow-sm transition hover:border-primary-300 hover:bg-primary-50"
                  >
                    <p className="text-sm font-semibold text-gray-800">{component.label}</p>
                    <p className="text-xs text-gray-500">{component.hint}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="md" className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">선택한 요소 속성</h3>
              {selectedElement ? (
                <div className="space-y-3">
                  <Input
                    label="라벨"
                    value={selectedElement.label}
                    onChange={(event) => onUpdateElementField(selectedElement.id, "label", event.target.value)}
                    fullWidth
                  />
                  {selectedElement.type !== "barcode" && selectedElement.type !== "qr" && (
                    <Stack direction="row" gap={3}>
                      <Input
                        type="number"
                        label="폰트 크기"
                        value={selectedElement.fontSize}
                        onChange={(event) => onUpdateElementField(selectedElement.id, "fontSize", Number(event.target.value) || 8)}
                        fullWidth
                      />
                      <label className="mt-6 flex items-center gap-2 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedElement.bold}
                          onChange={(event) => onUpdateElementField(selectedElement.id, "bold", event.target.checked)}
                        />
                        볼드 처리
                      </label>
                    </Stack>
                  )}
                  <Stack direction="row" gap={3}>
                    <Input
                      type="number"
                      label="너비"
                      value={selectedElement.width}
                      onChange={(event) => onUpdateElementField(selectedElement.id, "width", Number(event.target.value) || selectedElement.width)}
                      fullWidth
                    />
                    <Input
                      type="number"
                      label="높이"
                      value={selectedElement.height}
                      onChange={(event) => onUpdateElementField(selectedElement.id, "height", Number(event.target.value) || selectedElement.height)}
                      fullWidth
                    />
                  </Stack>
                  <Button variant="outline" size="small" onClick={() => onRemoveElement(selectedElement.id)}>
                    요소 삭제
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-gray-500">미리보기에서 요소를 선택하면 설정을 수정할 수 있습니다.</p>
              )}
            </Card>

            <Card padding="md" className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">템플릿 사용 가이드</h3>
              <ul className="list-disc space-y-1 pl-5 text-xs text-gray-500">
                <li>라벨 간격과 여백은 실제 장비 기준으로 1~2mm 여유를 두는 것이 안전합니다.</li>
                <li>문자열 제거 규칙은 인쇄 직전에 자동으로 적용됩니다.</li>
                <li>요소를 더블 클릭하거나 속성에서 삭제할 수 있습니다.</li>
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">템플릿을 선택하면 상세 설정을 편집할 수 있습니다.</div>
      )}
    </div>
  );
};

export default EditorPanel;
