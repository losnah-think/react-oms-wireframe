import React from "react";
// types and hook extracted from the original large settings file
export type BarcodeTemplate = {
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

export type QueueItem = {
  id: string;
  productName: string;
  sanitizedName: string;
  sku: string;
  quantity: number;
  templateId: string;
  status: "대기" | "인쇄중" | "인쇄완료";
  createdAt: string;
};

export type CleanupRule = {
  id: string;
  keyword: string;
  description: string;
  enabled: boolean;
};

export type CustomElementType = "text" | "sku" | "price" | "barcode" | "qr" | "custom";

export type CustomElement = {
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

export type TemplateElementsMap = Record<string, CustomElement[]>;

const TEMPLATE_STORAGE_KEY = "barcode_templates_v2";
const QUEUE_STORAGE_KEY = "barcode_print_queue_v1";
const RULE_STORAGE_KEY = "barcode_cleanup_rules_v1";
const ELEMENT_STORAGE_KEY = "barcode_template_elements_v1";

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

const catalog = [
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

export const sanitizeProductName = (name: string, rules: CleanupRule[]) =>
  rules
    .filter((rule) => rule.enabled && rule.keyword)
    .reduce((acc, rule) => acc.split(rule.keyword).join("").trim(), name)
    .replace(/\s{2,}/g, " ");

export const useBarcodeSettings = () => {
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
  const [selectedElementId, setSelectedElementId] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

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

  const createTemplate = (templateForm: Partial<BarcodeTemplate> & { name: string }) => {
    if (!templateForm.name.trim()) {
      return showStatus("템플릿 이름을 입력해주세요.");
    }
    const id = `tpl-${Date.now()}`;
    const newTemplate: BarcodeTemplate = {
      id,
      name: templateForm.name.trim(),
      paperType: templateForm.paperType ?? "전용 라벨지",
      description: templateForm.description || "사용자 지정 템플릿",
      columns: templateForm.columns ?? 3,
      rows: templateForm.rows ?? 5,
      labelWidth: templateForm.labelWidth ?? 50,
      labelHeight: templateForm.labelHeight ?? 30,
      fontSize: templateForm.fontSize ?? 12,
      marginTop: templateForm.marginTop ?? 2,
      marginLeft: templateForm.marginLeft ?? 2,
      gap: templateForm.gap ?? 1,
      autoCut: templateForm.autoCut ?? false,
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
        label: payload.type,
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
    updateElements((items) => items.map((item) => (item.id === id ? { ...item, x, y } : item)));
  };

  const removeElement = (id: string) => {
    updateElements((items) => items.filter((item) => item.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const updateElementField = <K extends keyof CustomElement>(id: string, key: K, value: CustomElement[K]) => {
    updateElements((items) => items.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const addSelectedToQueue = (selectedCatalogIds: string[]) => {
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

  const addRule = (keyword: string) => {
    if (!keyword.trim()) {
      return showStatus("제거할 문자열을 입력하세요.");
    }
    setRules((prev) => [
      {
        id: `rule-${Date.now()}`,
        keyword: keyword.trim(),
        description: "사용자 정의 규칙",
        enabled: true,
      },
      ...prev,
    ]);
    showStatus("새 문자열 제거 규칙을 추가했습니다.");
  };

  return {
    // state
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    queue,
    rules,
    templateElements,
    selectedCatalogIds,
    setSelectedCatalogIds,
    selectedQueueIds,
    setSelectedQueueIds,
    isCreateModalOpen,
    setCreateModalOpen,
    selectedElementId,
    setSelectedElementId,
    statusMessage,
    // derived
    selectedTemplate,
    elements,
    selectedElement,
    // utils
    mmToPreviewPx,
    clamp,
    showStatus,
    ensureTemplateElements,
    handleTemplateSelect,
    updateTemplateField,
    handleSetDefaultTemplate,
    createTemplate,
    duplicateTemplate,
    removeTemplate,
    addElementToTemplate,
    moveElement,
    removeElement,
    updateElementField,
    addSelectedToQueue,
    updateQueueStatus,
    removeQueueItems,
    clearQueue,
    toggleRule,
    addRule,
    sanitizeProductName,
    catalog,
  } as const;
};
