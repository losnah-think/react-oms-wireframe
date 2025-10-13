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
  const [selectedFields, setSelectedFields] = React.useState<Record<string, string>>({});

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
    <div className="space-y-6">
      {template ? (
        <>
          {/* 1. 템플릿 편집 섹션 */}
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                01
              </div>
              <h2 className="text-lg font-bold text-gray-900">템플릿 편집</h2>
            </div>
            <Input
              label="템플릿 이름"
              value={template.name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("name", event.target.value)}
              fullWidth
              placeholder="템플릿 이름을 입력하세요"
            />
          </Card>

          {/* 사용 가이드 경고 */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                !
              </div>
              <div className="flex-1 space-y-2 text-sm text-gray-700">
                <p className="font-semibold text-red-700">템플릿 사용 가이드</p>
                <ul className="list-disc space-y-1 pl-5 text-xs">
                  <li>사전에 지정된 필드는 아래 표시할 입력값 외에 추가 데이터가 입력 불가합니다.</li>
                  <li>이미지 / 기호 스팩에는 파일명만 참조가 입력으로 적용 됩니다.</li>
                  <li>단/복합 모두 최소 2.5mm 이상 가능합니다.</li>
                  <li>단/복합 모두 최대 개수는 없이 원하는 크기 만큼 가능합니다.</li>
                  <li>단/복합 각 기능은 인쇄 전에만 변경 가능 합니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. 바코드 레이아웃 섹션 */}
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                02
              </div>
              <h2 className="text-lg font-bold text-gray-900">바코드 레이아웃</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* 왼쪽: 캔버스 */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600">사용 가능한 모듈을 클릭하세요. 배치하신 후 나오는 모듈은 버튼을 눌러서 캔버스에 그리거나 추가할 수 있습니다.</p>
                <div
                  ref={previewRef}
                  className="relative mx-auto flex items-center justify-center overflow-hidden rounded-lg border-2 border-gray-300 bg-white"
                  style={{
                    width: mmToPreviewPx(template.labelWidth),
                    height: mmToPreviewPx(template.labelHeight),
                    minWidth: '300px',
                    minHeight: '200px',
                  }}
                  onDragOver={handlePreviewDragOver}
                  onDrop={handlePreviewDrop}
                >
                  {elements.length === 0 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-400">사용 가능한 모듈</p>
                      <p className="text-xs text-gray-400">드래그 또는 클릭하여 배치</p>
                    </div>
                  )}
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      draggable
                      onDragStart={(event: React.DragEvent<HTMLDivElement>) => handleElementDragStart(event, element)}
                      onClick={() => onUpdateElementField(element.id, "selected", true)}
                      className={`absolute cursor-move rounded border px-2 py-1 text-xs shadow-sm ${
                        selectedElementId === element.id ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
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

              {/* 오른쪽: 필드 선택 테이블 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">모듈 선택</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">17</span>
                    <span className="text-xs text-gray-400">사용 가능 모듈 오소</span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-200">
                      {/* 바코드 섹션 */}
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 font-semibold text-gray-700" colSpan={3}>Code 39 바코드</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "추가 모듈" },
                              { value: "code39", label: "Code 39" },
                            ]}
                            value={selectedFields['code39'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, code39: v})}
                            fullWidth
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "추가 모듈" },
                              { value: "code93", label: "Code 93" },
                            ]}
                            value={selectedFields['code93'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, code93: v})}
                            fullWidth
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "추가 모듈" },
                              { value: "code128", label: "Code 128" },
                            ]}
                            value={selectedFields['code128'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, code128: v})}
                            fullWidth
                          />
                        </td>
                      </tr>

                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 font-semibold text-gray-700" colSpan={3}>code 128 바코드 RAW</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "추가 모듈" },
                              { value: "ean13", label: "EAN 13" },
                            ]}
                            value={selectedFields['ean13'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, ean13: v})}
                            fullWidth
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "EAN 13 바코드" },
                              { value: "ean13-alt", label: "EAN 13" },
                            ]}
                            value={selectedFields['ean13-alt'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, 'ean13-alt': v})}
                            fullWidth
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "OR코드" },
                              { value: "qr", label: "QR" },
                            ]}
                            value={selectedFields['qr'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, qr: v})}
                            fullWidth
                          />
                        </td>
                      </tr>

                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 font-semibold text-gray-700" colSpan={3}>상품명</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "상품명" },
                              { value: "productName", label: "상품명" },
                            ]}
                            value={selectedFields['productName'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, productName: v})}
                            fullWidth
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "사업장명" },
                              { value: "businessName", label: "사업장명" },
                            ]}
                            value={selectedFields['businessName'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, businessName: v})}
                            fullWidth
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "판매가" },
                              { value: "price", label: "판매가" },
                            ]}
                            value={selectedFields['price'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, price: v})}
                            fullWidth
                          />
                        </td>
                      </tr>

                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 font-semibold text-gray-700" colSpan={3}>추가 필드 부분</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "가격" },
                              { value: "priceField", label: "가격" },
                            ]}
                            value={selectedFields['priceField'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, priceField: v})}
                            fullWidth
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "바코드" },
                              { value: "barcodeField", label: "바코드" },
                            ]}
                            value={selectedFields['barcodeField'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, barcodeField: v})}
                            fullWidth
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "바코드" },
                              { value: "barcodeField2", label: "바코드" },
                            ]}
                            value={selectedFields['barcodeField2'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, barcodeField2: v})}
                            fullWidth
                          />
                        </td>
                      </tr>

                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 font-semibold text-gray-700" colSpan={3}>바코드</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "바코드" },
                              { value: "barcode1", label: "바코드" },
                            ]}
                            value={selectedFields['barcode1'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, barcode1: v})}
                            fullWidth
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "OR" },
                              { value: "or1", label: "OR" },
                            ]}
                            value={selectedFields['or1'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, or1: v})}
                            fullWidth
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Dropdown
                            options={[
                              { value: "", label: "OR" },
                              { value: "or2", label: "OR" },
                            ]}
                            value={selectedFields['or2'] || ''}
                            onChange={(v) => setSelectedFields({...selectedFields, or2: v})}
                            fullWidth
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>

          {/* 3. 템플릿 이름 섹션 (하단 설정) */}
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                03
              </div>
              <h2 className="text-lg font-bold text-gray-900">템플릿 이름</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">템플릿을 저장합니다.</p>

              {/* 인쇄 옵션 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">인쇄 옵션</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">라벨 크기 (mm)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={template.labelWidth}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("labelWidth", Number(event.target.value) || 10)}
                        fullWidth
                        placeholder="50"
                      />
                      <span className="text-gray-400">×</span>
                      <Input
                        type="number"
                        value={template.labelHeight}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("labelHeight", Number(event.target.value) || 10)}
                        fullWidth
                        placeholder="30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">여백 세로 (mm)</label>
                    <Input
                      type="number"
                      value={template.marginTop}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("marginTop", Number(event.target.value) || 0)}
                      fullWidth
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">상/하 여백 (mm)</label>
                    <Input
                      type="number"
                      value={template.marginTop}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("marginTop", Number(event.target.value) || 0)}
                      fullWidth
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">좌/우 여백 (mm)</label>
                    <Input
                      type="number"
                      value={template.marginLeft}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("marginLeft", Number(event.target.value) || 0)}
                      fullWidth
                      placeholder="2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">라벨 간격 (mm)</label>
                    <Input
                      type="number"
                      value={template.gap}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("gap", Number(event.target.value) || 0)}
                      fullWidth
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">폰트 크기 (pt)</label>
                    <Input
                      type="number"
                      value={template.fontSize}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => onUpdateField("fontSize", Number(event.target.value) || 8)}
                      fullWidth
                      placeholder="12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">바코드</label>
                    <Input
                      type="text"
                      value=""
                      onChange={() => {}}
                      fullWidth
                      placeholder="사용자 지정 템플릿명"
                    />
                  </div>
                </div>
              </div>

              {/* 하단 버튼 */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => window.history.back()}>
                  다음으로
                </Button>
                <Button onClick={() => alert('저장되었습니다!')}>
                  저장
                </Button>
              </div>
            </div>
          </Card>

          {/* 선택한 요소 속성 (우측 고정 패널 - 옵션) */}
          {selectedElement && (
            <Card padding="md" className="fixed right-6 top-24 w-80 space-y-3 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-800">선택한 요소 속성</h3>
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
                      볼드
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
            </Card>
          )}
        </>
      ) : (
        <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          템플릿을 선택하면 상세 설정을 편집할 수 있습니다.
        </div>
      )}
    </div>
  );
};

export default EditorPanel;
