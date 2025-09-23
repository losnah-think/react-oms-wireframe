"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Container, Card, Input, Button } from "../../design-system";

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

type BasicMetadataTab = "brands" | "years" | "seasons";

interface BasicMetadataSettingsProps {
  /**
   * Initial tab to activate when no explicit `tab` query is provided.
   * Helpful when this unified page is reused for the legacy standalone routes.
   */
  initialTab?: BasicMetadataTab;
}

export default function BasicMetadataSettings({
  initialTab = "brands",
}: BasicMetadataSettingsProps) {
  const router = useRouter();
  // URL-driven UI state: tab, page, perPage, sort
  const queryTab =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("tab")
      : null;
  const initialTabFromQuery: BasicMetadataTab = (() => {
    if (queryTab === "brands" || queryTab === "years" || queryTab === "seasons") {
      return queryTab;
    }
    return initialTab;
  })();

  const [activeTab, setActiveTab] = useState<BasicMetadataTab>(initialTabFromQuery);
  const isAllView = activeTab === "brands"; // legacy placeholder; not used heavily
  const [page, setPage] = useState<number>(() =>
    Number(
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("page")) ||
        1,
    ),
  );
  const [perPage, setPerPage] = useState<number>(() =>
    Number(
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("perPage")) ||
        10,
    ),
  );
  const [sortBy, setSortBy] = useState<string>(
    () =>
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("sortBy")) ||
      "name",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    () =>
      (typeof window !== "undefined" &&
        (new URLSearchParams(window.location.search).get("sortDir") as any)) ||
      "asc",
  );
  const [brands, setBrands] = useState<Brand[]>(() =>
    loadOrDefault<Brand[]>(LS_KEYS.BRANDS, defaultBrands),
  );
  const [years, setYears] = useState<Year[]>(() =>
    loadOrDefault<Year[]>(LS_KEYS.YEARS, defaultYears),
  );
  const [seasons, setSeasons] = useState<Season[]>(() =>
    loadOrDefault<Season[]>(LS_KEYS.SEASONS, defaultSeasons),
  );

  const [newBrand, setNewBrand] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newSeason, setNewSeason] = useState("");
  // default to first year (if any) so the select doesn't shift layout
  const [newSeasonYear, setNewSeasonYear] = useState<string>(() => {
    const initial = loadOrDefault<Year[]>(LS_KEYS.YEARS, defaultYears);
    return (initial && initial[0] && initial[0].id) || "";
  });

  const [brandSearch, setBrandSearch] = useState("");

  // editing states
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editingBrandName, setEditingBrandName] = useState("");

  // Modal states
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isAddYearOpen, setIsAddYearOpen] = useState(false);
  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);

  // new values used by modals
  const [modalBrandName, setModalBrandName] = useState("");
  const [modalYearName, setModalYearName] = useState("");
  const [modalSeasonName, setModalSeasonName] = useState("");
  const [modalSeasonYear, setModalSeasonYear] = useState<string>(newSeasonYear || "");

  useEffect(() => {
    localStorage.setItem(LS_KEYS.BRANDS, JSON.stringify(brands));
  }, [brands]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.YEARS, JSON.stringify(years));
  }, [years]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.SEASONS, JSON.stringify(seasons));
  }, [seasons]);

  const addBrand = (val?: string) => {
    const v = (val ?? newBrand).trim();
    if (!v) return;
    setBrands((s) => [{ id: makeId("b"), name: v }, ...s]);
    setNewBrand("");
    setModalBrandName("");
    setIsAddBrandOpen(false);
  };

  const startEditBrand = (b: Brand) => {
    setEditingBrandId(b.id);
    setEditingBrandName(b.name);
  };
  const saveEditBrand = () => {
    if (!editingBrandId) return;
    setBrands((s) =>
      s.map((x) =>
        x.id === editingBrandId
          ? { ...x, name: editingBrandName.trim() || x.name }
          : x,
      ),
    );
    setEditingBrandId(null);
    setEditingBrandName("");
  };
  const cancelEditBrand = () => {
    setEditingBrandId(null);
    setEditingBrandName("");
  };

  const removeBrand = (id: string) =>
    setBrands((s) => s.filter((x) => x.id !== id));

  const addYear = () => {
    const val = modalYearName.trim() || newYear.trim();
    if (!val) return;
    setYears((s) => [{ id: makeId("y"), name: val }, ...s]);
    setNewYear("");
    setModalYearName("");
    setIsAddYearOpen(false);
  };
  const removeYear = (id: string) => {
    // when removing a year, also clear yearId from seasons
    setYears((s) => s.filter((x) => x.id !== id));
    setSeasons((s) =>
      s.map((se) => (se.yearId === id ? { ...se, yearId: undefined } : se)),
    );
  };

  const addSeason = () => {
    const val = modalSeasonName.trim() || newSeason.trim();
    const yearId = modalSeasonYear || newSeasonYear;
    if (!val) return;
    if (!yearId) {
      window.alert("새 시즌을 추가하려면 연도를 선택하세요.");
      return;
    }
    setSeasons((s) => [
      { id: makeId("s"), name: val, yearId },
      ...s,
    ]);
    setNewSeason("");
    setModalSeasonName("");
    setModalSeasonYear("");
    setIsAddSeasonOpen(false);
  };
  const removeSeason = (id: string) =>
    setSeasons((s) => s.filter((x) => x.id !== id));

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  // pagination + sorting helpers
  const sortItems = <T,>(items: T[], key: keyof T) => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...items].sort((a: any, b: any) => {
      const va = String(a[key] ?? "").toLowerCase();
      const vb = String(b[key] ?? "").toLowerCase();
      return va < vb ? -1 * dir : va > vb ? 1 * dir : 0;
    });
  };

  const pagedBrands = useMemo(() => {
    const items = sortItems(filteredBrands, sortBy as keyof Brand);
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [filteredBrands, page, perPage, sortBy, sortDir]);

  const renderBrandsSection = () => {
    const listContainerClass = `divide-y overflow-auto ${
      isAllView ? "max-h-[480px]" : "max-h-72"
    }`;

    return (
      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="검색"
              value={brandSearch}
              onChange={(e: any) => setBrandSearch(e.target.value)}
            />
            <div className="flex-1" />
            <Button variant="primary" onClick={() => setIsAddBrandOpen(true)}>
              브랜드 추가
            </Button>
          </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">정렬:</label>
          <select
            className="border rounded p-1"
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
          >
            <option value="name">이름</option>
          </select>
          <select
            className="border rounded p-1"
            value={sortDir}
            onChange={(e: any) => setSortDir(e.target.value as any)}
          >
            <option value="asc">오름차순</option>
            <option value="desc">내림차순</option>
          </select>
        </div>
      </div>

        <div className="border rounded">
          <div className="grid grid-cols-12 gap-2 p-2 bg-gray-50 text-sm font-medium">
            <div className="col-span-1">#</div>
            <div className="col-span-7">브랜드명</div>
            <div className="col-span-4 text-right">액션</div>
          </div>
          <div className={listContainerClass}>
            {pagedBrands.map((b, idx) => (
              <div key={b.id} className="grid grid-cols-12 gap-2 items-center p-2">
                <div className="col-span-1 text-sm text-gray-600">
                  {(page - 1) * perPage + idx + 1}
                </div>
              <div className="col-span-7">
                {editingBrandId === b.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editingBrandName}
                      onChange={(e: any) => setEditingBrandName(e.target.value)}
                    />
                    <Button variant="primary" onClick={saveEditBrand}>
                      저장
                    </Button>
                    <Button variant="ghost" onClick={cancelEditBrand}>
                      취소
                    </Button>
                  </div>
                ) : (
                  <div className="font-medium">{b.name}</div>
                )}
              </div>
              <div className="col-span-4 text-right">
                {editingBrandId !== b.id && (
                  <Button variant="ghost" onClick={() => startEditBrand(b)}>
                    수정
                  </Button>
                )}
                <Button variant="ghost" onClick={() => removeBrand(b.id)}>
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>

          <div className="flex items-center justify-between p-2">
            <div>
              <label className="text-sm">페이지당:</label>
              <select
                className="border rounded p-1 ml-2"
                value={perPage}
                onChange={(e: any) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                이전
              </Button>
              <div className="text-sm">{page}</div>
              <Button variant="ghost" onClick={() => setPage((p) => p + 1)}>
                다음
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderYearsSection = () => (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="col-span-12 lg:col-span-4">
        <Card padding="md">
          <h2 className="text-lg font-medium mb-2">연도</h2>
          <div className="flex gap-2 mb-2">
            <div className="flex-1" />
            <Button variant="primary" onClick={() => setIsAddYearOpen(true)}>
              연도 추가
            </Button>
          </div>
          <div className="mt-3 space-y-2 max-h-80 overflow-auto">
            {years.map((y) => (
              <div
                key={y.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>{y.name}</div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => removeYear(y.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <Card padding="md">
          <h2 className="text-lg font-medium mb-2">연도별 시즌</h2>
          <div className="space-y-2">
            {years.map((y) => (
              <div key={y.id} className="mb-3">
                <div className="font-medium mb-1">{y.name}</div>
                <div className="flex gap-2 flex-wrap">
                  {seasons
                    .filter((s) => s.yearId === y.id)
                    .map((s) => (
                      <div
                        key={s.id}
                        className="p-2 border rounded flex items-center gap-2"
                      >
                        <div className="font-medium">{s.name}</div>
                        <Button variant="ghost" onClick={() => removeSeason(s.id)}>
                          삭제
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderSeasonsSection = () => (
    <Card padding="md" className="space-y-3">
      <div className="flex gap-2 mb-3 items-center">
        <div className="flex-1" />
        <Button
          variant="primary"
          onClick={() => {
            setModalSeasonName("");
            setModalSeasonYear(newSeasonYear || (years[0] && years[0].id) || "");
            setIsAddSeasonOpen(true);
          }}
        >
          시즌 추가
        </Button>
      </div>

      <div className="space-y-2">
        {seasons.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">{s.id}</div>
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-gray-500">
                {s.yearId
                  ? (years.find((y) => y.id === s.yearId)?.name ?? "삭제된 연도")
                  : "연도 미지정"}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => removeSeason(s.id)}>
                삭제
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  useEffect(() => {
    // sync to URL (shallow) when relevant state changes
    const params = new URLSearchParams(window.location.search);
    params.set("tab", activeTab);
    params.set("page", String(page));
    params.set("perPage", String(perPage));
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
    params.set("view", "all");
    const url = window.location.pathname + "?" + params.toString();
    router.replace(url, undefined, { shallow: true }).catch(() => {});
  }, [activeTab, page, perPage, sortBy, sortDir]);

  // Modals JSX
  const AddBrandModal = () => (
    isAddBrandOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-30" onClick={() => setIsAddBrandOpen(false)} />
        <div className="bg-white rounded shadow-lg p-6 w-full max-w-md z-10">
          <h3 className="text-lg font-medium mb-3">브랜드 추가</h3>
          <Input value={modalBrandName} onChange={(e: any) => setModalBrandName(e.target.value)} placeholder="브랜드명" />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddBrandOpen(false)}>취소</Button>
            <Button variant="primary" onClick={() => addBrand(modalBrandName)}>저장</Button>
          </div>
        </div>
      </div>
    ) : null
  );

  const AddYearModal = () => (
    isAddYearOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-30" onClick={() => setIsAddYearOpen(false)} />
        <div className="bg-white rounded shadow-lg p-6 w-full max-w-md z-10">
          <h3 className="text-lg font-medium mb-3">연도 추가</h3>
          <Input value={modalYearName} onChange={(e: any) => setModalYearName(e.target.value)} placeholder="연도 (예: 2026)" />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddYearOpen(false)}>취소</Button>
            <Button variant="primary" onClick={addYear}>저장</Button>
          </div>
        </div>
      </div>
    ) : null
  );

  const AddSeasonModal = () => (
    isAddSeasonOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-30" onClick={() => setIsAddSeasonOpen(false)} />
        <div className="bg-white rounded shadow-lg p-6 w-full max-w-md z-10">
          <h3 className="text-lg font-medium mb-3">시즌 추가</h3>
          <Input value={modalSeasonName} onChange={(e: any) => setModalSeasonName(e.target.value)} placeholder="시즌명 (예: SS)" />
          <select className="w-full mt-3 p-2 border rounded" value={modalSeasonYear} onChange={(e) => setModalSeasonYear(e.target.value)}>
            <option value="">연도 선택</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddSeasonOpen(false)}>취소</Button>
            <Button variant="primary" onClick={addSeason}>저장</Button>
          </div>
        </div>
      </div>
    ) : null
  );

  return (
    <Container maxWidth="full" centered={false} padding="md">
      <h1 className="text-2xl font-bold mb-4">브랜드 · 연도 · 시즌 관리</h1>

      <div className="text-sm text-gray-600 mb-6">
        브랜드, 연도, 시즌 정보를 한 화면에서 확인하고 편집할 수 있습니다.
      </div>

      <div className="space-y-6">
        {renderBrandsSection()}
        {renderYearsSection()}
        {renderSeasonsSection()}
      </div>
    </Container>
  );
}
