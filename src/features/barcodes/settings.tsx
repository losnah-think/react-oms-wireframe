import React from "react";
import { Container, Card, Button, GridRow, GridCol } from "../../design-system";

const STORAGE_KEY = "barcode_settings_v1";

const defaultSettings = {
  autoGenerate: true,
  showProductName: true,
  showSku: true,
  labelWidth: 50,
  labelHeight: 30,
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
      setStatusMessage("설정이 저장되었습니다.");
    } catch (err) {
      setStatusMessage("설정 저장에 실패했습니다.");
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setStatusMessage("기본값으로 초기화했습니다.");
  };

  React.useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  return (
    <Container maxWidth="xl" padding="lg" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">바코드 설정</h1>
        <p className="mt-2 text-gray-600">
          바코드 관리 기본 설정을 구성합니다.
        </p>
        {statusMessage && (
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
            {statusMessage}
          </div>
        )}
      </div>

      <Card padding="lg" className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">기본 설정</h2>
          <p className="text-sm text-gray-500 mb-4">
            바코드 관리의 기본 동작을 설정합니다.
          </p>

          <div className="space-y-4">
            <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.autoGenerate}
                onChange={() => toggleSetting("autoGenerate")}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">자동 바코드 생성</span>
                <p className="text-xs text-gray-500">새 상품 등록 시 바코드를 자동으로 생성합니다.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.showProductName}
                onChange={() => toggleSetting("showProductName")}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">상품명 표시</span>
                <p className="text-xs text-gray-500">바코드 목록에서 상품명을 표시합니다.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.showSku}
                onChange={() => toggleSetting("showSku")}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">SKU 표시</span>
                <p className="text-xs text-gray-500">바코드 목록에서 SKU를 표시합니다.</p>
              </div>
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">라벨 크기</h2>
          <p className="text-sm text-gray-500 mb-4">
            바코드 라벨의 기본 크기를 설정합니다.
          </p>

          <GridRow gutter={16}>
            <GridCol span={6}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가로 (mm)
              </label>
              <input
                type="number"
                min={20}
                max={200}
                value={settings.labelWidth}
                onChange={(e) =>
                  updateSetting("labelWidth", Number(e.target.value) || 50)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              />
            </GridCol>
            <GridCol span={6}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                세로 (mm)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={settings.labelHeight}
                onChange={(e) =>
                  updateSetting("labelHeight", Number(e.target.value) || 30)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
              />
            </GridCol>
          </GridRow>
        </section>
      </Card>

      <div className="flex gap-3">
        <Button variant="primary" onClick={handleSave}>
          설정 저장
        </Button>
        <Button variant="outline" onClick={handleReset}>
          기본값으로 초기화
        </Button>
      </div>
    </Container>
  );
};

export default BarcodeSettingsPage;
