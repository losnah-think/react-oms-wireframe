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
  brands: { label: "브랜드 관리", icon: "🏷️", color: "blue" },
  years: { label: "연도 관리", icon: "📅", color: "green" },
  seasons: { label: "시즌 관리", icon: "🌸", color: "purple" }
};

export default function BasicMetadataSettings() {
  const [activeTab, setActiveTab] = React.useState<typeof Tabs[number]>("brands");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editCode, setEditCode] = React.useState("");

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

  // Memoized calculations
  const seasonsWithYear = React.useMemo(() =>
    seasons.filter(s => s.yearId),
    [seasons]
  );

  const seasonsWithoutYear = React.useMemo(() =>
    seasons.filter(s => !s.yearId),
    [seasons]
  );

  const seasonsByYear = React.useMemo(() => {
    const grouped = new Map<string, Season[]>();
    seasons.forEach(s => {
      if (s.yearId) {
        const existing = grouped.get(s.yearId) || [];
        grouped.set(s.yearId, [...existing, s]);
      }
    });
    return grouped;
  }, [seasons]);

  // Filtered data based on search
  const filteredBrands = React.useMemo(() =>
    brands.filter(b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.code && b.code.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [brands, searchTerm]
  );

  const filteredYears = React.useMemo(() =>
    years.filter(y => y.name.includes(searchTerm)),
    [years, searchTerm]
  );

  const filteredSeasons = React.useMemo(() =>
    seasons.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [seasons, searchTerm]
  );

  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.BRANDS, JSON.stringify(brands));
  }, [brands]);
  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.YEARS, JSON.stringify(years));
  }, [years]);
  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.SEASONS, JSON.stringify(seasons));
  }, [seasons]);

  const addBrand = React.useCallback(() => {
    const v = newBrand.trim();
    if (!v) return alert("브랜드 이름을 입력하세요");
    setBrands((s) => [{ id: makeId("b"), name: v, code: newCode.trim() || undefined }, ...s]);
    setNewBrand("");
    setNewCode("");
  }, [newBrand, newCode]);

  const removeBrand = React.useCallback((id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setBrands((s) => s.filter((x) => x.id !== id));
  }, []);

  const startEditBrand = React.useCallback((brand: Brand) => {
    setEditingId(brand.id);
    setEditName(brand.name);
    setEditCode(brand.code || "");
  }, []);

  const saveEditBrand = React.useCallback(() => {
    if (!editName.trim()) return alert("브랜드 이름을 입력하세요");
    setBrands((s) =>
      s.map((b) =>
        b.id === editingId
          ? { ...b, name: editName.trim(), code: editCode.trim() || undefined }
          : b
      )
    );
    setEditingId(null);
    setEditName("");
    setEditCode("");
  }, [editingId, editName, editCode]);

  const cancelEdit = React.useCallback(() => {
    setEditingId(null);
    setEditName("");
    setEditCode("");
  }, []);

  const addYear = React.useCallback(() => {
    const val = newYear.trim();
    if (!val) return alert("연도를 입력하세요");
    if (!/^\d{4}$/.test(val)) return alert("4자리 숫자로 입력하세요");
    if (years.some(y => y.name === val)) return alert("이미 존재하는 연도입니다");
    setYears((s) => [{ id: makeId("y"), name: val }, ...s]);
    setNewYear("");
  }, [newYear, years]);

  const removeYear = React.useCallback((id: string) => {
    const linkedSeasons = seasons.filter(s => s.yearId === id);
    if (linkedSeasons.length > 0) {
      if (!confirm(`이 연도에 ${linkedSeasons.length}개의 시즌이 연결되어 있습니다. 삭제하시겠습니까?`)) return;
    } else {
      if (!confirm("삭제하시겠습니까?")) return;
    }
    setYears((s) => s.filter((x) => x.id !== id));
    setSeasons((s) =>
      s.map((se) => (se.yearId === id ? { ...se, yearId: undefined } : se)),
    );
  }, [seasons]);

  const addSeason = React.useCallback(() => {
    const val = newSeason.trim();
    const yearId = newSeasonYear;
    if (!val) return alert("시즌 이름을 입력하세요");
    if (!yearId) return alert("연도를 선택하세요");
    setSeasons((s) => [
      { id: makeId("s"), name: val, yearId },
      ...s,
    ]);
    setNewSeason("");
  }, [newSeason, newSeasonYear]);

  const removeSeason = React.useCallback((id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setSeasons((s) => s.filter((x) => x.id !== id));
  }, []);

  const updateSeasonYear = React.useCallback((seasonId: string, newYearId: string) => {
    setSeasons((s) =>
      s.map((se) => (se.id === seasonId ? { ...se, yearId: newYearId || undefined } : se))
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">기본 정보 관리</h1>
              <p className="text-gray-500 mt-1">브랜드, 연도, 시즌 정보를 관리합니다</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">전체 데이터</div>
                <div className="text-2xl font-bold text-gray-900">
                  {brands.length + years.length + seasons.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 py-3">
            {Tabs.map((tab) => {
              const config = TAB_CONFIG[tab];
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearchTerm("");
                    cancelEdit();
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? `bg-${config.color}-600 text-white shadow-md`
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span>{config.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tab === 'brands' ? brands.length : tab === 'years' ? years.length : seasons.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 브랜드 탭 */}
        {activeTab === "brands" && (
          <div className="space-y-4">
            {/* 추가 폼 & 검색 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">새 브랜드 추가</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="브랜드 이름"
                      value={newBrand}
                      onChange={(e: any) => setNewBrand(e.target.value)}
                      onKeyPress={(e: any) => e.key === 'Enter' && !e.shiftKey && addBrand()}
                      className="flex-1"
                    />
                    <Input
                      placeholder="코드"
                      value={newCode}
                      onChange={(e: any) => setNewCode(e.target.value)}
                      onKeyPress={(e: any) => e.key === 'Enter' && !e.shiftKey && addBrand()}
                      className="w-32"
                    />
                    <Button onClick={addBrand} variant="primary">
                      추가
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">검색</h3>
                  <Input
                    placeholder="브랜드 이름 또는 코드 검색..."
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 브랜드 테이블 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">브랜드명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBrands.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                          {searchTerm ? "검색 결과가 없습니다" : "등록된 브랜드가 없습니다"}
                        </td>
                      </tr>
                    ) : (
                      filteredBrands.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            {editingId === b.id ? (
                              <Input
                                value={editName}
                                onChange={(e: any) => setEditName(e.target.value)}
                                onKeyPress={(e: any) => {
                                  if (e.key === 'Enter') saveEditBrand();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                autoFocus
                                className="w-full"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{b.name}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingId === b.id ? (
                              <Input
                                value={editCode}
                                onChange={(e: any) => setEditCode(e.target.value)}
                                onKeyPress={(e: any) => {
                                  if (e.key === 'Enter') saveEditBrand();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="w-32"
                              />
                            ) : (
                              <span className="text-gray-600">{b.code || "-"}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {editingId === b.id ? (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={saveEditBrand}
                                  className="text-green-600 hover:text-green-700 font-medium text-sm"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => startEditBrand(b)}
                                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => removeBrand(b.id)}
                                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 연도 탭 */}
        {activeTab === "years" && (
          <div className="space-y-4">
            {/* 추가 폼 & 검색 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">새 연도 추가</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="연도 (예: 2025)"
                      value={newYear}
                      onChange={(e: any) => setNewYear(e.target.value)}
                      onKeyPress={(e: any) => e.key === 'Enter' && addYear()}
                      className="flex-1"
                    />
                    <Button onClick={addYear} variant="primary">
                      추가
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">검색</h3>
                  <Input
                    placeholder="연도 검색..."
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 연도 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredYears.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="text-5xl mb-4">📅</div>
                  <div className="text-gray-500">
                    {searchTerm ? "검색 결과가 없습니다" : "등록된 연도가 없습니다"}
                  </div>
                </div>
              ) : (
                filteredYears.map((y) => {
                  const linkedSeasons = seasons.filter(s => s.yearId === y.id);
                  return (
                    <div key={y.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                      <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-green-800">{y.name}년</div>
                          <button
                            onClick={() => removeYear(y.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-gray-600 mb-2">연결된 시즌 ({linkedSeasons.length}개)</div>
                        {linkedSeasons.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {linkedSeasons.map((s) => (
                              <span
                                key={s.id}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">없음</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 시즌 탭 */}
        {activeTab === "seasons" && (
          <div className="space-y-4">
            {/* 추가 폼 & 검색 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">새 시즌 추가</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="시즌 이름 (예: SS, FW)"
                      value={newSeason}
                      onChange={(e: any) => setNewSeason(e.target.value)}
                      onKeyPress={(e: any) => e.key === 'Enter' && addSeason()}
                      className="flex-1"
                    />
                    <select
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <Button onClick={addSeason} variant="primary">
                      추가
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">검색</h3>
                  <Input
                    placeholder="시즌 이름 검색..."
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 시즌 테이블 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">시즌명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">연도</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSeasons.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                          {searchTerm ? "검색 결과가 없습니다" : "등록된 시즌이 없습니다"}
                        </td>
                      </tr>
                    ) : (
                      filteredSeasons.map((s) => {
                        const linkedYear = years.find(y => y.id === s.yearId);
                        return (
                          <tr key={s.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-purple-500">🌸</span>
                                <span className="font-medium text-gray-900">{s.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                value={s.yearId || ""}
                                onChange={(e) => updateSeasonYear(s.id, e.target.value)}
                              >
                                <option value="">미지정</option>
                                {years.map((y) => (
                                  <option key={y.id} value={y.id}>
                                    {y.name}년
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => removeSeason(s.id)}
                                className="text-red-600 hover:text-red-700 font-medium text-sm"
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
