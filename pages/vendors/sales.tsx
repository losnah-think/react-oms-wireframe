import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Container,
  Card,
  Button,
  Input,
  Modal,
  Stack,
} from "@/design-system";

const PLATFORM_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "cafe24", label: "Cafe24" },
  { value: "gmarket", label: "G마켓" },
  { value: "coupang", label: "쿠팡" },
  { value: "naver", label: "네이버" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "active", label: "활성" },
  { value: "inactive", label: "비활성" },
];

const PAGE_SIZES = [10, 20, 50];

export interface VendorRecord {
  id: string;
  name: string;
  code: string;
  platform: "cafe24" | "gmarket" | "coupang" | "naver";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  settings?: Record<string, unknown>;
}

interface VendorResponse {
  vendors: VendorRecord[];
  meta: { total: number; limit: number; offset: number };
}

const initialFormState: VendorRecord = {
  id: "",
  name: "",
  code: "",
  platform: "cafe24",
  is_active: true,
  created_at: "",
  updated_at: "",
  settings: {},
};

function formatDate(value: string) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch (e) {
    return value;
  }
}

const SalesManagementPage: React.FC = () => {
  // Toggle this to true to run the page fully in-memory without API calls
  const USE_MOCK = true;

  // Simple in-memory mock store for vendors when USE_MOCK is true
  const MOCK_INITIAL: VendorRecord[] = [
    {
      id: "v1",
      name: "테스트 판매처 A",
      code: "TESTA",
      platform: "cafe24",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      settings: { example: true },
    },
    {
      id: "v2",
      name: "테스트 판매처 B",
      code: "TESTB",
      platform: "gmarket",
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      settings: {},
    },
  ];
  const [mockStore, setMockStore] = useState<VendorRecord[]>(MOCK_INITIAL);
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [meta, setMeta] = useState<{ total: number; limit: number; offset: number }>(
    { total: 0, limit: PAGE_SIZES[0], offset: 0 },
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(0);

  const [viewVendor, setViewVendor] = useState<VendorRecord | null>(null);
  const [editVendor, setEditVendor] = useState<VendorRecord | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  // debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (USE_MOCK) {
      try {
        // apply filters and pagination in-memory
        let list = mockStore.slice();
        if (debouncedQuery) {
          const q = debouncedQuery.toLowerCase();
          list = list.filter((v) => v.name.toLowerCase().includes(q) || v.code.toLowerCase().includes(q));
        }
        if (statusFilter !== "all") {
          const want = statusFilter === "active";
          list = list.filter((v) => v.is_active === want);
        }
        if (platformFilter !== "all") {
          list = list.filter((v) => v.platform === platformFilter);
        }
        const total = list.length;
        const offset = page * pageSize;
        const paged = list.slice(offset, offset + pageSize);
        setVendors(paged);
        setMeta({ total, limit: pageSize, offset });
      } catch (err: any) {
        setError(err.message || "알 수 없는 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
      return;
    }

    // real API fallback
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("limit", String(pageSize));
    params.set("offset", String(page * pageSize));
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (statusFilter !== "all") params.set("is_active", statusFilter === "active" ? "true" : "false");
    if (platformFilter !== "all") params.set("platform", platformFilter);

    try {
      const res = await fetch(`/api/vendors?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`목록을 불러오지 못했습니다 (${res.status})`);
      }
      const body: VendorResponse = await res.json();
      setVendors(body.vendors);
      setMeta(body.meta);
    } catch (err: any) {
      setError(err.message || "알 수 없는 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, statusFilter, platformFilter, page, pageSize]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(meta.total / pageSize)), [meta.total, pageSize]);
  const router = useRouter();

  const openViewModal = async (vendorId: string) => {
    try {
      if (USE_MOCK) {
        const found = mockStore.find((v) => v.id === vendorId) || null;
        setViewVendor(found);
        setViewModalOpen(true);
        return;
      }
      const res = await fetch(`/api/vendors/${vendorId}`);
      if (!res.ok) throw new Error("판매처 정보를 불러올 수 없습니다");
      const data = await res.json();
      setViewVendor(data.vendor);
      setViewModalOpen(true);
    } catch (err: any) {
      setToast(err.message || "판매처 정보를 가져오지 못했습니다");
    }
  };

  const openEditModal = (vendor?: VendorRecord) => {
    if (vendor) {
      setEditVendor({ ...vendor });
    } else {
      setEditVendor({ ...initialFormState });
    }
    setFormErrors({});
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditVendor(null);
  };

  const validateForm = async (record: VendorRecord) => {
    const nextErrors: Record<string, string> = {};
    if (!record.name.trim()) {
      nextErrors.name = "이름은 필수입니다";
    }
    if (!record.code.trim()) {
      nextErrors.code = "코드는 필수입니다";
    } else {
      if (USE_MOCK) {
        const dup = mockStore.find((item) => item.code.toLowerCase() === record.code.toLowerCase() && item.id !== record.id);
        if (dup) nextErrors.code = "이미 사용 중인 코드입니다";
      } else {
        const params = new URLSearchParams();
        params.set("limit", "1");
        params.set("q", `code:${record.code}`);
        const res = await fetch(`/api/vendors?${params.toString()}`);
        if (res.ok) {
          const body: VendorResponse = await res.json();
          const duplicate = body.vendors.find((item) => item.code.toLowerCase() === record.code.toLowerCase());
          if (duplicate && duplicate.id !== record.id) {
            nextErrors.code = "이미 사용 중인 코드입니다";
          }
        }
      }
    }
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveVendor = async () => {
    if (!editVendor) return;
    const isValid = await validateForm(editVendor);
    if (!isValid) return;

    const method = editVendor.id ? "PUT" : "POST";
    const endpoint = editVendor.id ? `/api/vendors/${editVendor.id}` : "/api/vendors";

    try {
      if (USE_MOCK) {
        // create
        if (!editVendor.id) {
          const id = `m_${Date.now()}`;
          const rec: VendorRecord = {
            ...editVendor,
            id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setMockStore((prev) => [rec, ...prev]);
          setToast("판매처가 생성되었습니다");
        } else {
          // update
          setMockStore((prev) => prev.map((p) => (p.id === editVendor.id ? { ...p, ...editVendor, updated_at: new Date().toISOString() } : p)));
          setToast("판매처가 수정되었습니다");
        }
        closeEditModal();
        fetchVendors();
        return;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editVendor.name,
          code: editVendor.code,
          platform: editVendor.platform,
          is_active: editVendor.is_active,
          settings: editVendor.settings || {},
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "저장에 실패했습니다");
      }
      setToast(editVendor.id ? "판매처가 수정되었습니다" : "판매처가 생성되었습니다");
      closeEditModal();
      fetchVendors();
    } catch (err: any) {
      setToast(err.message || "저장 중 문제가 발생했습니다");
    }
  };

  const handleToggleActive = async (vendor: VendorRecord) => {
    try {
      if (USE_MOCK) {
        setMockStore((prev) => prev.map((p) => (p.id === vendor.id ? { ...p, is_active: !vendor.is_active, updated_at: new Date().toISOString() } : p)));
        setToast(!vendor.is_active ? "판매처를 활성화했습니다" : "판매처를 비활성화했습니다");
        fetchVendors();
        return;
      }
      const res = await fetch(`/api/vendors/${vendor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !vendor.is_active }),
      });
      if (!res.ok) throw new Error("상태를 변경할 수 없습니다");
      setToast(!vendor.is_active ? "판매처를 활성화했습니다" : "판매처를 비활성화했습니다");
      fetchVendors();
    } catch (err: any) {
      setToast(err.message || "상태 변경 중 오류가 발생했습니다");
    }
  };

  const handleSync = async (vendor: VendorRecord) => {
    const ok = window.confirm(`${vendor.name}의 상품 동기화를 진행하시겠습니까?`);
    if (!ok) return;
    try {
      if (USE_MOCK) {
        // simulate async
        await new Promise((r) => setTimeout(r, 400));
        setToast("(모의) 상품 동기화 요청을 전송했습니다");
        return;
      }
      const res = await fetch(`/api/vendors/${vendor.id}/sync-products`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("동기화 요청에 실패했습니다");
      setToast("상품 동기화 요청을 전송했습니다");
    } catch (err: any) {
      setToast(err.message || "동기화 중 오류가 발생했습니다");
    }
  };

  const handleDelete = async (vendor: VendorRecord) => {
    const ok = window.confirm(`${vendor.name}을 삭제하시겠습니까? 삭제 시 복구가 어려울 수 있습니다.`);
    if (!ok) return;
    try {
      if (USE_MOCK) {
        setMockStore((prev) => prev.filter((p) => p.id !== vendor.id));
        setToast("판매처를 삭제했습니다");
        fetchVendors();
        return;
      }
      const res = await fetch(`/api/vendors/${vendor.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제에 실패했습니다");
      setToast("판매처를 삭제했습니다");
      fetchVendors();
    } catch (err: any) {
      setToast(err.message || "삭제 중 오류가 발생했습니다");
    }
  };

  const currentRange = useMemo(() => {
    const start = meta.total === 0 ? 0 : meta.offset + 1;
    const end = Math.min(meta.offset + pageSize, meta.total);
    return { start, end };
  }, [meta.offset, meta.total, pageSize]);

  return (
    <Container maxWidth="6xl" padding="lg">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">판매처 관리</h1>
            <p className="text-sm text-gray-600">판매처를 조회하고 연결 상태를 관리합니다.</p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-2 text-sm">
              {[
                { href: '/vendors/personal-data-retention', label: '개인정보보관기간' },
                { href: '/vendors/realtime-settings', label: '실시간 설정' },
                { href: '/vendors/autobot-log', label: 'Autobot Log' },
                { href: '/vendors/change-password', label: '비밀번호 수정' },
                { href: '/vendors/vendor-edit', label: '판매처 수정(목업)' },
                { href: '/vendors/fixed-addresses', label: '고정배송지' },
              ].map((link) => {
                const active = router.pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2 py-1 rounded ${active ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => openEditModal()}>
                새로운 판매처 등록
              </Button>
            </div>
          </div>
        </header>

        <Card padding="lg" className="shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
              <div className="md:w-64">
                <label className="mb-1 block text-sm font-medium text-gray-700">검색</label>
                <Input
                  placeholder="판매처 이름, 코드 검색"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  fullWidth
                />
              </div>
              <div className="md:w-48">
                <label className="mb-1 block text-sm font-medium text-gray-700">플랫폼</label>
                <select
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={platformFilter}
                  onChange={(e) => {
                    setPlatformFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  {PLATFORM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:w-48">
                <label className="mb-1 block text-sm font-medium text-gray-700">상태</label>
                <select
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                총 {meta.total.toLocaleString()}개 중 {currentRange.start}–{currentRange.end}
              </span>
              <select
                className="rounded border border-gray-300 px-2 py-2 text-sm"
                value={pageSize}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setPageSize(next);
                  setPage(0);
                }}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}개씩 보기
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="shadow-sm">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">로딩 중...</div>
          ) : error ? (
            <div className="rounded border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          ) : vendors.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              조건에 맞는 판매처가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">이름</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">코드</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">플랫폼</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">등록일</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{vendor.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{vendor.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{vendor.platform}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            vendor.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {vendor.is_active ? "활성" : "비활성"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(vendor.created_at)}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => openViewModal(vendor.id)}
                            aria-label={`${vendor.name} 상세 보기`}
                          >
                            보기
                          </Button>
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => openEditModal(vendor)}
                            aria-label={`${vendor.name} 수정하기`}
                          >
                            수정
                          </Button>
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => handleToggleActive(vendor)}
                            aria-label={`${vendor.name} ${vendor.is_active ? "비활성화" : "활성화"}`}
                          >
                            {vendor.is_active ? "비활성" : "활성"}
                          </Button>
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => handleSync(vendor)}
                            aria-label={`${vendor.name} 상품 동기화`}
                          >
                            동기화
                          </Button>
                          <Button
                            size="small"
                            variant="danger"
                            onClick={() => handleDelete(vendor)}
                            aria-label={`${vendor.name} 삭제`}
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && vendors.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                페이지 {page + 1} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page <= 0}
                >
                  이전
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page >= totalPages - 1}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={isViewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="판매처 상세"
        size="big"
      >
        {viewVendor ? (
          <div className="space-y-4 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">이름</span>
                <p className="font-medium text-gray-900">{viewVendor.name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">코드</span>
                <p className="font-medium text-gray-900">{viewVendor.code}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">플랫폼</span>
                <p className="font-medium text-gray-900">{viewVendor.platform}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">상태</span>
                <p className="font-medium text-gray-900">{viewVendor.is_active ? "활성" : "비활성"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">등록일</span>
                <p className="font-medium text-gray-900">{formatDate(viewVendor.created_at)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">수정일</span>
                <p className="font-medium text-gray-900">{formatDate(viewVendor.updated_at)}</p>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">설정 정보</span>
              <pre className="mt-1 max-h-48 overflow-auto rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                {JSON.stringify(viewVendor.settings ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-gray-500">판매처 정보를 불러오는 중입니다...</div>
        )}
      </Modal>

      <Modal
        open={isEditModalOpen}
        onClose={closeEditModal}
        title={editVendor?.id ? "판매처 수정" : "판매처 생성"}
        size="big"
        footer={(
          <Stack direction="row" gap={2} justify="end">
            <Button variant="outline" onClick={closeEditModal}>
              취소
            </Button>
            <Button variant="primary" onClick={handleSaveVendor}>
              저장
            </Button>
          </Stack>
        )}
      >
        {editVendor && (
          <div className="space-y-4 text-sm">
            <div>
              <label className="mb-1 block font-medium text-gray-700">이름 *</label>
              <Input
                value={editVendor.name}
                onChange={(e) => setEditVendor({ ...editVendor, name: e.target.value })}
                fullWidth
                state={formErrors.name ? "error" : "default"}
                errorMessage={formErrors.name}
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-gray-700">코드 *</label>
              <Input
                value={editVendor.code}
                onChange={(e) => setEditVendor({ ...editVendor, code: e.target.value.toUpperCase() })}
                fullWidth
                state={formErrors.code ? "error" : "default"}
                errorMessage={formErrors.code}
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-gray-700">플랫폼</label>
              <select
                className="w-full rounded border border-gray-300 px-3 py-2"
                value={editVendor.platform}
                onChange={(e) =>
                  setEditVendor({ ...editVendor, platform: e.target.value as VendorRecord['platform'] })
                }
              >
                {PLATFORM_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="vendor-active-toggle"
                type="checkbox"
                checked={editVendor.is_active}
                onChange={(e) => setEditVendor({ ...editVendor, is_active: e.target.checked })}
              />
              <label htmlFor="vendor-active-toggle" className="text-sm text-gray-700">
                활성 상태
              </label>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed right-4 bottom-4 flex max-w-sm items-start gap-3 rounded-md border border-gray-200 bg-white p-4 shadow-lg">
          <div className="flex-1 text-sm text-gray-800">{toast}</div>
          <button
            type="button"
            className="text-xs font-medium text-blue-600"
            onClick={() => setToast(null)}
          >
            닫기
          </button>
        </div>
      )}
    </Container>
  );
};

export default SalesManagementPage;
