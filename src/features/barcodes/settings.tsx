import React from "react";
import {
  Container,
  Card,
  Button,
  Input,
  Dropdown,
  Modal,
  Stack,
  Badge,
  Table,
  type TableColumn,
} from "../../design-system";

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

const sanitizeProductName = (name: string, rules: CleanupRule[]) =>
  rules
    .filter((rule) => rule.enabled && rule.keyword)
  .reduce((acc, rule) => acc.split(rule.keyword).join("").trim(), name)
    .replace(/\s{2,}/g, " ");

const StatusToast: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-md border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-700">
    {message}
  </div>
);

const BarcodeSettingsPage: React.FC = () => {
  const [templates, setTemplates] = React.useState<BarcodeTemplate[]>(() =>
    loadFromStorage(TEMPLATE_STORAGE_KEY, defaultTemplates),
  );
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>(() => {
    const stored = loadFromStorage<BarcodeTemplate[]>(
      TEMPLATE_STORAGE_KEY,
      defaultTemplates,
    );
    const def = stored.find((tpl) => tpl.isDefault);
    return def?.id ?? stored[0]?.id ?? "";
  });
  const [queue, setQueue] = React.useState<QueueItem[]>(() =>
    loadFromStorage(QUEUE_STORAGE_KEY, defaultQueue),
  );
  const [rules, setRules] = React.useState<CleanupRule[]>(() =>
    loadFromStorage(RULE_STORAGE_KEY, defaultRules),
  );
  const [templateElements, setTemplateElements] = React.useState<TemplateElementsMap>(() =>
    loadFromStorage(ELEMENT_STORAGE_KEY, {}),
  );
  const [selectedCatalogIds, setSelectedCatalogIds] = React.useState<string[]>([]);
  const [selectedQueueIds, setSelectedQueueIds] = React.useState<string[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
  const [templateForm, setTemplateForm] = React.useState<TemplateFormState>(emptyTemplateForm);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [ruleInput, setRuleInput] = React.useState("");
  const [selectedElementId, setSelectedElementId] = React.useState<string | null>(null);

  const previewRef = React.useRef<HTMLDivElement | null>(null);

  const selectedTemplate = templates.find((tpl) => tpl.id === selectedTemplateId) ?? null;
  const elements = templateElements[selectedTemplateId] ?? [];
  const selectedElement = elements.find((el) => el.id === selectedElementId) ?? null;

  const showStatus = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 3200);
  };

  const ensureTemplateElements = React.useCallback(
    (templateId: string) => {
      setTemplateElements((prev) => {
        if (prev[templateId]) return prev;
        return { ...prev, [templateId]: [] };
      });
    },
    [setTemplateElements],
  );

  React.useEffect(() => {
    saveToStorage(TEMPLATE_STORAGE_KEY, templates);
  }, [templates]);

  React.useEffect(() => {
    saveToStorage(QUEUE_STORAGE_KEY, queue);
  }, [queue]);

  React.useEffect(() => {
    saveToStorage(RULE_STORAGE_KEY, rules);
  }, [rules]);

  React.useEffect(() => {
    saveToStorage(ELEMENT_STORAGE_KEY, templateElements);
  }, [templateElements]);

  React.useEffect(() => {
    if (selectedTemplateId) ensureTemplateElements(selectedTemplateId);
  }, [selectedTemplateId, ensureTemplateElements]);

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    setSelectedElementId(null);
  };

  const updateTemplateField = <K extends keyof BarcodeTemplate>(key: K, value: BarcodeTemplate[K]) => {
    setTemplates((prev) =>
      prev.map((tpl) => (tpl.id === selectedTemplateId ? { ...tpl, [key]: value } : tpl)),
    );
  };

  const handleSetDefaultTemplate = (id: string) => {
    setTemplates((prev) => prev.map((tpl) => ({ ...tpl, isDefault: tpl.id === id })));
    showStatus("기본 템플릿이 변경되었습니다.");
  };

  const handleOpenCreateModal = () => {
    setTemplateForm({ ...emptyTemplateForm, name: `새 템플릿 ${templates.length + 1}` });
    setCreateModalOpen(true);
  };

  const handleTemplateFormChange = <K extends keyof TemplateFormState>(
    key: K,
    value: TemplateFormState[K],
  ) => {
    setTemplateForm((prev) => ({ ...prev, [key]: value }));
  };

  const createTemplate = () => {
    if (!templateForm.name.trim()) {
      return showStatus("템플릿 이름을 입력해주세요.");
    }
    const id = `tpl-${Date.now()}`;
    const newTemplate: BarcodeTemplate = {
      id,
      name: templateForm.name.trim(),
      paperType: templateForm.paperType,
      description: templateForm.description || "사용자 지정 템플릿",
      columns: templateForm.columns,
      rows: templateForm.rows,
      labelWidth: templateForm.labelWidth,
      labelHeight: templateForm.labelHeight,
      fontSize: templateForm.fontSize,
      marginTop: templateForm.marginTop,
      marginLeft: templateForm.marginLeft,
      gap: templateForm.gap,
      autoCut: templateForm.autoCut,
      isDefault: false,
      updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    setTemplateElements((prev) => ({ ...prev, [id]: [] }));
    setSelectedTemplateId(id);
    setCreateModalOpen(false);
    showStatus("새 템플릿이 추가되었습니다.");
  };

  const duplicateTemplate = (id: string) => {
    const template = templates.find((tpl) => tpl.id === id);
    if (!template) return;
    const newId = `tpl-${Date.now()}`;
    const newTemplate: BarcodeTemplate = {
      ...template,
      id: newId,
      name: `${template.name} 복제`,
      isDefault: false,
      updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    setTemplateElements((prev) => ({ ...prev, [newId]: [...(prev[id] ?? [])] }));
    showStatus("템플릿을 복제했습니다.");
  };

  const removeTemplate = (id: string) => {
    const template = templates.find((tpl) => tpl.id === id);
    if (!template) return;
    if (template.isDefault) {
      return showStatus("기본 템플릿은 삭제할 수 없습니다.");
    }
    setTemplates((prev) => prev.filter((tpl) => tpl.id !== id));
    setTemplateElements((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (selectedTemplateId === id) {
      setSelectedTemplateId(templates.find((tpl) => tpl.id !== id)?.id ?? "");
    }
    showStatus("템플릿을 삭제했습니다.");
  };

  const updateElements = (updater: (items: CustomElement[]) => CustomElement[]) => {
    if (!selectedTemplateId) return;
    setTemplateElements((prev) => ({
      ...prev,
      [selectedTemplateId]: updater(prev[selectedTemplateId] ?? []),
    }));
  };

  const addElementToTemplate = (payload: { type: CustomElementType; x: number; y: number }) => {
    updateElements((items) => [
      ...items,
      {
        id: `element-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        type: payload.type,
        label: componentPalette.find((c) => c.type === payload.type)?.label ?? "요소",
        x: payload.x,
        y: payload.y,
        width: payload.type === "qr" ? 60 : payload.type === "barcode" ? 160 : 120,
        height: payload.type === "qr" ? 60 : payload.type === "barcode" ? 40 : 24,
        fontSize: payload.type === "barcode" ? 0 : 12,
        bold: payload.type === "text",
      },
    ]);
    showStatus("드롭한 컴포넌트를 템플릿에 추가했습니다.");
  };

  const moveElement = (id: string, x: number, y: number) => {
    updateElements((items) =>
      items.map((item) => (item.id === id ? { ...item, x, y } : item)),
    );
  };

  const removeElement = (id: string) => {
    updateElements((items) => items.filter((item) => item.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const updateElementField = <K extends keyof CustomElement>(
    id: string,
    key: K,
    value: CustomElement[K],
  ) => {
    updateElements((items) => items.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const addSelectedToQueue = () => {
    if (selectedCatalogIds.length === 0) {
      return showStatus("추가할 상품을 선택해주세요.");
    }
    const newItems: QueueItem[] = selectedCatalogIds.map((catalogId) => {
      const item = catalog.find((it) => it.id === catalogId);
      if (!item) throw new Error("catalog item not found");
      const sanitized = sanitizeProductName(item.productName, rules);
      return {
        id: `queue-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        productName: item.productName,
        sanitizedName: sanitized,
        sku: item.sku,
        quantity: 1,
        templateId: item.templateId,
        status: "대기",
        createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      };
    });
    setQueue((prev) => [...newItems, ...prev]);
    setSelectedCatalogIds([]);
    showStatus("선택한 상품을 인쇄 대기열에 추가했습니다.");
  };

  const updateQueueStatus = (status: QueueItem["status"]) => {
    if (selectedQueueIds.length === 0) {
      return showStatus("먼저 대상을 선택해주세요.");
    }
    setQueue((prev) =>
      prev.map((item) => (selectedQueueIds.includes(item.id) ? { ...item, status } : item)),
    );
    showStatus(`선택 항목을 '${status}' 상태로 변경했습니다.`);
    if (status === "인쇄완료") setSelectedQueueIds([]);
  };

  const removeQueueItems = () => {
    if (selectedQueueIds.length === 0) {
      return showStatus("삭제할 항목을 선택해주세요.");
    }
    setQueue((prev) => prev.filter((item) => !selectedQueueIds.includes(item.id)));
    setSelectedQueueIds([]);
    showStatus("선택한 항목을 대기열에서 제거했습니다.");
  };

  const clearQueue = () => {
    setQueue([]);
    setSelectedQueueIds([]);
    showStatus("인쇄 대기열을 모두 비웠습니다.");
  };

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)));
  };

  const addRule = () => {
    if (!ruleInput.trim()) {
      return showStatus("제거할 문자열을 입력하세요.");
    }
    setRules((prev) => [
      {
        id: `rule-${Date.now()}`,
        keyword: ruleInput.trim(),
        description: "사용자 정의 규칙",
        enabled: true,
      },
      ...prev,
    ]);
    setRuleInput("");
    showStatus("새 문자열 제거 규칙을 추가했습니다.");
  };

  const queueColumns: TableColumn<QueueItem>[] = [
    {
      key: "sanitizedName",
      title: "상품명",
      render: (value, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{record.sanitizedName}</span>
          <span className="text-xs text-gray-500">원본: {record.productName}</span>
        </div>
      ),
    },
    { key: "sku", title: "SKU" },
    {
      key: "quantity",
      title: "수량",
      render: (value, record) => (
        <input
          type="number"
          min={1}
          className="w-20 rounded-md border border-gray-200 px-2 py-1 text-sm"
          value={record.quantity}
          onChange={(event) => {
            const next = Number(event.target.value) || 1;
            setQueue((prev) =>
              prev.map((item) => (item.id === record.id ? { ...item, quantity: next } : item)),
            );
          }}
        />
      ),
    },
    {
      key: "templateId",
      title: "사용 템플릿",
      render: (_, record) => (
        <Dropdown
          options={templates.map((tpl) => ({ value: tpl.id, label: tpl.name }))}
          value={record.templateId}
          onChange={(value) => {
            setQueue((prev) =>
              prev.map((item) => (item.id === record.id ? { ...item, templateId: value } : item)),
            );
          }}
          size="small"
        />
      ),
    },
    {
      key: "status",
      title: "상태",
      render: (value) => (
        <Badge size="small" variant={value === "인쇄완료" ? "success" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    { key: "createdAt", title: "등록일" },
  ];

  const handlePreviewDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

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
    if (!selectedTemplate) return;
    const payload = parseDragPayload(event);
    if (!payload) return;

    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleWidth = mmToPreviewPx(selectedTemplate.labelWidth);
    const scaleHeight = mmToPreviewPx(selectedTemplate.labelHeight);

    if (payload.kind === "palette") {
      const x = clamp(event.clientX - rect.left - 30, 0, scaleWidth - 60);
      const y = clamp(event.clientY - rect.top - 12, 0, scaleHeight - 30);
      addElementToTemplate({ type: payload.elementType, x, y });
      return;
    }

    if (payload.kind === "element") {
      const x = clamp(event.clientX - rect.left - payload.offsetX, 0, scaleWidth - 20);
      const y = clamp(event.clientY - rect.top - payload.offsetY, 0, scaleHeight - 20);
      moveElement(payload.elementId, x, y);
    }
  };

  const handlePaletteDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    elementType: CustomElementType,
  ) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ kind: "palette", elementType }),
    );
  };

  const handleElementDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    element: CustomElement,
  ) => {
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
    <Container maxWidth="7xl" className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">바코드 환경 설정</h1>
          <p className="mt-1 text-sm text-gray-600">
            인쇄 템플릿, 문자열 정리 규칙, 인쇄 대기열을 한 화면에서 관리하고 템플릿 요소를 드래그 앤 드롭으로 배치할 수 있습니다.
          </p>
          {statusMessage && (
            <div className="mt-3">
              <StatusToast message={statusMessage} />
            </div>
          )}
        </div>
        <Stack direction="row" gap={3} className="flex-wrap gap-y-3">
          <Button
            variant="outline"
            onClick={() => updateQueueStatus("인쇄완료")}
            disabled={selectedQueueIds.length === 0}
          >
            선택 항목 인쇄 완료 처리
          </Button>
          <Button
            onClick={() => {
              if (!selectedTemplate) {
                return showStatus("먼저 템플릿을 선택해주세요.");
              }
              if (selectedQueueIds.length === 0) {
                return showStatus("인쇄할 대상을 선택해주세요.");
              }
              updateQueueStatus("인쇄완료");
              showStatus(`${selectedTemplate.name} 템플릿으로 인쇄를 실행했습니다.`);
            }}
          >
            선택 템플릿으로 인쇄하기
          </Button>
        </Stack>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">인쇄 템플릿 목록</h2>
              <p className="text-sm text-gray-500">템플릿을 선택하면 오른쪽에서 상세 설정과 배치를 편집할 수 있습니다.</p>
            </div>
            <Button size="small" onClick={handleOpenCreateModal}>
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
                  onClick={() => handleTemplateSelect(template.id)}
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
                    <Stack direction="column" gap={2}>
                      <Button
                        size="small"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          duplicateTemplate(template.id);
                        }}
                      >
                        복제
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeTemplate(template.id);
                        }}
                      >
                        삭제
                      </Button>
                      {!template.isDefault && (
                        <Button
                          size="small"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleSetDefaultTemplate(template.id);
                          }}
                        >
                          기본 지정
                        </Button>
                      )}
                    </Stack>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card padding="lg" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">템플릿 상세 설정</h2>
                {selectedTemplate && (
                  <p className="text-xs text-gray-500">마지막 수정일 {selectedTemplate.updatedAt}</p>
                )}
              </div>
              <Button
                size="small"
                variant="outline"
                onClick={() => selectedTemplate && handleSetDefaultTemplate(selectedTemplate.id)}
                disabled={!selectedTemplate || selectedTemplate.isDefault}
              >
                기본 템플릿으로 설정
              </Button>
            </div>

            {selectedTemplate ? (
              <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)]">
                <div className="space-y-5">
                  <Input
                    label="템플릿 이름"
                    value={selectedTemplate.name}
                    onChange={(event) => updateTemplateField("name", event.target.value)}
                    fullWidth
                  />
                  <Dropdown
                    label="라벨지 종류"
                    options={paperTypeOptions}
                    value={selectedTemplate.paperType}
                    onChange={(value) => updateTemplateField("paperType", value)}
                    fullWidth
                  />
                  <Input
                    label="설명"
                    value={selectedTemplate.description}
                    onChange={(event) => updateTemplateField("description", event.target.value)}
                    fullWidth
                  />
                  <Stack direction="row" gap={4}>
                    <Input
                      type="number"
                      label="가로 라벨 개수"
                      value={selectedTemplate.columns}
                      onChange={(event) =>
                        updateTemplateField("columns", Number(event.target.value) || 1)
                      }
                      fullWidth
                    />
                    <Input
                      type="number"
                      label="세로 라벨 개수"
                      value={selectedTemplate.rows}
                      onChange={(event) =>
                        updateTemplateField("rows", Number(event.target.value) || 1)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Dropdown
                    label="라벨 크기 프리셋"
                    options={labelSizePresets}
                    placeholder="프리셋 선택"
                    onChange={(value) => {
                      const [w, h] = value.split("x");
                      updateTemplateField("labelWidth", Number(w));
                      updateTemplateField("labelHeight", Number(h));
                    }}
                    fullWidth
                  />
                  <Stack direction="row" gap={4}>
                    <Input
                      type="number"
                      label="라벨 가로 (mm)"
                      value={selectedTemplate.labelWidth}
                      onChange={(event) =>
                        updateTemplateField("labelWidth", Number(event.target.value) || 10)
                      }
                      fullWidth
                    />
                    <Input
                      type="number"
                      label="라벨 세로 (mm)"
                      value={selectedTemplate.labelHeight}
                      onChange={(event) =>
                        updateTemplateField("labelHeight", Number(event.target.value) || 10)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction="row" gap={4}>
                    <Input
                      type="number"
                      label="상단 여백 (mm)"
                      value={selectedTemplate.marginTop}
                      onChange={(event) =>
                        updateTemplateField("marginTop", Number(event.target.value) || 0)
                      }
                      fullWidth
                    />
                    <Input
                      type="number"
                      label="좌측 여백 (mm)"
                      value={selectedTemplate.marginLeft}
                      onChange={(event) =>
                        updateTemplateField("marginLeft", Number(event.target.value) || 0)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction="row" gap={4}>
                    <Input
                      type="number"
                      label="라벨 간격 (mm)"
                      value={selectedTemplate.gap}
                      onChange={(event) =>
                        updateTemplateField("gap", Number(event.target.value) || 0)
                      }
                      fullWidth
                    />
                    <Input
                      type="number"
                      label="폰트 크기 (pt)"
                      value={selectedTemplate.fontSize}
                      onChange={(event) =>
                        updateTemplateField("fontSize", Number(event.target.value) || 8)
                      }
                      fullWidth
                    />
                  </Stack>
                  <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedTemplate.autoCut}
                      onChange={(event) => updateTemplateField("autoCut", event.target.checked)}
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
                      <p className="mt-1 text-xs text-gray-500">
                        좌측 요소를 드래그해서 배치하고, 요소를 다시 드래그하여 위치를 조정할 수 있습니다.
                      </p>
                    </div>
                    <div className="overflow-auto">
                      <div
                        ref={previewRef}
                        className="relative mx-auto flex min-h-[160px] min-w-[160px] items-center justify-center overflow-hidden rounded border border-dashed border-gray-300 bg-white"
                        style={{
                          width: mmToPreviewPx(selectedTemplate.labelWidth),
                          height: mmToPreviewPx(selectedTemplate.labelHeight),
                        }}
                        onDragOver={handlePreviewDragOver}
                        onDrop={handlePreviewDrop}
                      >
                        {elements.length === 0 && (
                          <span className="px-3 text-center text-xs text-gray-400">
                            팔레트에서 요소를 끌어다 놓으세요.
                          </span>
                        )}
                        {elements.map((element) => (
                          <div
                            key={element.id}
                            draggable
                            onDragStart={(event) => handleElementDragStart(event, element)}
                            onClick={() => setSelectedElementId(element.id)}
                            className={`absolute cursor-move rounded border px-2 py-1 text-xs shadow-sm ${
                              selectedElementId === element.id
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-200 bg-white"
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
                          onDragStart={(event) => handlePaletteDragStart(event, component.type)}
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
                          onChange={(event) =>
                            updateElementField(selectedElement.id, "label", event.target.value)
                          }
                          fullWidth
                        />
                        {selectedElement.type !== "barcode" && selectedElement.type !== "qr" && (
                          <Stack direction="row" gap={3}>
                            <Input
                              type="number"
                              label="폰트 크기"
                              value={selectedElement.fontSize}
                              onChange={(event) =>
                                updateElementField(
                                  selectedElement.id,
                                  "fontSize",
                                  Number(event.target.value) || 8,
                                )
                              }
                              fullWidth
                            />
                            <label className="mt-6 flex items-center gap-2 text-xs text-gray-600">
                              <input
                                type="checkbox"
                                checked={selectedElement.bold}
                                onChange={(event) =>
                                  updateElementField(selectedElement.id, "bold", event.target.checked)
                                }
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
                            onChange={(event) =>
                              updateElementField(
                                selectedElement.id,
                                "width",
                                Number(event.target.value) || selectedElement.width,
                              )
                            }
                            fullWidth
                          />
                          <Input
                            type="number"
                            label="높이"
                            value={selectedElement.height}
                            onChange={(event) =>
                              updateElementField(
                                selectedElement.id,
                                "height",
                                Number(event.target.value) || selectedElement.height,
                              )
                            }
                            fullWidth
                          />
                        </Stack>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => removeElement(selectedElement.id)}
                        >
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
              <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                템플릿을 선택하면 상세 설정을 편집할 수 있습니다.
              </div>
            )}
          </Card>

          <Card padding="lg" className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">인쇄 대기열</h2>
              <Stack direction="row" gap={3}>
                <Button variant="outline" size="small" onClick={removeQueueItems}>
                  선택 삭제
                </Button>
                <Button variant="outline" size="small" onClick={clearQueue}>
                  대기열 비우기
                </Button>
              </Stack>
            </div>

            <Table
              bordered
              columns={queueColumns}
              data={queue}
              size="small"
              rowSelection={{
                selectedRowKeys: selectedQueueIds,
                onChange: (keys) => setSelectedQueueIds(keys),
              }}
            />

            <div className="rounded-md border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-800">인쇄 대기열에 추가</h3>
              <p className="mt-1 text-xs text-gray-500">
                아래 상품을 선택 후 "대기열에 추가" 버튼을 누르면 문자열 제거 규칙이 자동 적용됩니다.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {catalog.map((item) => {
                  const checked = selectedCatalogIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer flex-col gap-2 rounded-md border px-3 py-3 ${
                        checked ? "border-primary-400 bg-primary-50" : "border-gray-200 hover:border-primary-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSelectedCatalogIds((prev) => [...prev, item.id]);
                            } else {
                              setSelectedCatalogIds((prev) => prev.filter((id) => id !== item.id));
                            }
                          }}
                        />
                        <Badge size="small" variant="secondary">
                          추천 템플릿 {templates.find((tpl) => tpl.id === item.templateId)?.name ?? "-"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                        <p className="text-xs text-gray-500">SKU {item.sku}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          적용 후 미리보기: {sanitizeProductName(item.productName, rules)}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className="mt-3 text-right">
                <Button size="small" onClick={addSelectedToQueue}>
                  선택 항목 대기열 등록
                </Button>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">불필요 문자열 제거</h2>
              <Stack direction="row" gap={3}>
                <Input
                  placeholder="예: (무료배송)"
                  value={ruleInput}
                  onChange={(event) => setRuleInput(event.target.value)}
                  fullWidth
                />
                <Button onClick={addRule}>규칙 추가</Button>
              </Stack>
            </div>

            <div className="space-y-2">
              {rules.map((rule) => (
                <label
                  key={rule.id}
                  className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{rule.keyword}</p>
                    <p className="text-xs text-gray-500">{rule.description}</p>
                  </div>
                  <Stack direction="row" gap={2} align="center">
                    <span className="text-xs text-gray-500">{rule.enabled ? "사용 중" : "사용 안 함"}</span>
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                      className="h-4 w-4"
                    />
                  </Stack>
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="새 인쇄 템플릿 만들기"
        footer={
          <Stack direction="row" gap={3}>
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
              취소
            </Button>
            <Button onClick={createTemplate}>템플릿 생성</Button>
          </Stack>
        }
      >
        <div className="space-y-4">
          <Input
            label="템플릿 이름"
            value={templateForm.name}
            onChange={(event) => handleTemplateFormChange("name", event.target.value)}
            fullWidth
          />
          <Dropdown
            label="라벨지 종류"
            options={paperTypeOptions}
            value={templateForm.paperType}
            onChange={(value) => handleTemplateFormChange("paperType", value)}
            fullWidth
          />
          <Input
            label="설명"
            value={templateForm.description}
            onChange={(event) => handleTemplateFormChange("description", event.target.value)}
            fullWidth
          />
          <Stack direction="row" gap={4}>
            <Input
              type="number"
              label="가로 라벨 개수"
              value={templateForm.columns}
              onChange={(event) =>
                handleTemplateFormChange("columns", Number(event.target.value) || 1)
              }
              fullWidth
            />
            <Input
              type="number"
              label="세로 라벨 개수"
              value={templateForm.rows}
              onChange={(event) => handleTemplateFormChange("rows", Number(event.target.value) || 1)}
              fullWidth
            />
          </Stack>
          <Stack direction="row" gap={4}>
            <Input
              type="number"
              label="라벨 가로 (mm)"
              value={templateForm.labelWidth}
              onChange={(event) =>
                handleTemplateFormChange("labelWidth", Number(event.target.value) || 10)
              }
              fullWidth
            />
            <Input
              type="number"
              label="라벨 세로 (mm)"
              value={templateForm.labelHeight}
              onChange={(event) =>
                handleTemplateFormChange("labelHeight", Number(event.target.value) || 10)
              }
              fullWidth
            />
          </Stack>
          <Stack direction="row" gap={4}>
            <Input
              type="number"
              label="폰트 크기 (pt)"
              value={templateForm.fontSize}
              onChange={(event) =>
                handleTemplateFormChange("fontSize", Number(event.target.value) || 8)
              }
              fullWidth
            />
            <Input
              type="number"
              label="라벨 간격 (mm)"
              value={templateForm.gap}
              onChange={(event) =>
                handleTemplateFormChange("gap", Number(event.target.value) || 0)
              }
              fullWidth
            />
          </Stack>
          <Stack direction="row" gap={4}>
            <Input
              type="number"
              label="상단 여백 (mm)"
              value={templateForm.marginTop}
              onChange={(event) =>
                handleTemplateFormChange("marginTop", Number(event.target.value) || 0)
              }
              fullWidth
            />
            <Input
              type="number"
              label="좌측 여백 (mm)"
              value={templateForm.marginLeft}
              onChange={(event) =>
                handleTemplateFormChange("marginLeft", Number(event.target.value) || 0)
              }
              fullWidth
            />
          </Stack>
          <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
            <input
              type="checkbox"
              checked={templateForm.autoCut}
              onChange={(event) => handleTemplateFormChange("autoCut", event.target.checked)}
            />
            <div>
              <span className="text-sm font-medium text-gray-700">출력 후 자동 커팅</span>
              <p className="text-xs text-gray-500">자동 커팅 신호를 사용하는 라벨기를 연결한 경우 선택합니다.</p>
            </div>
          </label>
        </div>
      </Modal>
    </Container>
  );
};

export default BarcodeSettingsPage;
