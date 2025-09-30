import React from "react";
import { Container, Card, Button, Input } from "../../design-system";

type Brand = { id: string; name: string; code?: string };
type Year = { id: string; name: string };
type Season = { id: string; name: string; yearId?: string };

const makeId = (prefix = "") =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const LS_KEYS = {
  BRANDS: "basic_brands_v1",
  YEARS: "basic_years_v1",
  SEASONS: "basic_seasons_v1",
};

const defaultBrands: Brand[] = [
  { id: "b1", name: "ACME", code: "ACM" },
  { id: "b2", name: "오렌지샵", code: "ORS" },
];
const defaultYears: Year[] = [
  { id: "y2024", name: "2024" },
  { id: "y2025", name: "2025" },
];
const defaultSeasons: Season[] = [
  { id: "s1", name: "SS", yearId: "y2024" },
  { id: "s2", name: "FW", yearId: "y2024" },
];

function loadOrDefault<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    return fallback;
  }
}

const Tabs = ["brands", "years", "seasons"] as const;

const TAB_CONFIG = {
  brands: { label: "브랜드", icon: "🏷️" },
  years: { label: "연도", icon: "📅" },
  seasons: { label: "시즌", icon: "🌸" }
};

export default function BasicMetadataSettings() {
  const [activeTab, setActiveTab] = React.useState<typeof Tabs[number]>("brands");

  const [brands, setBrands] = React.useState<Brand[]>(() =>
    loadOrDefault<Brand[]>(LS_KEYS.BRANDS, defaultBrands),
  );
  const [years, setYears] = React.useState<Year[]>(() =>
    loadOrDefault<Year[]>(LS_KEYS.YEARS, defaultYears),
  );
  const [seasons, setSeasons] = React.useState<Season[]>(() =>
    loadOrDefault<Season[]>(LS_KEYS.SEASONS, defaultSeasons),
  );

  const [newBrand, setNewBrand] = React.useState("");
  const [newCode, setNewCode] = React.useState("");
  const [newYear, setNewYear] = React.useState("");
  const [newSeason, setNewSeason] = React.useState("");
  const [newSeasonYear, setNewSeasonYear] = React.useState<string>(() => {
    const initial = loadOrDefault<Year[]>(LS_KEYS.YEARS, defaultYears);
    return (initial && initial[0] && initial[0].id) || "";
  });

  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.BRANDS, JSON.stringify(brands));
  }, [brands]);
  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.YEARS, JSON.stringify(years));
  }, [years]);
  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.SEASONS, JSON.stringify(seasons));
  }, [seasons]);

  const addBrand = () => {
    const v = newBrand.trim();
    if (!v) return alert("브랜드 이름을 입력하세요");
    setBrands((s) => [{ id: makeId("b"), name: v, code: newCode.trim() || undefined }, ...s]);
    setNewBrand("");
    setNewCode("");
  };

  const removeBrand = (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setBrands((s) => s.filter((x) => x.id !== id));
  };

  const addYear = () => {
    const val = newYear.trim();
    if (!val) return alert("연도를 입력하세요");
    if (!/^\d{4}$/.test(val)) return alert("4자리 숫자로 입력하세요");
    setYears((s) => [{ id: makeId("y"), name: val }, ...s]);
    setNewYear("");
  };

  const removeYear = (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setYears((s) => s.filter((x) => x.id !== id));
    setSeasons((s) =>
      s.map((se) => (se.yearId === id ? { ...se, yearId: undefined } : se)),
    );
  };

  const addSeason = () => {
    const val = newSeason.trim();
    const yearId = newSeasonYear;
    if (!val) return alert("시즌 이름을 입력하세요");
    if (!yearId) {
      return alert("연도를 선택하세요");
    }
    setSeasons((s) => [
      { id: makeId("s"), name: val, yearId },
      ...s,
    ]);
    setNewSeason("");
  };

  const removeSeason = (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setSeasons((s) => s.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">기본 정보</h1>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 py-4">
            {Tabs.map((tab) => {
              const config = TAB_CONFIG[tab];
              const isActive = activeTab === tab;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-6 px-4 text-center rounded-lg font-semibold text-lg transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="text-3xl mb-2">{config.icon}</div>
                  <div>{config.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 브랜드 탭 */}
        {activeTab === "brands" && (
          <div className="space-y-6">
            {/* 통계 */}
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="text-5xl font-bold text-blue-600 mb-2">{brands.length}</div>
              <div className="text-gray-600">개 등록됨</div>
            </div>

            {/* 추가 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                <Input
                  placeholder="브랜드 이름"
                  value={newBrand}
                  onChange={(e: any) => setNewBrand(e.target.value)}
                  onKeyPress={(e: any) => e.key === 'Enter' && addBrand()}
                  fullWidth
                  size="lg"
                />
                <Input
                  placeholder="브랜드 코드 (선택)"
                  value={newCode}
                  onChange={(e: any) => setNewCode(e.target.value)}
                  onKeyPress={(e: any) => e.key === 'Enter' && addBrand()}
                  fullWidth
                  size="lg"
                />
                <Button onClick={addBrand} fullWidth size="big">
                  ➕ 브랜드 추가
                </Button>
              </div>
            </div>

            {/* 목록 */}
            <div className="space-y-3">
              {brands.length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <div className="text-5xl mb-4">📦</div>
                  <div className="text-gray-400">등록된 브랜드가 없습니다</div>
                </div>
              )}
              {brands.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-center justify-between"
                >
                  <div>
                    <div className="text-xl font-bold text-gray-900 mb-1">{b.name}</div>
                    <div className="text-gray-500">코드: {b.code || "없음"}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="big"
                    onClick={() => removeBrand(b.id)}
                  >
                    🗑️ 삭제
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 연도 탭 */}
        {activeTab === "years" && (
          <div className="space-y-6">
            {/* 통계 */}
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="text-5xl font-bold text-green-600 mb-2">{years.length}</div>
              <div className="text-gray-600">개 등록됨</div>
            </div>

            {/* 추가 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                <Input
                  placeholder="연도 (예: 2025)"
                  value={newYear}
                  onChange={(e: any) => setNewYear(e.target.value)}
                  onKeyPress={(e: any) => e.key === 'Enter' && addYear()}
                  fullWidth
                  size="lg"
                />
                <Button onClick={addYear} fullWidth size="big">
                  ➕ 연도 추가
                </Button>
              </div>
            </div>

            {/* 목록 */}
            <div className="space-y-3">
              {years.length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <div className="text-5xl mb-4">📆</div>
                  <div className="text-gray-400">등록된 연도가 없습니다</div>
                </div>
              )}
              {years.map((y) => {
                const linkedSeasons = seasons.filter(s => s.yearId === y.id).length;
                return (
                  <div
                    key={y.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xl font-bold text-gray-900 mb-1">{y.name}년</div>
                      <div className="text-gray-500">시즌: {linkedSeasons}개</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="big"
                      onClick={() => removeYear(y.id)}
                    >
                      🗑️ 삭제
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 시즌 탭 */}
        {activeTab === "seasons" && (
          <div className="space-y-6">
            {/* 통계 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <div className="text-5xl font-bold text-purple-600 mb-2">{seasons.length}</div>
                <div className="text-gray-600">전체</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-8 text-center shadow-sm">
                <div className="text-5xl font-bold text-orange-600 mb-2">
                  {seasons.filter(s => !s.yearId).length}
                </div>
                <div className="text-orange-700 font-medium">연도 미지정</div>
              </div>
            </div>

            {/* 추가 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                <Input
                  placeholder="시즌 이름 (예: SS, FW)"
                  value={newSeason}
                  onChange={(e: any) => setNewSeason(e.target.value)}
                  onKeyPress={(e: any) => e.key === 'Enter' && addSeason()}
                  fullWidth
                  size="lg"
                />
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newSeasonYear}
                  onChange={(e) => setNewSeasonYear(e.target.value)}
                >
                  <option value="">연도 선택</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}년
                    </option>
                  ))}
                </select>
                <Button onClick={addSeason} fullWidth size="big">
                  ➕ 시즌 추가
                </Button>
              </div>
            </div>

            {/* 목록 */}
            <div className="space-y-3">
              {seasons.length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <div className="text-5xl mb-4">🌺</div>
                  <div className="text-gray-400">등록된 시즌이 없습니다</div>
                </div>
              )}
              {seasons.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-900">{s.name}</div>
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      s.yearId 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {s.yearId
                        ? `${years.find((y) => y.id === s.yearId)?.name}년`
                        : "연도 미지정"}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="big"
                    onClick={() => removeSeason(s.id)}
                  >
                    🗑️ 삭제
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}