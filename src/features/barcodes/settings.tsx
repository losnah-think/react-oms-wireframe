import React from "react";
import { Container, Button, Stack } from "../../design-system";
import { useBarcodeSettings } from "./useBarcodeSettings";
import TemplatesPanel from "./panels/TemplatesPanel";
import EditorPanel from "./panels/EditorPanel";
import QueuePanel from "./panels/QueuePanel";
import RulesPanel from "./panels/RulesPanel";

const TEMPLATE_STORAGE_KEY = "barcode_templates_v2";
const QUEUE_STORAGE_KEY = "barcode_print_queue_v1";
const RULE_STORAGE_KEY = "barcode_cleanup_rules_v1";
const ELEMENT_STORAGE_KEY = "barcode_template_elements_v1";

type BarcodeTemplate = {
  id: string;
  name: string;
  paperType: string;
  description: string;
  columns: number;
  rows: number;
  labelWidth: number;
  labelHeight: number;
  fontSize: number;
  marginTop: number;
  marginLeft: number;
  gap: number;
  autoCut: boolean;
  isDefault: boolean;
  updatedAt: string;
};

const defaultTemplates: BarcodeTemplate[] = [
  {
    id: "tpl-basic",
    name: "기본 5x3",
    paperType: "전용 라벨지",
    description: "출고용 표준 템플릿",
    columns: 3,
    rows: 5,
    labelWidth: 50,
    labelHeight: 30,
    fontSize: 12,
    marginTop: 2,
    marginLeft: 2,
    gap: 1,
    autoCut: false,
    isDefault: true,
    updatedAt: "2024-04-18",
  },
  {
    id: "tpl-premium",
    name: "프리미엄 QR",
    paperType: "QR 전용지",
    description: "QR 코드와 텍스트 병행 출력",
    columns: 2,
    rows: 4,
    labelWidth: 60,
    labelHeight: 40,
    fontSize: 14,
    marginTop: 3,
    marginLeft: 3,
    gap: 2,
    autoCut: true,
    isDefault: false,
    updatedAt: "2024-04-10",
  },
  {
    id: "tpl-mini",
    name: "미니 라벨",
    paperType: "소형 라벨",
    description: "악세서리, 소형 상품용",
    columns: 4,
    rows: 6,
    labelWidth: 35,
    labelHeight: 20,
    fontSize: 10,
    marginTop: 1,
    marginLeft: 1,
    gap: 0.5,
    autoCut: false,
    isDefault: false,
    updatedAt: "2024-03-30",
  },
];

type QueueItem = {
  id: string;
  productName: string;
  sanitizedName: string;
  sku: string;
  quantity: number;
  templateId: string;
  status: "대기" | "인쇄중" | "인쇄완료";
  createdAt: string;
};

const defaultQueue: QueueItem[] = [
  {
    id: "queue-1",
    productName: "[샘플] 프리미엄 원두 200g",
    sanitizedName: "프리미엄 원두 200g",
    sku: "PRD-WDN-200",
    quantity: 12,
    templateId: "tpl-basic",
    status: "대기",
    createdAt: "2024-04-20 09:10",
  },
  {
    id: "queue-2",
    productName: "노트북 파우치 (무료배송)",
    sanitizedName: "노트북 파우치",
    sku: "BAG-POUCH",
    quantity: 5,
    templateId: "tpl-mini",
    status: "대기",
    createdAt: "2024-04-20 09:15",
  },
  {
    id: "queue-3",
    productName: "QR 스티커 - 행사 전용",
    sanitizedName: "QR 스티커 - 행사 전용",
    sku: "QR-2024",
    quantity: 30,
    templateId: "tpl-premium",
    status: "인쇄완료",
    createdAt: "2024-04-19 17:42",
  },
];

type CleanupRule = {
  id: string;
  keyword: string;
  description: string;
  enabled: boolean;
};

const defaultRules: CleanupRule[] = [
  { id: "rule-1", keyword: "[샘플]", description: "샘플 표기를 제거", enabled: true },
  {
    id: "rule-2",
    keyword: "(무료배송)",
    description: "무료배송 문구 제거",
    enabled: true,
  },
  {
    id: "rule-3",
    keyword: "행사 전용",
    description: "행사 라벨 문구 유지",
    enabled: false,
  },
];

type CatalogItem = {
  id: string;
  productName: string;
  sku: string;
  templateId: string;
};

