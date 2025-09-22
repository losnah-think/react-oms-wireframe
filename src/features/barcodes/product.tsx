import React from "react";
import {
  Container,
  Card,
  Button,
  Grid,
  GridCol,
  GridRow,
} from "../../design-system";
import Icon from "../../design-system/components/Icon";
import { mockProducts } from "../../data/mockProducts";
import { clientBarcodeStore } from "../../lib/clientBarcodeStore";

type Product = {
  id: string;
  productId?: number;
  title?: string;
  barcode?: string | null;
  barcodes?: string[];
  locations?: Array<{ code: string; qty: number }>;
  sku?: string;
  image?: string;
  supplier?: string;
  cost_price?: number;
  selling_price?: number;
  variantName?: string;
  width_cm?: number;
  height_cm?: number;
  depth_cm?: number;
  weight_g?: number;
  volume_cc?: number;
  externalMall?: any;
};

// EAN-13 helpers
const ean13Checksum = (digits12: string) => {
  const nums = digits12.split("").map((d) => parseInt(d, 10));
  if (nums.length !== 12 || nums.some(isNaN)) return null;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += nums[i] * (i % 2 === 0 ? 1 : 3);
  }
  const mod = sum % 10;
  const check = mod === 0 ? 0 : 10 - mod;
  return String(check);
};

const isValidEan13 = (val: string) => {
  const raw = val.replace(/\s|-/g, "");
  if (!/^\d{13}$/.test(raw)) return false;
  const expected = ean13Checksum(raw.slice(0, 12));
  return expected === raw[12];
};

const getBarcodeMeta = (val?: string | null) => {
  if (!val)
    return {
      type: "—" as const,
      validChecksum: undefined as boolean | undefined,
    };
  const raw = String(val).replace(/\s|-/g, "");
  if (/^\d+$/.test(raw)) {
    if (raw.length === 13) {
      return { type: "EAN-13" as const, validChecksum: isValidEan13(raw) };
    }
    if (raw.length === 12) {
      return { type: "UPC-A" as const, validChecksum: undefined };
    }
    return { type: `숫자(${raw.length})` as const, validChecksum: undefined };
  }
  return { type: "CODE128" as const, validChecksum: undefined };
};

const getBarcodeState = (code?: string | null) => {
  if (!code) return "미발급";
  const meta = getBarcodeMeta(code);
  if (meta.type === "EAN-13") return meta.validChecksum ? "정상" : "오류";
  if (meta.type === "UPC-A" || meta.type === "CODE128") return "정상";
  return "오류";
};

// ---- Modern UI helpers (Chips/Badges) ----
const toneClasses: Record<
  "neutral" | "success" | "warning" | "error" | "info",
  string
> = {
  neutral: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};
