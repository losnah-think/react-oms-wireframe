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

const defaultBrands: Brand[] = [];

const defaultYears: Year[] = [
  { id: "y2024", name: "2024" },
  { id: "y2025", name: "2025" },
  { id: "y2026", name: "2026" },
];

const defaultSeasons: Season[] = [
  { id: "s1", name: "SS", yearId: "y2024" },
  { id: "s2", name: "FW", yearId: "y2024" },
  { id: "s3", name: "SS", yearId: "y2025" },
  { id: "s4", name: "FW", yearId: "y2025" },
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

export default function BasicMetadataSettings() {
  const [activeTab, setActiveTab] = React.useState<"brands" | "years" | "seasons">("brands");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editCode, setEditCode] = React.useState("");
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);

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
  const [newBrandCode, setNewBrandCode] = React.useState("");
  const [newYear, setNewYear] = React.useState("");
  const [newSeason, setNewSeason] = React.useState("");
  const [newSeasonYear, setNewSeasonYear] = React.useState<string>("");

  // 브랜드 코드 자동 생성 함수 (프리픽스 + 이니셜 + 난수)
  const generateBrandCode = (brandName: string, existingBrands: Brand[] = []): string => {
    // 브랜드명에서 이니셜 추출
    const getInitials = (name: string): string => {
      const words = name.trim().split(/\s+/);
      let initials = '';
      
      for (const word of words) {
        if (word.length > 0) {
          if (/[가-힣]/.test(word[0])) {
            initials += word[0];
          } else {
            initials += word[0].toUpperCase();
          }
        }
      }
      
      return initials.substring(0, 3);
    };

    // 프리픽스 생성
    const getPrefix = (name: string): string => {
      const cleanName = name.replace(/[^가-힣a-zA-Z0-9]/g, '');
      if (cleanName.length >= 2) {
        return cleanName.substring(0, 2).toUpperCase();
      }
      return cleanName.toUpperCase() || 'BR';
    };

    // 4자리 난수 생성
    const generateRandomSuffix = (): string => {
      return Math.floor(1000 + Math.random() * 9000).toString();
    };

    const prefix = getPrefix(brandName);
    const initials = getInitials(brandName);
    const randomSuffix = generateRandomSuffix();
    
    let baseCode = `${prefix}${initials}${randomSuffix}`;
    
    if (baseCode.length > 12) {
      baseCode = baseCode.substring(0, 12);
    }

    return ensureUniqueCode(baseCode, existingBrands);
  };

  // 고유한 코드를 보장하는 함수
  const ensureUniqueCode = (baseCode: string, existingBrands: Brand[]): string => {
    const existingCodes = existingBrands.map(b => b.code).filter(Boolean);
    
    if (!existingCodes.includes(baseCode)) {
      return baseCode;
    }

    let attempts = 0;
    let newCode = baseCode;
    
    while (existingCodes.includes(newCode) && attempts < 10) {
      const prefix = baseCode.substring(0, baseCode.length - 4);
      const newRandomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
      newCode = `${prefix}${newRandomSuffix}`;
      attempts++;
    }
    
    if (existingCodes.includes(newCode)) {
      let counter = 1;
      let finalCode = `${baseCode.substring(0, baseCode.length - 4)}${counter.toString().padStart(4, '0')}`;
      
      while (existingCodes.includes(finalCode)) {
        counter++;
        finalCode = `${baseCode.substring(0, baseCode.length - 4)}${counter.toString().padStart(4, '0')}`;
      }
      
      return finalCode;
    }
    
    return newCode;
  };

  // LocalStorage 저장
  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.BRANDS, JSON.stringify(brands));
  }, [brands]);
  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.YEARS, JSON.stringify(years));
  }, [years]);
  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.SEASONS, JSON.stringify(seasons));
  }, [seasons]);

  // 브랜드 관리
  const addBrand = () => {
    if (!newBrand.trim() || !newBrandCode.trim()) return;
    const brandName = newBrand.trim();
    const brandCode = newBrandCode.trim().toUpperCase();
    
    // 중복 체크
    if (brands.some(b => b.code === brandCode)) {
      alert("이미 존재하는 브랜드 코드입니다.");
      return;
    }
    
    setBrands(prev => [{ id: makeId("b"), name: brandName, code: brandCode }, ...prev]);
    setNewBrand("");
    setNewBrandCode("");
    setShowAddForm(false);
  };

  const removeBrand = (id: string) => {
    setBrands(prev => prev.filter(b => b.id !== id));
    setShowDeleteConfirm(null);
  };

  const startEditBrand = (brand: Brand) => {
    setEditingId(brand.id);
    setEditName(brand.name);
    setEditCode(brand.code || "");
  };

  const saveEditBrand = () => {
    if (!editName.trim() || !editCode.trim()) return;
    const brandName = editName.trim();
    const brandCode = editCode.trim().toUpperCase();
    
    // 중복 체크 (현재 편집 중인 브랜드 제외)
    if (brands.some(b => b.id !== editingId && b.code === brandCode)) {
      alert("이미 존재하는 브랜드 코드입니다.");
      return;
    }
    
    setBrands(prev => prev.map(b => 
      b.id === editingId 
        ? { ...b, name: brandName, code: brandCode }
        : b
    ));
    setEditingId(null);
    setEditName("");
    setEditCode("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCode("");
  };

  // 연도 관리
  const addYear = () => {
    if (!newYear.trim() || !/^\d{4}$/.test(newYear.trim())) return;
    if (years.some(y => y.name === newYear.trim())) return;
    setYears(prev => [{ id: makeId("y"), name: newYear.trim() }, ...prev]);
    setNewYear("");
    setShowAddForm(false);
  };

  const removeYear = (id: string) => {
    setYears(prev => prev.filter(y => y.id !== id));
    setSeasons(prev => prev.map(s => s.yearId === id ? { ...s, yearId: undefined } : s));
    setShowDeleteConfirm(null);
  };

  // 시즌 관리
  const addSeason = () => {
    if (!newSeason.trim() || !newSeasonYear) return;
    setSeasons(prev => [{ id: makeId("s"), name: newSeason.trim(), yearId: newSeasonYear }, ...prev]);
    setNewSeason("");
    setNewSeasonYear("");
    setShowAddForm(false);
  };

  const removeSeason = (id: string) => {
    setSeasons(prev => prev.filter(s => s.id !== id));
    setShowDeleteConfirm(null);
  };

  const updateSeasonYear = (seasonId: string, yearId: string) => {
    setSeasons(prev => prev.map(s => 
      s.id === seasonId ? { ...s, yearId: yearId || undefined } : s
    ));
  };

  const resetToDefaults = () => {
    if (confirm("기본값으로 초기화하시겠습니까? 모든 변경사항이 사라집니다.")) {
      setBrands(defaultBrands);
      setYears(defaultYears);
      setSeasons(defaultSeasons);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">기본 정보 관리</h1>
              <p className="text-gray-600 mt-1">브랜드, 연도, 시즌을 관리합니다</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetToDefaults}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
              >
                기본값 복원
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {[
              { key: "brands", label: "브랜드", count: brands.length },
              { key: "years", label: "연도", count: years.length },
              { key: "seasons", label: "시즌", count: seasons.length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key as any);
                  cancelEdit();
                  setShowAddForm(false);
                }}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeTab === key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 브랜드 탭 */}
        {activeTab === "brands" && (
          <div className="space-y-4">
            {/* 추가 버튼 */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">브랜드 목록</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                {showAddForm ? "취소" : "브랜드 추가"}
              </button>
            </div>

            {/* 추가 폼 */}
            {showAddForm && (
              <div className="bg-white rounded-lg border p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      브랜드 이름
                    </label>
                    <Input
                      placeholder="브랜드 이름을 입력하세요"
                      value={newBrand}
                      onChange={(e: any) => setNewBrand(e.target.value)}
                      onKeyPress={(e: any) => e.key === 'Enter' && addBrand()}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      브랜드 코드
                    </label>
                    <Input
                      placeholder="브랜드 코드를 입력하세요 (대문자만)"
                      value={newBrandCode}
                      onChange={(e: any) => setNewBrandCode(e.target.value.toUpperCase())}
                      onKeyPress={(e: any) => e.key === 'Enter' && addBrand()}
                      className="w-full font-mono"
                      style={{ textTransform: 'uppercase' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">영문 대문자와 숫자만 입력 가능합니다</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addBrand} disabled={!newBrand.trim() || !newBrandCode.trim()}>
                      추가
                    </Button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewBrand("");
                        setNewBrandCode("");
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 브랜드 목록 */}
            {brands.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <p className="text-gray-500 mb-2">등록된 브랜드가 없습니다</p>
                <button 
                  onClick={() => setShowAddForm(true)} 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  첫 번째 브랜드 추가하기
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">브랜드명</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">코드</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brands.map((brand) => (
                        <tr key={brand.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {editingId === brand.id ? (
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
                              <span className="text-sm font-medium">{brand.name}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingId === brand.id ? (
                              <Input
                                value={editCode}
                                onChange={(e: any) => setEditCode(e.target.value.toUpperCase())}
                                onKeyPress={(e: any) => {
                                  if (e.key === 'Enter') saveEditBrand();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="w-full font-mono"
                                style={{ textTransform: 'uppercase' }}
                              />
                            ) : (
                              <span className="text-sm text-gray-500 font-mono">{brand.code}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {editingId === brand.id ? (
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={saveEditBrand} 
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  저장
                                </button>
                                <button 
                                  onClick={cancelEdit} 
                                  className="text-gray-600 hover:text-gray-800 text-sm"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => startEditBrand(brand)} 
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  수정
                                </button>
                                <button 
                                  onClick={() => setShowDeleteConfirm(brand.id)} 
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 연도 탭 */}
        {activeTab === "years" && (
          <div className="space-y-4">
            {/* 추가 버튼 */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">연도 목록</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                {showAddForm ? "취소" : "연도 추가"}
              </button>
            </div>

            {/* 추가 폼 */}
            {showAddForm && (
              <div className="bg-white rounded-lg border p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연도
                    </label>
                    <Input
                      placeholder="예: 2025"
                      value={newYear}
                      onChange={(e: any) => setNewYear(e.target.value)}
                      onKeyPress={(e: any) => e.key === 'Enter' && addYear()}
                      className="w-32"
                    />
                    <p className="text-xs text-gray-500 mt-1">4자리 연도를 입력하세요</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addYear} disabled={!newYear.trim() || !/^\d{4}$/.test(newYear.trim())}>
                      추가
                    </Button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 연도 목록 */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">연도</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">연결된 시즌</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {years
                      .sort((a, b) => parseInt(b.name) - parseInt(a.name))
                      .map((year) => {
                        const linkedSeasons = seasons.filter(s => s.yearId === year.id);
                        return (
                          <tr key={year.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium">{year.name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-500">{linkedSeasons.length}개</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => setShowDeleteConfirm(year.id)} 
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 시즌 탭 */}
        {activeTab === "seasons" && (
          <div className="space-y-4">
            {/* 추가 버튼 */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">시즌 목록</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                disabled={years.length === 0}
              >
                {showAddForm ? "취소" : "시즌 추가"}
              </button>
            </div>

            {/* 추가 폼 */}
            {showAddForm && (
              <div className="bg-white rounded-lg border p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시즌 이름
                    </label>
                    <Input
                      placeholder="예: SS, FW"
                      value={newSeason}
                      onChange={(e: any) => setNewSeason(e.target.value)}
                      onKeyPress={(e: any) => e.key === 'Enter' && addSeason()}
                      className="w-32"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연도
                    </label>
                    <select
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                      value={newSeasonYear}
                      onChange={(e) => setNewSeasonYear(e.target.value)}
                    >
                      <option value="">연도를 선택하세요</option>
                      {years.map((year) => (
                        <option key={year.id} value={year.id}>{year.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={addSeason} 
                      disabled={!newSeason.trim() || !newSeasonYear}
                    >
                      추가
                    </Button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 연도별 시즌 그룹 */}
            {years.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <p className="text-gray-500 mb-2">먼저 연도를 추가해주세요</p>
                <button 
                  onClick={() => setActiveTab('years')} 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  연도 관리로 이동
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {years
                  .sort((a, b) => parseInt(b.name) - parseInt(a.name))
                  .map((year) => {
                    const yearSeasons = seasons.filter(s => s.yearId === year.id);
                    return (
                      <div key={year.id} className="bg-white rounded-lg border">
                        <div className="px-4 py-3 bg-gray-50 border-b">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{year.name}년</h3>
                            <span className="text-sm text-gray-500">{yearSeasons.length}개 시즌</span>
                          </div>
                        </div>
                        <div className="p-4">
                          {yearSeasons.length === 0 ? (
                            <p className="text-gray-500 text-sm">등록된 시즌이 없습니다</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {yearSeasons.map((season) => (
                                <div key={season.id} className="flex items-center gap-2 bg-gray-100 rounded px-3 py-2">
                                  <span className="text-sm font-medium">{season.name}</span>
                                  <button 
                                    onClick={() => setShowDeleteConfirm(season.id)}
                                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                
                {/* 연도 미지정 시즌 */}
                {seasons.filter(s => !s.yearId).length > 0 && (
                  <div className="bg-white rounded-lg border">
                    <div className="px-4 py-3 bg-yellow-50 border-b">
                      <h3 className="font-medium text-yellow-800">연도 미지정 시즌</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {seasons
                          .filter(s => !s.yearId)
                          .map((season) => (
                            <div key={season.id} className="flex items-center gap-2 bg-yellow-100 rounded px-3 py-2">
                              <span className="text-sm font-medium">{season.name}</span>
                              <select
                                className="text-xs border border-gray-300 rounded px-1 py-1"
                                value=""
                                onChange={(e) => updateSeasonYear(season.id, e.target.value)}
                              >
                                <option value="">연도 선택</option>
                                {years.map((y) => (
                                  <option key={y.id} value={y.id}>{y.name}</option>
                                ))}
                              </select>
                              <button 
                                onClick={() => setShowDeleteConfirm(season.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">삭제 확인</h3>
            <p className="text-gray-600 mb-4">
              이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (activeTab === "brands") removeBrand(showDeleteConfirm);
                  else if (activeTab === "years") removeYear(showDeleteConfirm);
                  else if (activeTab === "seasons") removeSeason(showDeleteConfirm);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
