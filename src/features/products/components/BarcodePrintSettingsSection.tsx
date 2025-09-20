import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  GridCol,
  GridRow,
  Input,
  Stack,
  Tabs,
  Button,
} from "../../../design-system";
// Avoid importing types from multitenant which may not export exact shapes in this workspace
type ProductBarcodeSettings = any;
type VendorBarcodeSetting = any;
type BarcodePrintField = any;

interface SupplierOption {
  id: string;
  name: string;
}

interface BarcodePrintSettingsSectionProps {
  settings?: ProductBarcodeSettings;
  onChange?: (next: ProductBarcodeSettings) => void;
  suppliers?: SupplierOption[];
}

const TAB_ITEMS = [
  { key: "common", label: "인쇄설정 공통사항" },
  { key: "pdf-grid", label: "PDF 레이아웃" },
  { key: "pdf-detail", label: "PDF 세부 설정" },
  { key: "location", label: "위치바코드 PDF" },
  { key: "font", label: "폰트 · 다운로드" },
];

const LEVEL_OPTIONS: Array<{ value: VendorBarcodeSetting["level"]; label: string }> = [
  { value: "single", label: "단품" },
  { value: "bundle", label: "묶음" },
  { value: "carton", label: "대봉(Carton)" },
  { value: "pallet", label: "팔레트" },
];

const LABEL_PRESET_LABELS: Record<VendorBarcodeSetting["labelPreset"], string> = {
  "40x20": "40 x 20mm",
  "50x30": "50 x 30mm",
  "100x50": "100 x 50mm",
  "100x75": "100 x 75mm",
  A5: "A5",
};

const DEFAULT_PRINT_FIELDS: BarcodePrintField[] = [
  {
    id: "product-name",
    order: 1,
    label: "상품명",
    description: "출력시 상품명을 앞면에 노출",
    enabled: true,
    required: true,
  },
  {
    id: "vendor-product-name",
    order: 2,
    label: "거래처 상품명",
    description: "거래처 관리명칭을 함께 노출",
    enabled: true,
  },
  {
    id: "variant",
    order: 3,
    label: "옵션 정보",
    description: "색상, 사이즈, 시즌 표시",
    enabled: true,
    required: true,
  },
  {
    id: "quantity",
    order: 4,
    label: "수량",
    description: "출고/입고 수량",
    enabled: false,
  },
  {
    id: "location",
    order: 5,
    label: "위치",
    description: "창고 / 랙 / 셀",
    enabled: false,
  },
  {
    id: "memo",
    order: 6,
    label: "비고",
    description: "추가 메모",
    enabled: false,
  },
];

const createDefaultVendorSetting = (
  vendorId: string,
  vendorName: string,
): VendorBarcodeSetting => ({
  vendorId,
  vendorName,
  globalBarcodePrefix: "",
  level: "single",
  allowGeneralBarcode: true,
  labelPreset: "40x20",
  quietZone: 2.5,
  dpi: 300,
  sequenceStart: 1,
  printFields: DEFAULT_PRINT_FIELDS.map((field) => ({ ...field })),
  textSettings: {
    align: "center",
    fontSize: 18,
    lineHeight: 1.2,
  },
  pdfGrid: {
    columns: 3,
    rows: 8,
    gapX: 8,
    gapY: 12,
    marginTop: 10,
    marginLeft: 10,
  },
  locationLabel: {
    labelWidth: 180,
    labelHeight: 120,
    barcodeHeight: 28,
    barcodeType: "code128",
    offsetX: 40,
    offsetY: 30,
  },
  notes: "",
});

