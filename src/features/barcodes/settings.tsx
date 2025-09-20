import React from "react";
import { Container, Card, Button, GridRow, GridCol } from "../../design-system";

const STORAGE_KEY = "barcode_print_settings_v1";

const defaultSettings = {
  paperSize: "A4",
  orientation: "portrait",
  labelWidth: 50,
  labelHeight: 30,
  margin: 2,
  gap: 1.5,
  columns: 3,
  rows: 8,
  includeProductName: true,
  includeSku: true,
  includeOptionName: true,
  includePrice: false,
  includeBrand: false,
  fontSize: "medium" as "small" | "medium" | "large",
  alignment: "center" as "left" | "center" | "right",
  barcodeFormat: "CODE128" as "CODE128" | "EAN13" | "QRCODE",
  autoGenerate: true,
  showGuidelines: true,
  copies: 1,
  thermalMode: false,
  density: "203dpi" as "203dpi" | "300dpi",
};

type SettingsState = typeof defaultSettings;

const loadSettings = (): SettingsState => {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch (err) {
    return defaultSettings;
  }
};

const BarcodeSettingsPage: React.FC = () => {
  const [settings, setSettings] = React.useState<SettingsState>(() =>
    loadSettings(),
  );
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setStatusMessage("바코드 인쇄 설정을 저장했습니다.");
    } catch (err) {
      setStatusMessage("설정을 저장하는 중 문제가 발생했습니다.");
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setStatusMessage("기본값으로 초기화했습니다.");
  };

  React.useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(null), 2400);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  return (
    <Container maxWidth="xl" padding="lg" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">바코드 환경 설정</h1>
        <p className="mt-2 text-gray-600">
          바코드 인쇄 시 사용되는 기본 규격과 출력 옵션을 구성합니다. 설정은
          브라우저 로컬 저장소에 저장되어 이후에도 유지됩니다.
        </p>
        {statusMessage && (
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
            {statusMessage}
          </div>
        )}
      </div>

      <Card padding="lg" className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">출력 용지</h2>
          <p className="text-sm text-gray-500">
            프린터 및 출력용지에 맞는 규격을 선택하세요.
          </p>
          <GridRow gutter={16} className="mt-4">
            <GridCol span={4}>
              <label className="block text-sm font-medium text-gray-700">
                용지 크기
              </label>
              <select
                value={settings.paperSize}
                onChange={(e) => updateSetting("paperSize", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              >
                <option value="A4">A4 (210 x 297 mm)</option>
                <option value="Letter">Letter (8.5 x 11 in)</option>
                <option value="LabelRoll">라벨 롤지 (50 mm 폭)</option>
              </select>
            </GridCol>
            <GridCol span={4}>
              <label className="block text-sm font-medium text-gray-700">
                출력 방향
              </label>
              <select
                value={settings.orientation}
                onChange={(e) => updateSetting("orientation", e.target.value as SettingsState["orientation"])}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              >
                <option value="portrait">세로 (Portrait)</option>
                <option value="landscape">가로 (Landscape)</option>
              </select>
            </GridCol>
            <GridCol span={4}>
              <label className="block text-sm font-medium text-gray-700">
                열/행 구성
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={settings.columns}
                  onChange={(e) =>
                    updateSetting("columns", Number(e.target.value) || 1)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                  aria-label="열 수"
                />
                <span className="flex items-center text-sm text-gray-500">×</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={settings.rows}
                  onChange={(e) => updateSetting("rows", Number(e.target.value) || 1)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                  aria-label="행 수"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                라벨지의 가로/세로 분할 수를 입력하세요.
              </p>
            </GridCol>
          </GridRow>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">라벨 규격</h2>
          <p className="text-sm text-gray-500">
            라벨 한 장의 크기와 간격을 지정합니다.
          </p>
          <GridRow gutter={16} className="mt-4">
            <GridCol span={3}>
              <label className="block text-sm font-medium text-gray-700">
                폭 (mm)
              </label>
              <input
                type="number"
                min={10}
                max={120}
                value={settings.labelWidth}
                onChange={(e) =>
                  updateSetting("labelWidth", Number(e.target.value) || 10)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              />
            </GridCol>
            <GridCol span={3}>
              <label className="block text-sm font-medium text-gray-700">
                높이 (mm)
              </label>
              <input
                type="number"
                min={10}
                max={120}
                value={settings.labelHeight}
                onChange={(e) =>
                  updateSetting("labelHeight", Number(e.target.value) || 10)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              />
            </GridCol>
            <GridCol span={3}>
              <label className="block text-sm font-medium text-gray-700">
                여백 (mm)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={settings.margin}
                onChange={(e) =>
                  updateSetting("margin", Number(e.target.value) || 0)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              />
            </GridCol>
            <GridCol span={3}>
              <label className="block text-sm font-medium text-gray-700">
                라벨 간격 (mm)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={settings.gap}
                onChange={(e) => updateSetting("gap", Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              />
            </GridCol>
          </GridRow>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">라벨 구성 요소</h2>
          <p className="text-sm text-gray-500">
            라벨에 표시할 정보와 배치 옵션을 선택하세요.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.includeProductName}
                onChange={() => toggleSetting("includeProductName")}
              />
              <span className="text-sm text-gray-700">상품명 표시</span>
            </label>
            <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.includeSku}
                onChange={() => toggleSetting("includeSku")}
              />
              <span className="text-sm text-gray-700">상품코드/SKU 표시</span>
            </label>
            <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.includeOptionName}
                onChange={() => toggleSetting("includeOptionName")}
              />
              <span className="text-sm text-gray-700">옵션명 표시</span>
            </label>
            <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.includePrice}
                onChange={() => toggleSetting("includePrice")}
              />
              <span className="text-sm text-gray-700">판매가 표시</span>
            </label>
            <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.includeBrand}
                onChange={() => toggleSetting("includeBrand")}
              />
              <span className="text-sm text-gray-700">브랜드 표시</span>
            </label>
            <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.autoGenerate}
                onChange={() => toggleSetting("autoGenerate")}
              />
              <span className="text-sm text-gray-700">바코드 자동 생성</span>
            </label>
          </div>

          <GridRow gutter={16} className="mt-4">
            <GridCol span={4}>
              <label className="block text-sm font-medium text-gray-700">
                폰트 크기
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) =>
                  updateSetting("fontSize", e.target.value as SettingsState["fontSize"])
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              >
                <option value="small">작게</option>
                <option value="medium">보통</option>
                <option value="large">크게</option>
              </select>
            </GridCol>
            <GridCol span={4}>
              <label className="block text-sm font-medium text-gray-700">
                정렬 방식
              </label>
              <select
                value={settings.alignment}
                onChange={(e) =>
                  updateSetting(
                    "alignment",
                    e.target.value as SettingsState["alignment"],
                  )
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              >
                <option value="left">왼쪽 정렬</option>
                <option value="center">가운데 정렬</option>
                <option value="right">오른쪽 정렬</option>
              </select>
            </GridCol>
            <GridCol span={4}>
              <label className="block text-sm font-medium text-gray-700">
                바코드 종류
              </label>
              <select
                value={settings.barcodeFormat}
                onChange={(e) =>
                  updateSetting(
                    "barcodeFormat",
                    e.target.value as SettingsState["barcodeFormat"],
                  )
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              >
                <option value="CODE128">CODE-128</option>
                <option value="EAN13">EAN-13</option>
                <option value="QRCODE">QR 코드</option>
              </select>
            </GridCol>
          </GridRow>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">출력 옵션</h2>
          <p className="text-sm text-gray-500">
            프린터 성능과 인쇄 품질에 따라 추가 옵션을 조정하세요.
          </p>
          <GridRow gutter={16} className="mt-4">
            <GridCol span={3}>
              <label className="block text-sm font-medium text-gray-700">
                출력 매수
              </label>
              <input
                type="number"
                min={1}
                max={999}
                value={settings.copies}
                onChange={(e) =>
                  updateSetting("copies", Math.max(1, Number(e.target.value) || 1))
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              />
            </GridCol>
            <GridCol span={3}>
              <label className="block text-sm font-medium text-gray-700">
                프린터 밀도
              </label>
              <select
                value={settings.density}
                onChange={(e) =>
                  updateSetting("density", e.target.value as SettingsState["density"])
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              >
                <option value="203dpi">203 dpi</option>
                <option value="300dpi">300 dpi</option>
              </select>
            </GridCol>
            <GridCol span={3}>
              <label className="block text-sm font-medium text-gray-700">
                열전사 모드
              </label>
              <label className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2">
                <input
                  type="checkbox"
                  checked={settings.thermalMode}
                  onChange={() => toggleSetting("thermalMode")}
                />
                <span className="text-sm text-gray-700">라벨 프린터(감열/열전사) 사용</span>
              </label>
            </GridCol>
            <GridCol span={3}>
              <label className="block text-sm font-medium text-gray-700">
                보조 표시
              </label>
              <label className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2">
                <input
                  type="checkbox"
                  checked={settings.showGuidelines}
                  onChange={() => toggleSetting("showGuidelines")}
                />
                <span className="text-sm text-gray-700">커팅 가이드 표시</span>
              </label>
            </GridCol>
          </GridRow>
        </section>
      </Card>

      <Card padding="lg">
        <h2 className="text-xl font-semibold text-gray-900">인쇄 미리보기</h2>
        <p className="mt-2 text-sm text-gray-500">
          실제 인쇄 시 라벨 배치가 어떻게 보일지 간단히 확인할 수 있습니다.
          수치를 변경하면 다음 인쇄부터 적용됩니다.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6">
            <div className="text-xs uppercase tracking-wide text-gray-400">
              라벨 배치
            </div>
            <div className="mt-4 grid flex-1 place-items-center rounded-md border border-gray-200 bg-gray-50 p-4">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${settings.columns}, minmax(60px, 1fr))`,
                  gridTemplateRows: `repeat(${settings.rows}, minmax(40px, 1fr))`,
                }}
              >
                {Array.from({ length: settings.columns * settings.rows }).map(
                  (_, idx) => (
                    <div
                      key={idx}
                      className="flex h-16 items-center justify-center rounded border border-gray-300 bg-white text-[10px] text-gray-500"
                    >
                      LABEL
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6">
            <div className="text-xs uppercase tracking-wide text-gray-400">
              텍스트 구성
            </div>
            <div className="mt-4 space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              {settings.includeBrand && <div>Brand Name</div>}
              {settings.includeProductName && <div>상품명 예시</div>}
              {settings.includeOptionName && <div>옵션명 예시</div>}
              {settings.includeSku && <div>SKU-000000</div>}
              {settings.includePrice && <div>₩19,900</div>}
              <div className="mt-4 flex h-16 items-center justify-center rounded border border-gray-300 bg-white text-xs text-gray-500">
                {settings.barcodeFormat} PREVIEW
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" onClick={handleSave}>
            설정 저장
          </Button>
          <Button variant="outline" onClick={handleReset}>
            기본값으로 초기화
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default BarcodeSettingsPage;
