import React from "react";
import { Container, Card, Button, Input } from "../../design-system";

type Brand = { id: string; name: string };
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
  { id: "b1", name: "ACME" },
  { id: "b2", name: "오렌지샵" },
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

export default function BasicMetadataSettings() {
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
    if (!v) return;
    setBrands((s) => [{ id: makeId("b"), name: v }, ...s]);
    setNewBrand("");
  };

  const removeBrand = (id: string) =>
    setBrands((s) => s.filter((x) => x.id !== id));

  const addYear = () => {
    const val = newYear.trim();
    if (!val) return;
    setYears((s) => [{ id: makeId("y"), name: val }, ...s]);
    setNewYear("");
  };

  const removeYear = (id: string) => {
    setYears((s) => s.filter((x) => x.id !== id));
    setSeasons((s) =>
      s.map((se) => (se.yearId === id ? { ...se, yearId: undefined } : se)),
    );
  };

  const addSeason = () => {
    const val = newSeason.trim();
    const yearId = newSeasonYear;
    if (!val) return;
    if (!yearId) {
      alert("시즌을 추가하려면 연도를 선택하세요.");
      return;
    }
    setSeasons((s) => [
      { id: makeId("s"), name: val, yearId },
      ...s,
    ]);
    setNewSeason("");
  };

  const removeSeason = (id: string) =>
    setSeasons((s) => s.filter((x) => x.id !== id));

  return (
    <Container maxWidth="full" centered={false} padding="md">
      <h1 className="text-2xl font-bold mb-4">브랜드 · 연도 · 시즌 관리</h1>

      <div className="text-sm text-gray-600 mb-6">
        브랜드, 연도, 시즌 정보를 관리합니다.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 브랜드 관리 */}
        <Card padding="md">
          <h2 className="text-lg font-semibold mb-4">브랜드</h2>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="브랜드명"
              value={newBrand}
              onChange={(e: any) => setNewBrand(e.target.value)}
            />
            <Button onClick={addBrand}>추가</Button>
          </div>
          <div className="space-y-2 max-h-80 overflow-auto">
            {brands.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>{b.name}</div>
                <Button variant="ghost" onClick={() => removeBrand(b.id)}>
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* 연도 관리 */}
        <Card padding="md">
          <h2 className="text-lg font-semibold mb-4">연도</h2>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="연도 (예: 2026)"
              value={newYear}
              onChange={(e: any) => setNewYear(e.target.value)}
            />
            <Button onClick={addYear}>추가</Button>
          </div>
          <div className="space-y-2 max-h-80 overflow-auto">
            {years.map((y) => (
              <div
                key={y.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>{y.name}</div>
                <Button variant="ghost" onClick={() => removeYear(y.id)}>
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* 시즌 관리 */}
        <Card padding="md">
          <h2 className="text-lg font-semibold mb-4">시즌</h2>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="시즌명 (예: SS)"
              value={newSeason}
              onChange={(e: any) => setNewSeason(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2"
              value={newSeasonYear}
              onChange={(e) => setNewSeasonYear(e.target.value)}
            >
              <option value="">연도 선택</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
            <Button onClick={addSeason}>추가</Button>
          </div>
          <div className="space-y-2 max-h-80 overflow-auto">
            {seasons.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center gap-2">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-gray-500">
                    {s.yearId
                      ? (years.find((y) => y.id === s.yearId)?.name ?? "삭제된 연도")
                      : "연도 미지정"}
                  </div>
                </div>
                <Button variant="ghost" onClick={() => removeSeason(s.id)}>
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Container>
  );
}