const Chip: React.FC<{
  tone?: keyof typeof toneClasses;
  className?: string;
  children: React.ReactNode;
}> = ({ tone = "neutral", className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]} ${className}`}
  >
    {children}
  </span>
);

const saveLog = (entry: any) => {
  try {
    const raw = localStorage.getItem("barcodes_logs_v1");
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift(entry);
    localStorage.setItem(
      "barcodes_logs_v1",
      JSON.stringify(arr.slice(0, 1000)),
    );
  } catch (e) {
    /* ignore */
  }
};

const ProductBarcodesPage: React.FC = () => {
  // When barcode is clicked, should we open product edit/detail page in a new tab?
  const OPEN_BARCODE_IN_NEW_TAB = true;

  const [products, setProducts] = React.useState<Product[]>([]);
  const [filtered, setFiltered] = React.useState<Product[]>([]);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "missing" | "error" | "duplicate" | "normal"
  >("all");
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = React.useState(false);
  const [showEditId, setShowEditId] = React.useState<string | null>(null);
  const [manualValue, setManualValue] = React.useState<string>("");
  const [logsOpen, setLogsOpen] = React.useState(false);

  React.useEffect(() => {
    clientBarcodeStore.initIfNeeded();
    // One-time reseed from mock data (only run once per dev machine)
    try {
      if (!localStorage.getItem("client_reseed_done_v1")) {
        clientBarcodeStore.reseedFromMock();
        localStorage.setItem("client_reseed_done_v1", String(Date.now()));
      }
    } catch (e) {}
    const rows = clientBarcodeStore.getProducts().map((p: any) => ({
      id: String(p.id),
      productId: p.productId,
      title: p.title,
      sku: p.sku,
      barcode: p.barcode ?? null,
      barcodes: Array.isArray(p.barcodes) ? p.barcodes.slice() : (p.barcode ? [p.barcode] : []),
      locations: Array.isArray(p.locations) ? p.locations.map((l:any)=>({ code: String(l.code), qty: Number(l.qty || 0) })) : [],
      image: p.image,
      supplier: p.supplier,
      cost_price: p.cost_price,
      selling_price: p.selling_price,
      variantName: p.variantName,
      width_cm: p.width_cm,
      height_cm: p.height_cm,
      depth_cm: p.depth_cm,
      weight_g: p.weight_g,
      volume_cc: p.volume_cc,
      externalMall: p.externalMall,
    }));
    setProducts(rows);
    setFiltered(rows);

    const handler = () => {
      const next = clientBarcodeStore.getProducts().map((p: any) => ({
        id: String(p.id),
        productId: p.productId,
        title: p.title,
        sku: p.sku,
        barcode: p.barcode ?? null,
        barcodes: Array.isArray(p.barcodes) ? p.barcodes.slice() : (p.barcode ? [p.barcode] : []),
        locations: Array.isArray(p.locations) ? p.locations.map((l:any)=>({ code: String(l.code), qty: Number(l.qty || 0) })) : [],
        image: p.image,
        supplier: p.supplier,
      }));
      setProducts(next);
      setFiltered(next);
      const locs = clientBarcodeStore.getLocationBarcodes() || [];
      setKnownLocations(locs.map((l: any) => ({ id: Number(l.id), code: String(l.code) })));
    };
    window.addEventListener("clientBarcodesChanged", handler);
    return () => window.removeEventListener("clientBarcodesChanged", handler);
  }, []);

  const barcodeCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      if (p.barcode) map[p.barcode] = (map[p.barcode] || 0) + 1;
    });
    return map;
  }, [products]);
  
  // number of distinct products that have a given barcode
  const barcodeProductCounts = React.useMemo(() => {
    const map: Record<string, Set<string>> = {};
    products.forEach((p) => {
      if (!p.barcode) return;
      const key = p.barcode;
      map[key] = map[key] || new Set();
      // productId may be undefined for single-product rows, use id as fallback
      map[key].add(String(p.productId ?? p.id));
    });
    const out: Record<string, number> = {};
    Object.keys(map).forEach((k) => (out[k] = map[k].size));
    return out;
  }, [products]);

  const stats = React.useMemo(() => {
    let missing = 0,
      error = 0,
      normal = 0,
      duplicate = 0;
    products.forEach((p) => {
      const st = getBarcodeState(p.barcode);
      const dup = p.barcode ? barcodeCounts[p.barcode] > 1 : false;
      if (!p.barcode) missing++;
      else if (dup) duplicate++;
      else if (st === "오류") error++;
      else if (st === "정상") normal++;
    });
    return { total: products.length, missing, error, normal, duplicate };
  }, [products, barcodeCounts]);

  React.useEffect(() => {
    const list = products.filter((p) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (p.title || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.barcode || "").toLowerCase().includes(q)
      );
    });
    const list2 = list.filter((p) => {
      const st = getBarcodeState(p.barcode);
      const dup = p.barcode ? barcodeCounts[p.barcode] > 1 : false;
      switch (statusFilter) {
        case "missing":
          return !p.barcode;
        case "error":
          return st === "오류";
        case "duplicate":
          return dup;
        case "normal":
          return st === "정상" && !dup;
        default:
          return true;
      }
    });
    setFiltered(list2);
  }, [products, query, statusFilter, barcodeCounts]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const doSelectAll = () => {
    const newAll: Record<string, boolean> = {};
    filtered.forEach((p) => {
      newAll[p.id] = true;
    });
    setSelected(newAll);
    setSelectAll(true);
  };

  const clearSelection = () => {
    setSelected({});
    setSelectAll(false);
  };

  const exportCsv = () => {
    const rows = filtered.map((p) => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      barcode: p.barcode || "",
    }));
    const csv = [Object.keys(rows[0] || {}).join(",")]
      .concat(
        rows.map((r) =>
          Object.values(r)
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(","),
        ),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product-barcodes-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const autoIssue = async (ids?: string[]) => {
    const targets = ids
      ? products.filter((p) => ids.includes(p.id))
      : products.filter((p) => !p.barcode);
    const updated = [...products];
    let count = 0;
    for (const t of targets) {
      const prefix = "880";
      const core = ("" + Math.floor(Math.random() * 1e9)).padStart(9, "0");
      const twelve = prefix + core;
      const check = ean13Checksum(twelve);
      if (!check) continue;
      const code = twelve + check;
      const idx = updated.findIndex((u) => u.id === t.id);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], barcode: code };
        count++;
        saveLog({
          ts: new Date().toISOString(),
          user: "system",
          action: "auto-issue",
          id: t.id,
          value: code,
        });
      }
      await new Promise((res) => setTimeout(res, 50));
    }
    setProducts(updated);
    setFiltered((prev) =>
      prev.map((p) => ({ ...(updated.find((u) => u.id === p.id) || p) })),
    );
    alert(`자동 발급 완료: ${count}건`);
  };

  const apiSaveBarcode = async (id: string, barcode: string | null) => {
    // use client-only store
    await new Promise((res) => setTimeout(res, 120));
    return clientBarcodeStore.updateProductBarcode(id, barcode);
  };

  const apiSync = async () => {
    await new Promise((res) => setTimeout(res, 300));
    clientBarcodeStore.initIfNeeded();
    const arr = clientBarcodeStore.getProducts().map((p: any) => ({
      id: String(p.id),
      title: p.title,
      barcode: p.barcode ?? null,
      sku: p.sku ?? "",
    }));
    setProducts(arr);
    setFiltered(arr);
    alert("동기화 완료 (로컬 데이터 기준)");
  };

  const openEdit = (id: string) => {
    const p = products.find((x) => x.id === id);
    setManualValue(p?.barcode ?? "");
    setShowEditId(id);
  };

  const addBarcodeToProduct = async (productId: string) => {
    const val = prompt('추가할 바코드 값을 입력하세요 (숫자만)');
    if (!val) return;
    const raw = String(val).replace(/\s|-/g, '');
    // autofill checksum if 12 digits
    let code = raw;
    if (/^\d{12}$/.test(raw)) {
      const check = ean13Checksum(raw);
      if (check) code = raw + check;
    }
    const res = clientBarcodeStore.addProductBarcode(productId, code);
    if (!res.ok) { alert('바코드 추가 실패: ' + String(res.error || '')); return; }
    // refresh
    const next = clientBarcodeStore.getProducts().map((pp:any)=>({ id:String(pp.id), productId: pp.productId, title: pp.title, sku: pp.sku, barcode: pp.barcode ?? null, barcodes: Array.isArray(pp.barcodes)?pp.barcodes.slice(): (pp.barcode ? [pp.barcode]:[]), image: pp.image, supplier: pp.supplier }));
    setProducts(next); setFiltered(next);
    alert('바코드가 추가되었습니다');
  };

  const saveEdit = (id: string) => {
    const raw = manualValue.replace(/\s|-/g, "");
    if (/^\d{13}$/.test(raw) && !isValidEan13(raw)) {
      alert("EAN-13 체크섬 불일치");
      return;
    }
    const updated = products.map((p) => (p.id === id ? { ...p, barcode: manualValue || null, barcodes: (!p.barcodes ? [] : p.barcodes) } : p));
    setProducts(updated);
    clientBarcodeStore.updateProductBarcode(id, manualValue || null);
    clientBarcodeStore.appendLog({ ts: new Date().toISOString(), user: "operator", action: "manual-edit", id, value: manualValue });
    setShowEditId(null);
  };

  const autofillChecksumForValue = (val: string) => {
    const raw = String(val).replace(/\s|-/g, "");
    if (/^\d{12}$/.test(raw)) {
      const check = ean13Checksum(raw);
      return check ? raw + check : val;
    }
    return val;
  };

  const autofillSelected = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) {
      alert("선택된 항목이 없습니다");
      return;
    }
    const updated = products.map((p) => {
      if (!ids.includes(p.id)) return p;
      if (!p.barcode) return p;
      const raw = String(p.barcode).replace(/\s|-/g, "");
      if (/^\d{12}$/.test(raw)) {
        const newCode = autofillChecksumForValue(raw);
        saveLog({
          ts: new Date().toISOString(),
          user: "operator",
          action: "autofill",
          id: p.id,
          value: newCode,
        });
        return { ...p, barcode: newCode };
      }
      return p;
    });
    setProducts(updated);
    detectConflicts();
    alert("선택 항목에 대해 체크섬 자동완성 완료");
  };

  const invalidateSelected = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) {
      alert("선택된 항목이 없습니다");
      return;
    }
    for (const id of ids) {
      await apiSaveBarcode(id, null);
      saveLog({
        ts: new Date().toISOString(),
        user: "operator",
        action: "invalidate",
        id,
      });
    }
    await apiSync();
    detectConflicts();
    clearSelection();
    alert("선택 항목 무효화 완료");
  };

  const openLogs = () => setLogsOpen(true);
  const [conflictOpen, setConflictOpen] = React.useState(false);
  const [conflictList, setConflictList] = React.useState<any[]>([]);
  const [knownLocations, setKnownLocations] = React.useState<Array<{id:number,code:string}>>([]);
  const [selectedLocationForAssign, setSelectedLocationForAssign] = React.useState<string | null>(null);
  const [newLocInputs, setNewLocInputs] = React.useState<Record<string, { code?: string; qty: number }>>({});
  const [printModalOpen, setPrintModalOpen] = React.useState(false);
  const [printOptions, setPrintOptions] = React.useState({
    size: "50x30",
    copies: 1,
  });

  const printLabels = () => {
    setPrintModalOpen(true);
  };

  const detectConflicts = () => {
    const map: Record<string, any[]> = {};
    products.forEach((p) => {
      if (p.barcode) {
        map[p.barcode] = map[p.barcode] || [];
        map[p.barcode].push(p);
      }
    });
    const conflicts = Object.values(map).filter((arr) => arr.length > 1);
    const list = conflicts.flatMap((arr: any[]) => arr);
    setConflictList(list);
    setConflictOpen(list.length > 0);
  };

  return (
    <Container maxWidth="full" centered={false} padding="md">
      <Grid container gutter={[8, 8]} className="mb-4">
          <GridCol span={14} className="">
          <h1 className="text-2xl font-semibold">상품 바코드 관리</h1>
          <div className="flex items-center gap-2 mt-2">
            <Chip tone="info">총 {stats.total}개</Chip>
            <Chip tone="neutral">미발급 {stats.missing}</Chip>
            <Chip tone="success">정상 {stats.normal}</Chip>
            <Chip tone="warning">중복 {stats.duplicate}</Chip>
            <Chip tone="error">오류 {stats.error}</Chip>
          </div>
        </GridCol>
        <GridCol span={2} className="flex justify-end items-start">
          <Button
            variant="outline"
            size="small"
            className="border-blue-400 text-blue-600"
          >
            중복 감지
          </Button>
        </GridCol>

        {/* Toolbar row 1 (primary) */}
        <GridCol span={16} className="flex items-center gap-2 mt-3">
          <div className="flex gap-2">
            <Button variant="primary" size="small" onClick={() => autoIssue()}>
              <Icon name="plus" size={12} /> 자동 발급
            </Button>
            <Button size="small" onClick={printLabels}>
              <Icon name="document" size={12} /> 인쇄
            </Button>
            <Button variant="outline" size="small" onClick={exportCsv}>
              <Icon name="download" size={12} /> CSV
            </Button>
            <Button variant="outline" size="small" onClick={apiSync}>
              <Icon name="download" size={12} /> 동기화
            </Button>
          </div>
        </GridCol>

        {/* Toolbar row 2 (secondary) */}
        <GridCol span={16} className="flex items-center gap-2">
          <div className="flex gap-2">
            <Button variant="ghost" size="small" onClick={() => doSelectAll()}>
              전체선택
            </Button>
            <Button variant="ghost" size="small" onClick={invalidateSelected}>
              선택 무효화
            </Button>
            <Button variant="ghost" size="small" onClick={autofillSelected}>
              체크섬 완성
            </Button>
            <Button variant="ghost" size="small" onClick={detectConflicts}>
              중복 감지
            </Button>
            <Button variant="ghost" size="small" onClick={openLogs}>
              발급 로그
            </Button>
          </div>
        </GridCol>
      </Grid>

      <Card padding="lg" className="mb-4">
        <Grid container gutter={[12, 12]}>
          <GridCol span={12}>
            <input
              type="text"
              className="border px-3 py-2 rounded w-full"
              placeholder="상품명/코드/바코드 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </GridCol>
          <GridCol span={8} className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-full text-xs ${statusFilter === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("missing")}
              className={`px-3 py-1 rounded-full text-xs ${statusFilter === "missing" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              미발급 {stats.missing}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("error")}
              className={`px-3 py-1 rounded-full text-xs ${statusFilter === "error" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              오류 {stats.error}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("duplicate")}
              className={`px-3 py-1 rounded-full text-xs ${statusFilter === "duplicate" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              중복 {stats.duplicate}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("normal")}
              className={`px-3 py-1 rounded-full text-xs ${statusFilter === "normal" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              정상 {stats.normal}
            </button>
          </GridCol>
          <GridCol span={4} className="flex justify-end items-center">
            <select className="border px-3 py-2 rounded text-sm">
              <option>유형 전체</option>
              <option>EAN-13</option>
              <option>UPC-A</option>
              <option>CODE128</option>
            </select>
          </GridCol>
        </Grid>
      </Card>

      {/* Action toolbar above table (compact) */}
      <div className="mb-4">
        <Grid container gutter={[8, 8]}>
          <GridCol span={6} className="flex items-center gap-2">
            <Button variant="outline" onClick={() => doSelectAll()}>
              전체 선택
            </Button>
            <Button
              onClick={() =>
                autoIssue(Object.keys(selected).filter((k) => selected[k]))
              }
            >
              선택 항목 자동 발급
            </Button>
            <Button onClick={() => autoIssue()}>
              필터 대상 일괄 자동 발급
            </Button>
          </GridCol>
          <GridCol span={6} className="flex justify-end items-center gap-2">
            <Button variant="outline" onClick={exportCsv}>
              CSV 내보내기
            </Button>
            <Button onClick={openLogs}>발급 로그</Button>
          </GridCol>
        </Grid>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm border-collapse min-w-[900px]">
            <thead className="bg-white sticky top-0">
              <tr className="text-left text-gray-600 border-b">
                <th className="p-2 text-left" style={{ width: "8%" }}>
                  공급처
                </th>
                <th className="p-2" style={{ width: "6%" }}>
                  이미지
                </th>
                <th className="p-2" style={{ width: "34%" }}>
                  상품명
                </th>
                <th className="p-2 text-center" style={{ width: "4%" }}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) =>
                      e.target.checked ? doSelectAll() : clearSelection()
                    }
                  />
                </th>
                <th className="p-2 text-center" style={{ width: "16%" }}>
                  바코드번호
                </th>
                <th className="p-2" style={{ width: "18%" }}>
                  옵션정보
                </th>
                <th className="p-2 text-right" style={{ width: "6%" }}>
                  원가
                </th>
                <th className="p-2 text-center" style={{ width: "8%" }}>
                  인쇄대기
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const state = getBarcodeState(p.barcode);
                return (
                  <tr
                    key={p.id}
                    className="border-t hover:bg-gray-50 align-top"
                  >
                    <td className="p-2 text-sm text-blue-600 font-medium">
                      {p.supplier ?? "자체제작"}
                    </td>
                    <td className="p-2">
                      <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt="img"
                            className="max-h-10 object-cover"
                          />
                        ) : (
                          <img
                            src="/icons/sellmate.png"
                            alt="img"
                            className="max-h-10"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-sm min-w-0">
                      <div className="font-semibold text-blue-700">
                        {p.title ?? "무명 상품"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {p.sku} · {p.productId}
                        {p.variantName ? ` · ${p.variantName}` : ""}
                      </div>
                      {p.externalMall && (
                        <div className="text-xs text-gray-600 mt-1 break-words whitespace-normal">
                          외부몰: {p.externalMall.platform} / SKU: {" "}
                          {p.externalMall.external_sku}
                        </div>
                      )}
                      <div className="text-xs text-gray-600 mt-1 whitespace-normal">
                        사이즈: {p.width_cm ?? "—"}×{p.height_cm ?? "—"}×
                        {p.depth_cm ?? "—"} cm · 무게: {p.weight_g ?? "—"} g
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={!!selected[p.id]}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td className="p-2 text-sm font-mono text-center max-w-[220px] break-words whitespace-normal">
                        {Array.isArray(p.barcodes) && p.barcodes.length > 0 ? (
                          <div className="inline-flex flex-col items-center">
                            {p.barcodes.map((b: string, bi: number) => (
                              <div key={bi} className="flex items-center gap-2 break-words">
                                <a
                                  href={
                                    p.productId ? `/products/${p.productId}` : `/products/${p.id}`
                                  }
                                  target={OPEN_BARCODE_IN_NEW_TAB ? "_blank" : "_self"}
                                  rel={OPEN_BARCODE_IN_NEW_TAB ? "noopener noreferrer" : undefined}
                                  className="text-blue-600 hover:underline inline-block break-words max-w-[160px]"
                                  title={`상품 수정으로 이동: ${p.productId ?? p.id}`}
                                >
                                  {b}
                                </a>
                                <button className="text-xs text-red-600" onClick={async()=>{
                                  if(!confirm('바코드를 삭제하시겠습니까?')) return;
                                  const res = clientBarcodeStore.removeProductBarcode(p.id, b);
                                  if(!res.ok) { alert('삭제 실패'); return; }
                                  const next = clientBarcodeStore.getProducts().map((pp:any)=>({ id:String(pp.id), productId: pp.productId, title: pp.title, sku: pp.sku, barcode: pp.barcode ?? null, barcodes: Array.isArray(pp.barcodes)?pp.barcodes.slice(): (pp.barcode ? [pp.barcode]:[]), image: pp.image, supplier: pp.supplier }));
                                  setProducts(next); setFiltered(next);
                                }}>삭제</button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          p.barcode ? (
                            <div className="inline-flex flex-col items-center">
                              <a
                                href={
                                  p.productId ? `/products/${p.productId}` : `/products/${p.id}`
                                }
                                target={OPEN_BARCODE_IN_NEW_TAB ? "_blank" : "_self"}
                                rel={OPEN_BARCODE_IN_NEW_TAB ? "noopener noreferrer" : undefined}
                                className="text-blue-600 hover:underline inline-block break-words max-w-[160px]"
                                title={`상품 수정으로 이동: ${p.productId ?? p.id}`}
                              >
                                {p.barcode}
                              </a>
                              <div className="text-xs text-gray-500 mt-1">
                                {barcodeProductCounts[p.barcode] ?? 0}개 상품
                              </div>
                            </div>
                          ) : (
                            "—"
                          )
                        )}
                        {(Array.isArray(p.barcodes) && p.barcodes.length > 1) && (
                          <div className="text-xs text-yellow-800">중복</div>
                        )}
                    </td>
                    <td className="p-2 text-sm min-w-0">
                      <div className="text-green-600 font-medium">단일상품</div>
                      <div className="mt-2 flex items-center gap-2 min-w-0">
                        <div className="flex-shrink-0">
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => {
                              /* PDF 인쇄 */
                            }}
                          >
                            PDF 인쇄
                          </Button>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => openEdit(p.id)}
                          >
                            수정
                          </Button>
                        </div>
                        <div className="flex-shrink-0">
                          <Button variant="outline" size="small" onClick={()=>addBarcodeToProduct(p.id)}>
                            바코드 추가
                          </Button>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-600">위치:</div>
                            <div>
                              {(p.locations || []).map((loc:any, li:number)=> (
                                <div key={li} className="flex items-center gap-2 text-sm">
                                  <div className="font-mono">{loc.code}</div>
                                  <input className="border px-2 py-1 w-20 text-sm" type="number" value={String(loc.qty)} onChange={(e)=>{
                                    const q = Math.max(0, Number(e.target.value) || 0);
                                    clientBarcodeStore.updateLocationQty(p.id, loc.code, q);
                                    const next = clientBarcodeStore.getProducts().map((pp:any)=>({ id:String(pp.id), productId: pp.productId, title: pp.title, sku: pp.sku, barcode: pp.barcode ?? null, barcodes: Array.isArray(pp.barcodes)?pp.barcodes.slice(): (pp.barcode ? [pp.barcode]:[]), locations: Array.isArray(pp.locations)? pp.locations.map((l:any)=>({ code: String(l.code), qty: Number(l.qty||0)})) : [], image: pp.image, supplier: pp.supplier }));
                                    setProducts(next); setFiltered(next);
                                  }} />
                                  <button className="text-xs text-red-600" onClick={()=>{
                                    if(!confirm('위치 바코드를 제거하시겠습니까?')) return;
                                    clientBarcodeStore.removeLocation(p.id, loc.code);
                                    const next = clientBarcodeStore.getProducts().map((pp:any)=>({ id:String(pp.id), productId: pp.productId, title: pp.title, sku: pp.sku, barcode: pp.barcode ?? null, barcodes: Array.isArray(pp.barcodes)?pp.barcodes.slice(): (pp.barcode ? [pp.barcode]:[]), locations: Array.isArray(pp.locations)? pp.locations.map((l:any)=>({ code: String(l.code), qty: Number(l.qty||0)})) : [], image: pp.image, supplier: pp.supplier }));
                                    setProducts(next); setFiltered(next);
                                  }}>삭제</button>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <select className="border px-2 py-1 text-sm" value={(newLocInputs[p.id] && newLocInputs[p.id].code) || ""} onChange={(e)=> setNewLocInputs(prev=>({ ...prev, [p.id]: { ...(prev[p.id]||{qty:0}), code: e.target.value } }))}>
                                <option value="">위치 선택</option>
                                {knownLocations.map((l)=> (
                                  <option key={l.id} value={l.code}>{l.code}</option>
                                ))}
                              </select>
                              <input className="border px-2 py-1 w-20 text-sm" type="number" value={(newLocInputs[p.id] && String(newLocInputs[p.id].qty)) || "0"} onChange={(e)=> setNewLocInputs(prev=>({ ...prev, [p.id]: { ...(prev[p.id]||{code:''}), qty: Math.max(0, Number(e.target.value) || 0) } }))} />
                              <Button size="small" onClick={async ()=>{
                                const inp = newLocInputs[p.id];
                                if (!inp || !inp.code) { alert('위치를 선택하세요'); return; }
                                const qty = Number(inp.qty || 0);
                                const res = clientBarcodeStore.assignLocationQty(p.id, inp.code, qty);
                                if (!res.ok) { alert('할당 실패: ' + String(res.error || '')); return; }
                                const next = clientBarcodeStore.getProducts().map((pp:any)=>({ id:String(pp.id), productId: pp.productId, title: pp.title, sku: pp.sku, barcode: pp.barcode ?? null, barcodes: Array.isArray(pp.barcodes)?pp.barcodes.slice(): (pp.barcode ? [pp.barcode]:[]), locations: Array.isArray(pp.locations)? pp.locations.map((l:any)=>({ code: String(l.code), qty: Number(l.qty||0)})) : [], image: pp.image, supplier: pp.supplier }));
                                setProducts(next); setFiltered(next);
                                setNewLocInputs(prev=>({ ...prev, [p.id]: { code: '', qty: 0 } }));
                              }}>위치 할당</Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => openLogs()}
                          >
                            내역
                          </Button>
                        </div>
                        <div className="text-sm text-red-600 ml-2 truncate">
                          현재고: 0
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-sm text-right">
                      {Math.floor(1000 + idx * 500).toLocaleString()}원
                    </td>
                    <td className="p-2 text-sm text-center min-w-0">
                      <div className="flex items-center gap-2 justify-center min-w-0">
                        <input
                          className="border px-2 py-1 w-24 text-sm flex-shrink-0"
                          placeholder="수량"
                        />
                        <div className="flex-shrink-0">
                          <Button size="small">인쇄대기</Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-6 text-center text-sm text-gray-500"
                  >
                    <div className="max-w-xl mx-auto">
                      조건에 맞는 상품이 없습니다. 필터를 조정하거나 ‘미발급만
                      보기’를 해제해 보세요.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit modal simple */}
      {showEditId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[520px]">
            <h3 className="text-lg font-semibold mb-2">바코드 교체</h3>
            <p className="text-sm text-gray-600 mb-4">
              EAN-13: 13자리 숫자, 체크섬 자동 계산/검증
            </p>
            <div className="flex gap-2 mb-3">
              <input
                className="border w-full p-2"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                placeholder="바코드값 입력(예: 8801234567890)"
              />
              <Button
                variant="outline"
                onClick={() =>
                  setManualValue(autofillChecksumForValue(manualValue))
                }
              >
                체크섬 완성
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditId(null)}>
                취소
              </Button>
              <Button variant="primary" onClick={() => saveEdit(showEditId)}>
                저장
              </Button>
            </div>
          </div>
        </div>
      )}

      {logsOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[800px] max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-2">발급 로그</h3>
            <div className="text-xs text-gray-600 mb-4">최근 1,000건</div>
            <div className="space-y-2">
              {(
                JSON.parse(localStorage.getItem("barcodes_logs_v1") || "[]") ||
                []
              ).map((l: any, i: number) => (
                <div key={i} className="border-b py-2 text-sm">
                  <div className="font-medium">
                    {l.action} — {l.id}
                  </div>
                  <div className="text-xs text-gray-500">
                    {l.ts} · {l.user} · {String(l.value || "")}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setLogsOpen(false)}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict modal */}
      {conflictOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[720px] max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-2">
              중복 바코드 충돌 목록
            </h3>
            <div className="text-sm text-gray-600 mb-4">
              같은 바코드가 여러 SKU에 할당되어 있습니다. 조치하세요.
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th>바코드</th>
                  <th>상품명</th>
                  <th>SKU</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {conflictList.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-mono">{c.barcode}</td>
                    <td className="p-2">{c.title}</td>
                    <td className="p-2">{c.sku}</td>
                    <td className="p-2">
                      <div className="flex gap-2 items-center">
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => {
                            setManualValue(c.barcode);
                            setShowEditId(c.id);
                            setConflictOpen(false);
                          }}
                        >
                          교체
                        </Button>
                        <Button
                          size="small"
                          onClick={async () => {
                            await apiSaveBarcode(c.id, null);
                            detectConflicts();
                          }}
                        >
                          무효화
                        </Button>
                        <div className="flex items-center gap-2">
                          <select className="border px-2 py-1 text-sm" value={selectedLocationForAssign ?? ""} onChange={(e) => setSelectedLocationForAssign(e.target.value || null)}>
                            <option value="">위치 선택</option>
                            {knownLocations.map((l) => (
                              <option key={l.id} value={l.code}>{l.code}</option>
                            ))}
                          </select>
                          <Button size="small" onClick={async () => {
                            if (!selectedLocationForAssign) { alert('위치를 선택하세요'); return; }
                            const res = clientBarcodeStore.assignLocationToProduct(selectedLocationForAssign, c.id);
                            if (!res.ok) { alert('할당 실패: ' + String(res.error || '')); return; }
                            alert('위치 바코드가 상품에 할당되었습니다');
                            detectConflicts();
                          }}>위치 할당</Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setConflictOpen(false)}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print modal */}
      {printModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[640px] max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-2">라벨 인쇄 미리보기</h3>
            <div className="mb-3">
              <label className="text-sm mr-2">규격</label>
              <select
                value={printOptions.size}
                onChange={(e) =>
                  setPrintOptions((prev) => ({ ...prev, size: e.target.value }))
                }
                className="border px-2 py-1 rounded"
              >
                <option value="50x30">50×30mm</option>
                <option value="70x35">70×35mm</option>
                <option value="30334">30334</option>
              </select>
              <label className="text-sm ml-4 mr-2">복사수</label>
              <input
                type="number"
                value={printOptions.copies}
                onChange={(e) =>
                  setPrintOptions((prev) => ({
                    ...prev,
                    copies: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
                className="border px-2 py-1 rounded w-20"
              />
            </div>
            <div className="border p-4 mb-4">
              <div className="grid grid-cols-3 gap-2">
                {filtered.slice(0, 6).map((r, i) => (
                  <div key={i} className="p-2 border text-center">
                    <div className="font-medium">{r.title}</div>
                    <div className="font-mono mt-2">{r.barcode || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPrintModalOpen(false)}
              >
                닫기
              </Button>
              <Button
                onClick={() => {
                  setPrintModalOpen(false);
                  setTimeout(() => window.print(), 400);
                }}
              >
                프린트
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default ProductBarcodesPage;
// (moved implementation to this file)