const BarcodePrintSettingsSection: React.FC<BarcodePrintSettingsSectionProps> = ({
  settings,
  onChange,
  suppliers = [],
}) => {
  const [activeTab, setActiveTab] = useState<string>(TAB_ITEMS[0].key);
  const [activeVendorId, setActiveVendorId] = useState<string>(
    settings?.vendors?.[0]?.vendorId ?? "default",
  );
  const [supplierSelect, setSupplierSelect] = useState<string>("");

  useEffect(() => {
    if (!settings || settings.vendors.length === 0) {
      const fallback = createDefaultVendorSetting("default", "기본 설정");
      if (typeof onChange === "function") {
        onChange({ policyAcknowledged: false, vendors: [fallback] });
      }
      setActiveVendorId(fallback.vendorId);
    }
  }, [settings, onChange]);

  useEffect(() => {
    if (!settings) return;
    if (!settings.vendors.some((vendor: any) => vendor.vendorId === activeVendorId)) {
      const firstVendor = settings.vendors[0];
      if (firstVendor) {
        setActiveVendorId(firstVendor.vendorId);
      }
    }
  }, [activeVendorId, settings]);

  const activeVendor = useMemo(() => {
    if (!settings) return undefined;
    return (
      settings.vendors.find((vendor: any) => vendor.vendorId === activeVendorId) ??
      settings.vendors[0]
    );
  }, [settings, activeVendorId]);

  if (!settings || !activeVendor) {
    return null;
  }

  const updateVendors = (nextVendors: VendorBarcodeSetting[]) => {
    if (typeof onChange === "function") {
      onChange({
        policyAcknowledged: settings.policyAcknowledged,
        vendors: nextVendors,
      });
    }
  };

  const mergeVendorPatch = (patch: Partial<VendorBarcodeSetting>) => {
    const nextVendor: VendorBarcodeSetting = { ...activeVendor, ...patch };
    const nextVendors = settings.vendors.map((vendor: any) =>
      vendor.vendorId === activeVendor.vendorId ? nextVendor : vendor,
    );
    updateVendors(nextVendors);
    if (patch.vendorId && patch.vendorId !== activeVendor.vendorId) {
      setActiveVendorId(patch.vendorId);
    }
  };

  const handleVendorFieldToggle = (fieldId: string, enabled: boolean) => {
    mergeVendorPatch({
      printFields: activeVendor.printFields.map((field: any) =>
        field.id === fieldId ? { ...field, enabled } : field,
      ),
    });
  };

  const handleVendorSelect = (vendorId: string) => {
    if (vendorId === "new") {
      const idx = settings.vendors.length + 1;
      const newVendor = createDefaultVendorSetting(
        `vendor-${Date.now()}`,
        `거래처 ${idx}`,
      );
      updateVendors([...settings.vendors, newVendor]);
      setActiveVendorId(newVendor.vendorId);
      return;
    }
    setActiveVendorId(vendorId);
  };

  const handleRemoveVendor = (vendorId: string) => {
    if (settings.vendors.length === 1) return;
    const nextVendors = settings.vendors.filter(
      (vendor: any) => vendor.vendorId !== vendorId,
    );
    updateVendors(nextVendors);
    setActiveVendorId(nextVendors[0]?.vendorId ?? "");
  };

  const handleSupplierImport = (supplierId: string) => {
    if (!supplierId) return;
    const supplier = suppliers.find((item) => item.id === supplierId);
    if (!supplier) return;
    const existing = settings?.vendors?.find(
      (vendor: any) => vendor.vendorId === supplierId,
    );
    if (existing) {
      setActiveVendorId(existing.vendorId);
      return;
    }
    const imported = createDefaultVendorSetting(supplier.id, supplier.name);
    updateVendors([...(settings?.vendors || []), imported]);
    setActiveVendorId(imported.vendorId);
  };

  const generalPolicyPoints = [
    "Code128, 20자 이내, 영문 대문자/숫자/하이픈만 허용",
    "고유값은 화주사 ID + Level + 코드 조합으로 생성하고 재사용 금지",
    "중복 방지를 위해 DB 시퀀스를 사용하고 변경 이력 기록",
    "개인정보, 가격, 주문정보 노출 금지 및 창고 이미지 공개 시 마스킹 적용",
  ];

  const overviewList = [
    "화주사별 바코드 생성 체계를 직접 관리할 수 있도록 지원",
    "단품, 묶음, 대봉, 팔레트 등 물류 단위를 동일한 템플릿으로 관리",
    "바코드 항목(상품명, 옵션, 위치 등)은 거래처 요구에 맞춰 선택",
    "PDF 미리보기, 위치 바코드, 폰트 다운로드를 제공해 셀메이트 연동 준비",
  ];

  const availableSuppliers = suppliers.filter(
    (item: any) => !settings?.vendors?.some((vendor: any) => vendor.vendorId === item.id),
  );

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-bold">바코드 인쇄 설정</h2>
        <p className="text-sm text-gray-500">
          거래처별로 물류 단위 바코드를 일관된 정책 하에 관리할 수 있도록 설정합니다.
        </p>
      </div>

      <div className="border border-red-200 bg-red-50 p-4 rounded-md text-sm text-red-900 space-y-2">
        <div className="font-semibold">주의사항</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>바코드에서 입고코드 입력 시 사용이 불가합니다.</li>
          <li>추가구간 항목과 간격이 없으면 인쇄 항목이 겹칠 수 있습니다.</li>
          <li>인쇄 라벨은 최소 2.5mm 이상의 여백(Quiet Zone)을 확보하세요.</li>
          <li>code39, code93, code128 등 다양한 포맷을 지원하지만 글로벌 바코드는 Code128 기준입니다.</li>
          <li>문자 허용 범위: A-Z, 숫자 0-9, 일부 특수문자(., -, /, %, +)만 가능</li>
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="text-sm font-semibold text-gray-700">거래처 설정</div>
        <select
          value={activeVendorId}
          onChange={(event) => handleVendorSelect(event.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {settings.vendors.map((vendor: any) => (
            <option key={vendor.vendorId} value={vendor.vendorId}>
              {vendor.vendorName}
            </option>
          ))}
          <option value="new">+ 새 거래처 추가</option>
        </select>
        {settings.vendors.length > 1 ? (
          <Button
            variant="outline"
            size="small"
            onClick={() => handleRemoveVendor(activeVendor.vendorId)}
          >
            현재 거래처 삭제
          </Button>
        ) : null}
      </div>
      {availableSuppliers.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold text-gray-700">공급사 템플릿 불러오기</span>
          <select
            value={supplierSelect}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) return;
              handleSupplierImport(value);
              setSupplierSelect("");
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">선택하세요</option>
            {availableSuppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400">
            선택 시 신규 거래처 템플릿이 생성됩니다.
          </span>
        </div>
      ) : (
        <div className="mt-2 text-xs text-gray-500">
          모든 공급사에 대한 바코드 템플릿이 등록되어 있습니다.
        </div>
      )}

      <Tabs
        items={TAB_ITEMS}
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="mt-6"
      >
        {activeTab === "common" && (
          <div className="space-y-6">
            <section className="border border-gray-200 rounded-md">
              <header className="px-4 py-3 border-b bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">정책 요약</h3>
              </header>
              <div className="p-4 space-y-4 text-sm text-gray-600">
                <p>
                  글로벌 바코드는 Code128 규격을 기본으로 20자 이내, 영문 대문자와 숫자, 하이픈만 사용합니다.
                  화주사 ID, 속성 코드(Level), 고유 코드의 조합으로 유일성을 확보하며 재사용을 금지합니다.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {generalPolicyPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <div className="border border-blue-100 bg-blue-50 rounded-md p-3 text-blue-900">
                  <div className="font-semibold mb-1">판매처/셀메이트 분리 운영 배경</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {overviewList.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <GridRow gutter={20}>
              <GridCol span={6}>
                <Input
                  label="거래처명"
                  value={activeVendor.vendorName}
                  onChange={(event) =>
                    mergeVendorPatch({ vendorName: event.target.value })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={6}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  화주사 연결
                </label>
                <select
                  value={activeVendor.vendorId}
                  onChange={(event) =>
                    mergeVendorPatch({
                      vendorId: event.target.value,
                      vendorName:
            (suppliers || []).find((item: any) => item.id === event.target.value)?.name ||
                        activeVendor.vendorName,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={activeVendor.vendorId}>현재: {activeVendor.vendorId}</option>
                  {(suppliers || []).map((supplier: any) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="글로벌 바코드 Prefix"
                  placeholder="예: WMS01"
                  value={activeVendor.globalBarcodePrefix}
                  onChange={(event) =>
                    mergeVendorPatch({
                      globalBarcodePrefix: event.target.value.toUpperCase(),
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={activeVendor.level}
                  onChange={(event) =>
                    mergeVendorPatch({
                      level: event.target.value as VendorBarcodeSetting["level"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="시퀀스 시작값"
                  type="number"
                  value={activeVendor.sequenceStart}
                  min={1}
                  onChange={(event) =>
                    mergeVendorPatch({
                      sequenceStart: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  라벨 프리셋
                </label>
                <select
                  value={activeVendor.labelPreset}
                  onChange={(event) =>
                    mergeVendorPatch({
                      labelPreset: event.target.value as VendorBarcodeSetting["labelPreset"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {Object.entries(LABEL_PRESET_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="Quiet Zone (mm)"
                  type="number"
                  step="0.1"
                  value={activeVendor.quietZone}
                  onChange={(event) =>
                    mergeVendorPatch({
                      quietZone: Number(event.target.value) || 0,
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="프린터 해상도 (dpi)"
                  type="number"
                  value={activeVendor.dpi}
                  onChange={(event) =>
                    mergeVendorPatch({ dpi: Number(event.target.value) || 300 })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 mt-6">
                  <input
                    type="checkbox"
                    checked={activeVendor.allowGeneralBarcode}
                    onChange={(event) =>
                      mergeVendorPatch({ allowGeneralBarcode: event.target.checked })
                    }
                  />
                  일반 바코드 허용 (화주사 ID로 중복 방지)
                </label>
              </GridCol>
            </GridRow>

            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">
                출력 항목 구성
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs text-gray-500">
                      <th className="px-3 py-2 border-r">순서</th>
                      <th className="px-3 py-2 border-r">항목명</th>
                      <th className="px-3 py-2 border-r">설명</th>
                      <th className="px-3 py-2">출력</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700">
                    {activeVendor.printFields.map((field: any) => (
                      <tr key={field.id} className="border-t border-gray-200">
                        <td className="px-3 py-2 border-r text-center">{field.order}</td>
                        <td className="px-3 py-2 border-r font-medium">{field.label}</td>
                        <td className="px-3 py-2 border-r text-gray-500">
                          {field.description}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={field.enabled}
                            disabled={field.required}
                            onChange={(event) =>
                              handleVendorFieldToggle(field.id, event.target.checked)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.policyAcknowledged}
                  onChange={(event) => {
                    if (typeof onChange === "function") {
                      onChange({
                        policyAcknowledged: event.target.checked,
                        vendors: settings.vendors,
                      });
                    }
                  }}
                />
                정책을 확인했고 변경 시 로그 기록 및 중복 방지 정책을 준수합니다.
              </label>
              <label className="block text-sm font-medium text-gray-700">
                비고 / 특이사항
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={4}
                placeholder="거래처별 요구사항, 예외 처리, 셀메이트 연동 체크사항 등을 기록하세요."
                value={activeVendor.notes ?? ""}
                onChange={(event) =>
                  mergeVendorPatch({ notes: event.target.value })
                }
              />
            </div>
          </div>
        )}

        {activeTab === "pdf-grid" && (
          <div className="space-y-6 text-sm text-gray-700">
            <p>
              A4 PDF 인쇄 시 라벨 규격(예: 40x20mm, 50x30mm)에 맞춰 행/열과 간격을 조정합니다.
              Quiet Zone 확보를 위해 최소 여백을 유지하고, 템플릿을 저장하면 거래처별 프리셋으로 노출됩니다.
            </p>
            <GridRow gutter={20}>
              <GridCol span={4}>
                <Input
                  label="컬럼 수"
                  type="number"
                  value={activeVendor.pdfGrid.columns}
                  min={1}
                  onChange={(event) =>
                    mergeVendorPatch({
                      pdfGrid: {
                        ...activeVendor.pdfGrid,
                        columns: Math.max(1, Number(event.target.value) || 1),
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="행 수"
                  type="number"
                  value={activeVendor.pdfGrid.rows}
                  min={1}
                  onChange={(event) =>
                    mergeVendorPatch({
                      pdfGrid: {
                        ...activeVendor.pdfGrid,
                        rows: Math.max(1, Number(event.target.value) || 1),
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="가로 간격(px)"
                  type="number"
                  value={activeVendor.pdfGrid.gapX}
                  onChange={(event) =>
                    mergeVendorPatch({
                      pdfGrid: {
                        ...activeVendor.pdfGrid,
                        gapX: Number(event.target.value) || 0,
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="세로 간격(px)"
                  type="number"
                  value={activeVendor.pdfGrid.gapY}
                  onChange={(event) =>
                    mergeVendorPatch({
                      pdfGrid: {
                        ...activeVendor.pdfGrid,
                        gapY: Number(event.target.value) || 0,
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="상단 여백(px)"
                  type="number"
                  value={activeVendor.pdfGrid.marginTop}
                  onChange={(event) =>
                    mergeVendorPatch({
                      pdfGrid: {
                        ...activeVendor.pdfGrid,
                        marginTop: Number(event.target.value) || 0,
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="좌측 여백(px)"
                  type="number"
                  value={activeVendor.pdfGrid.marginLeft}
                  onChange={(event) =>
                    mergeVendorPatch({
                      pdfGrid: {
                        ...activeVendor.pdfGrid,
                        marginLeft: Number(event.target.value) || 0,
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
            </GridRow>
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50 text-gray-600">
              <div className="font-semibold text-gray-700 mb-2">TIP</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>PDF 미리보기와 실제 인쇄 간의 오차(프린터 설정, 용지 여백)를 3~5px 감안하세요.</li>
                <li>동시에 여러 거래처 설정을 저장하면 Sequence 충돌을 방지하기 위해 잠금 처리가 됩니다.</li>
                <li>컬럼/행 조정 후 Quiet Zone이 2.5mm 이상 유지되는지 미리보기로 검증하세요.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "pdf-detail" && (
          <div className="space-y-6 text-sm text-gray-700">
            <p>
              바코드, 텍스트 위치, 글꼴 크기를 조정해 거래처별 안내문구를 정교하게 배치할 수 있습니다.
              텍스트 정렬은 중앙, 좌측, 우측을 지원하며 ANSI C 이상의 스캔 품질을 유지하도록 높이를 조절하세요.
            </p>
            <GridRow gutter={20}>
              <GridCol span={4}>
                <Input
                  label="글꼴 크기(pt)"
                  type="number"
                  value={activeVendor.textSettings.fontSize}
                  onChange={(event) =>
                    mergeVendorPatch({
                      textSettings: {
                        ...activeVendor.textSettings,
                        fontSize: Number(event.target.value) || 12,
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="줄 간격"
                  type="number"
                  step="0.1"
                  value={activeVendor.textSettings.lineHeight}
                  onChange={(event) =>
                    mergeVendorPatch({
                      textSettings: {
                        ...activeVendor.textSettings,
                        lineHeight: Number(event.target.value) || 1.2,
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  정렬
                </label>
                <select
                  value={activeVendor.textSettings.align}
                  onChange={(event) =>
                    mergeVendorPatch({
                      textSettings: {
                        ...activeVendor.textSettings,
                        align: event.target.value as VendorBarcodeSetting["textSettings"]["align"],
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </GridCol>
            </GridRow>
            <div className="border border-blue-100 bg-blue-50 rounded-md p-4 text-blue-900 space-y-2">
              <div className="font-semibold">인쇄/스캔 품질 가이드</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>프린터 해상도는 300dpi 이상으로 설정하세요.</li>
                <li>1D 바코드 등급 ANSI C 이상을 목표로 하고 불량률은 1% 이하를 유지합니다.</li>
                <li>스캔 장비(핸드헬드 레이저, 모바일 카메라)에서 읽기 테스트를 수행해 주세요.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "location" && (
          <div className="space-y-6 text-sm text-gray-700">
            <p>
              위치바코드는 창고 맵핑 및 피킹 동선을 고려해 크기와 여백을 설정합니다. 기본적으로 Code128을 사용하며,
              라벨 폭과 높이는 창고 환경에 맞게 조정할 수 있습니다.
            </p>
            <GridRow gutter={20}>
              <GridCol span={4}>
                <Input
                  label="라벨 폭(px)"
                  type="number"
                  value={activeVendor.locationLabel.labelWidth}
                  onChange={(event) =>
                    mergeVendorPatch({
                      locationLabel: {
                        ...activeVendor.locationLabel,
                        labelWidth: Number(event.target.value) || 0,
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="라벨 높이(px)"
                  type="number"
                  value={activeVendor.locationLabel.labelHeight}
                  onChange={(event) =>
                    mergeVendorPatch({
                      locationLabel: {
                        ...activeVendor.locationLabel,
                        labelHeight: Number(event.target.value) || 0,
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="바코드 높이(px)"
                  type="number"
                  value={activeVendor.locationLabel.barcodeHeight}
                  onChange={(event) =>
                    mergeVendorPatch({
                      locationLabel: {
                        ...activeVendor.locationLabel,
                        barcodeHeight: Number(event.target.value) || 0,
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="X 이동(px)"
                  type="number"
                  value={activeVendor.locationLabel.offsetX}
                  onChange={(event) =>
                    mergeVendorPatch({
                      locationLabel: {
                        ...activeVendor.locationLabel,
                        offsetX: Number(event.target.value) || 0,
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
              <GridCol span={4}>
                <Input
                  label="Y 이동(px)"
                  type="number"
                  value={activeVendor.locationLabel.offsetY}
                  onChange={(event) =>
                    mergeVendorPatch({
                      locationLabel: {
                        ...activeVendor.locationLabel,
                        offsetY: Number(event.target.value) || 0,
                      },
                    })
                  }
                  fullWidth
                />
              </GridCol>
            </GridRow>
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <div className="font-semibold text-gray-700 mb-1">보안 및 예외 처리</div>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>위치바코드에는 내부 키나 개인정보를 포함하지 않습니다.</li>
                <li>재발행 시 사유를 기록하고 Print Count를 증가시켜 오사용을 방지합니다.</li>
                <li>일반 바코드와 글로벌 바코드를 함께 사용하는 경우 화주사 ID로 식별합니다.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "font" && (
          <div className="space-y-6 text-sm text-gray-700">
            <p>
              거래처에 제공할 수 있는 바코드 폰트와 템플릿을 정리했습니다. PDF 출력용 폰트를 다운로드해 WMS/OMS
              환경에서 동일한 인쇄 품질을 유지하세요.
            </p>
            <div className="border border-gray-200 rounded-md divide-y">
              <div className="p-4">
                <div className="font-semibold text-gray-700 mb-2">폰트 목록</div>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>IDAutomationHC39M (Free 3 of 9)
                    <span className="ml-2 text-xs text-gray-400">글로벌 바코드 대체용</span>
                  </li>
                  <li>Free 3 of 9 Extended
                    <span className="ml-2 text-xs text-gray-400">내부 테스트용</span>
                  </li>
                  <li>나눔고딕 Bold
                    <span className="ml-2 text-xs text-gray-400">Human-readable 텍스트</span>
                  </li>
                </ul>
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-700 mb-2">다운로드</div>
                <Stack direction="row" gap={2}>
                  <Button variant="outline" size="small">바코드 폰트 다운로드</Button>
                  <Button variant="outline" size="small">A4 템플릿 내보내기</Button>
                </Stack>
                <p className="mt-3 text-xs text-gray-500">
                  템플릿을 수정한 후에는 버전과 변경 이력을 기록하세요. 창고 사진/영상 공개 시 바코드를 마스킹하는 내부 규정도 함께 안내합니다.
                </p>
              </div>
            </div>
            <div className="border border-blue-100 bg-blue-50 rounded-md p-4 text-xs text-blue-900">
              <div className="font-semibold mb-1">KPI 가이드</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>스캔 성공률 99% 이상 유지</li>
                <li>중복 발급 0건</li>
                <li>셀메이트 연동 시 바코드1/2/3 필드를 확장 가능하도록 검토</li>
              </ul>
            </div>
          </div>
        )}
      </Tabs>
    </Card>
  );
};

export default BarcodePrintSettingsSection;