const catalog: CatalogItem[] = [
  {
    id: "catalog-1",
    productName: "[샘플] 에센셜 티셔츠 L",
    sku: "TSHIRT-L-BLACK",
    templateId: "tpl-basic",
  },
  {
    id: "catalog-2",
    productName: "USB 허브 4포트 (무료배송)",
    sku: "USB-HUB-4",
    templateId: "tpl-premium",
  },
  {
    id: "catalog-3",
    productName: "가죽 카드지갑 - 카멜",
    sku: "CARD-WALLET-CAMEL",
    templateId: "tpl-mini",
  },
  {
    id: "catalog-4",
    productName: "친환경 물티슈 20매",
    sku: "WET-TISSUE-20",
    templateId: "tpl-basic",
  },
];

type TemplateFormState = {
  name: string;
  paperType: string;
  description: string;
  columns: number;
  rows: number;
  labelWidth: number;
  labelHeight: number;
  fontSize: number;
  marginTop: number;
  marginLeft: number;
  gap: number;
  autoCut: boolean;
};

type CustomElementType = "text" | "sku" | "price" | "barcode" | "qr" | "custom";

type CustomElement = {
  id: string;
  type: CustomElementType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  bold: boolean;
};

type TemplateElementsMap = Record<string, CustomElement[]>;

const emptyTemplateForm: TemplateFormState = {
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
};

const componentPalette: { type: CustomElementType; label: string; hint: string }[] = [
  { type: "text", label: "상품명", hint: "예: 데모 상품명" },
  { type: "sku", label: "SKU", hint: "예: SKU-001" },
  { type: "price", label: "가격", hint: "예: 15,000원" },
  { type: "barcode", label: "바코드", hint: "EAN-13 바코드" },
  { type: "qr", label: "QR 코드", hint: "URL 또는 주문연동" },
  { type: "custom", label: "커스텀 텍스트", hint: "메모/주의사항" },
];

const paperTypeOptions = [
  { value: "전용 라벨지", label: "전용 라벨지" },
  { value: "일반 라벨지", label: "일반 라벨지" },
  { value: "QR 전용지", label: "QR 전용지" },
  { value: "택배 송장", label: "택배 송장" },
];

const labelSizePresets = [
  { value: "35x20", label: "35 × 20 mm" },
  { value: "50x30", label: "50 × 30 mm" },
  { value: "60x40", label: "60 × 40 mm" },
  { value: "80x50", label: "80 × 50 mm" },
];

const mmToPreviewPx = (mm: number) => Math.max(20, mm * 4);
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) || typeof parsed === "object" ? (parsed as T) : fallback;
  } catch (err) {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // ignore
  }
};

const Tabs = ["Templates", "Editor", "Queue", "Rules"] as const;

const BarcodeSettingsPage: React.FC = () => {
  const [active, setActive] = React.useState<typeof Tabs[number]>("Templates");
  const api = useBarcodeSettings();
  const previewRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <Container maxWidth="7xl" className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">바코드 환경 설정</h1>
          <p className="mt-1 text-sm text-gray-600">페이지를 탭으로 분리해 가볍게 편집할 수 있습니다.</p>
        </div>
        <Stack direction="row" gap={3}>
          <Button onClick={() => setActive("Templates")}>템플릿</Button>
          <Button onClick={() => setActive("Editor")}>편집기</Button>
          <Button onClick={() => setActive("Queue")}>대기열</Button>
          <Button onClick={() => setActive("Rules")}>문자열 규칙</Button>
        </Stack>
      </div>

      <div>
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
              { type: "text", label: "상품명", hint: "예: 데모 상품명" },
              { type: "sku", label: "SKU", hint: "예: SKU-001" },
              { type: "price", label: "가격", hint: "예: 15,000원" },
              { type: "barcode", label: "바코드", hint: "EAN-13 바코드" },
              { type: "qr", label: "QR 코드", hint: "URL 또는 주문연동" },
              { type: "custom", label: "커스텀 텍스트", hint: "메모/주의사항" },
            ]}
            selectedElement={api.selectedElement}
            onOpenCreate={() => api.setCreateModalOpen(true)}
          />
        )}

        {active === "Queue" && (
          <QueuePanel
            queue={api.queue}
            selectedQueueIds={api.selectedQueueIds}
            setSelectedQueueIds={api.setSelectedQueueIds}
            removeQueueItems={api.removeQueueItems}
            clearQueue={api.clearQueue}
            updateQueueStatus={api.updateQueueStatus}
          />
        )}

        {active === "Rules" && (
          <RulesPanel rules={api.rules} toggleRule={api.toggleRule} addRule={api.addRule} />
        )}
      </div>
    </Container>
  );
};

export default BarcodeSettingsPage;
