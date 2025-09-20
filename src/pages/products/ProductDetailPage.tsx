import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Container,
  Card,
  Button,
  Badge,
  Stack,
  Modal,
} from "../../design-system";
import Toast from "../../components/Toast";
import { normalizeProductGroup } from "../../utils/groupUtils";
import { useRouter } from "next/router";
import {
  formatDate,
  formatPrice,
} from "../../utils/productUtils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop";

const PAGE_SECTIONS = [
  { id: "overview", label: "요약" },
  { id: "media", label: "이미지" },
  { id: "options", label: "옵션" },
  { id: "extra", label: "추가 정보" },
  { id: "description", label: "상세 설명" },
];

interface ProductDetailPageProps {
  productId?: string;
  onNavigate?: (page: string, productId?: string) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId: propProductId,
  onNavigate,
}) => {
  // id 추출 우선순위: prop -> Next.js router.query -> query string ?id= -> last path segment -> fallback
  const router = useRouter();
  const fromRouter = router?.query?.id ? String(router.query.id) : undefined;
  const fromSearch =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("id") || undefined
      : undefined;
  const fromPath =
    typeof window !== "undefined"
      ? ((): string | undefined => {
          try {
            const segs = window.location.pathname.split("/").filter(Boolean);
            if (segs.length === 0) return undefined;
            // assume last segment is id when path looks like /products/123
            return segs[segs.length - 1];
          } catch (e) {
            return undefined;
          }
        })()
      : undefined;

  const productId =
    propProductId || fromRouter || fromSearch || fromPath || "1";
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState<any>(null);
  // editing: true = form editable, false = read-only
  const [editing, setEditing] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [classificationNames, setClassificationNames] = useState<
    Record<string, string>
  >({});
  const descEditorRef = useRef<HTMLDivElement | null>(null);
  const purifyRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    import("dompurify")
      .then((mod) => {
        purifyRef.current = (mod.default || mod);
      })
      .catch(() => {
        purifyRef.current = null;
      });
  }, []);

  const sanitizeHtml = (html: string) => {
    try {
      if (purifyRef.current && purifyRef.current.sanitize) {
        return purifyRef.current.sanitize(html);
      }
    } catch (e) {
      // fallthrough to regex fallback
    }
    return String(html).replace(/<script[\s\S]*?>[\s\S]*?<\/[\s]*script>/gi, "");
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(String(ev.target?.result || ""));
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [imageDrafts, setImageDrafts] = useState<Record<number, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const replaceImageInputRef = useRef<HTMLInputElement | null>(null);
  const addImageInputRef = useRef<HTMLInputElement | null>(null);
  const pendingReplaceIndexRef = useRef<number | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<string>(PAGE_SECTIONS[0].id);
  const sectionOrder = useMemo(() => PAGE_SECTIONS.map((section) => section.id), []);

  const registerSectionRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    console.debug("[ProductDetailPage] fetching product id=", productId);
    fetch(`/api/products/${productId}`)
      .then(async (r) => {
        if (!mounted) return;
        if (!r.ok) {
          console.warn(
            "[ProductDetailPage] product fetch non-ok status=",
            r.status,
          );
          const pid = Number(productId) || Date.now();
          setProduct({
            id: pid,
            code: `PRD-PLACEHOLDER-${pid}`,
            name: `샘플 상품 (${pid})`,
            selling_price: 0,
            supply_price: 0,
            cost_price: 0,
            images: [],
            variants: [],
            description: "데모 환경: 실제 데이터가 없습니다.",
          });
          return;
        }
        const data = await r.json();
        // Some API routes return `{ product }`, others return the raw product.
        const resolved = data?.product ?? data;
        console.debug("[ProductDetailPage] fetched data=", resolved);
        setProduct(resolved || null);
      })
      .catch((e) => {
        console.error("[ProductDetailPage] fetch error", e);
        if (!mounted) return;
        const pid = Number(productId) || Date.now();
        setProduct({
          id: pid,
          code: `PRD-PLACEHOLDER-${pid}`,
          name: `샘플 상품 (${pid})`,
          selling_price: 0,
          supply_price: 0,
          cost_price: 0,
          images: [],
          variants: [],
          description: "데모 환경: 실제 데이터가 없습니다. (네트워크 오류)",
        });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [productId]);

  // normalize product when fetched
  useEffect(() => {
    if (!product) return;
    setProduct((prev: any) => normalizeProductGroup(prev));
  }, [product?.id]);

  // Debug: log when loading finishes but product is null
  useEffect(() => {
    if (!loading && !product) {
      console.warn(
        "[ProductDetailPage] finished loading but product is null for id=",
        productId,
      );
    }
  }, [loading, product, productId]);

  // load classification names for display
  useEffect(() => {
    let mounted = true;
    fetch("/api/meta/classifications")
      .then((r) => r.json())
      .then((body) => {
        if (!mounted) return;
        const map: Record<string, string> = {};
        const walk = (nodes: any[]) => {
          nodes.forEach((n: any) => {
            map[n.id] = n.name;
            if (n.children) walk(n.children);
          });
        };
        walk(body.classifications || []);
        setClassificationNames(map);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.scrollY + 140;
      let currentId = PAGE_SECTIONS[0].id;
      sectionOrder.forEach((id) => {
        const el = sectionRefs.current[id];
        if (!el) return;
        const elementTop = el.offsetTop;
        if (currentOffset >= elementTop) {
          currentId = id;
        }
      });
      setActiveSection(currentId);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionOrder, product?.id]);

  const images: string[] = useMemo(
    () => (Array.isArray(product?.images) ? [...product.images] : []),
    [product?.images],
  );

  useEffect(() => {
    if (images.length === 0) {
      setSelectedImageIndex(-1);
      return;
    }
    setSelectedImageIndex((prev) => {
      if (prev < 0 || prev >= images.length) return 0;
      return prev;
    });
  }, [images.length]);

  useEffect(() => {
    setImageDrafts({});
  }, [product?.id]);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate("products-list");
    } else {
      // Next.js pages/[id].tsx에서 직접 접근 시 목록으로 이동
      window.location.href = "/products";
    }
  };

  const handleSelectImage = (idx: number) => {
    if (idx < 0 || idx >= images.length) return;
    setSelectedImageIndex(idx);
  };

  const commitImageDraft = (idx: number) => {
    if (idx < 0) return;
    const draft = imageDrafts[idx];
    if (draft === undefined) return;
    setProduct((prev: any) => {
      const imgs = Array.isArray(prev?.images) ? [...prev.images] : [];
      const previousValue = imgs[idx];
      if (previousValue === draft) {
        return prev;
      }
      imgs[idx] = draft;
      const next: any = { ...(prev || {}), images: imgs };
      if (prev?.representative_image === previousValue) {
        next.representative_image = draft;
      }
      return next;
    });
    setImageDrafts((prev) => {
      const copy = { ...prev };
      delete copy[idx];
      return copy;
    });
  };

  const handleImageDraftChange = (idx: number, value: string) => {
    if (idx < 0) return;
    setImageDrafts((prev) => ({ ...prev, [idx]: value }));
  };

  const handleSetRepresentative = (idx: number) => {
    const target = images[idx];
    if (!target) return;
    setProduct((prev: any) => ({ ...(prev || {}), representative_image: target }));
  };

  const handleRemoveImage = (idx: number) => {
    if (idx < 0) return;
    setProduct((prev: any) => {
      const imgs = Array.isArray(prev?.images) ? [...prev.images] : [];
      if (!imgs.length) return prev;
      const removed = imgs.splice(idx, 1)[0];
      const nextRepresentative = prev?.representative_image === removed ? imgs[0] : prev?.representative_image;
      return {
        ...(prev || {}),
        images: imgs,
        representative_image: nextRepresentative,
      };
    });

    setImageDrafts((prev) => {
      if (!Object.keys(prev).length) return prev;
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const numKey = Number(key);
        if (numKey === idx) return;
        if (numKey > idx) next[numKey - 1] = value as string;
        else next[numKey] = value as string;
      });
      return next;
    });

    setSelectedImageIndex((prev) => {
      if (prev < 0) return prev;
      if (prev === idx) return Math.max(0, prev - 1);
      if (prev > idx) return prev - 1;
      return prev;
    });
  };

  const triggerReplaceImage = (idx: number) => {
    if (!editing || idx < 0) return;
    pendingReplaceIndexRef.current = idx;
    replaceImageInputRef.current?.click();
  };

  const handleReplaceImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    const idx = pendingReplaceIndexRef.current;
    if (!file || idx === null) {
      event.target.value = "";
      pendingReplaceIndexRef.current = null;
      return;
    }
    setUploadingIndex(idx);
    try {
      const data = await fileToDataUrl(file);
      setProduct((prev: any) => {
        const imgs = Array.isArray(prev?.images) ? [...prev.images] : [];
        imgs[idx] = data;
        const next: any = { ...(prev || {}), images: imgs };
        if (!prev?.representative_image) {
          next.representative_image = data;
        } else if (prev?.representative_image === prev?.images?.[idx]) {
          next.representative_image = data;
        }
        return next;
      });
      setImageDrafts((prev) => {
        if (!(idx in prev)) return prev;
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
    } catch (err) {
      console.error("file read error", err);
    } finally {
      setUploadingIndex(null);
      pendingReplaceIndexRef.current = null;
      event.target.value = "";
    }
  };

  const triggerAddImages = () => {
    if (!editing) return;
    addImageInputRef.current?.click();
  };

  const handleAddImageFiles = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || !files.length) {
      event.target.value = "";
      return;
    }
    const prevLength = images.length;
    setUploadingIndex(-1);
    try {
      const newImages = await Promise.all(
        Array.from(files).map((file) => fileToDataUrl(file)),
      );
      setProduct((prev: any) => {
        const imgs = Array.isArray(prev?.images) ? [...prev.images] : [];
        const nextImages = [...imgs, ...newImages];
        const nextRepresentative = prev?.representative_image || nextImages[0] || prev?.representative_image;
        return {
          ...(prev || {}),
          images: nextImages,
          representative_image: nextRepresentative,
        };
      });
      if (newImages.length) {
        setSelectedImageIndex(prevLength);
      }
    } catch (err) {
      console.error("file read error", err);
    } finally {
      setUploadingIndex(null);
      event.target.value = "";
    }
  };

  const handleAddBlankImage = () => {
    if (!editing) return;
    const nextIndex = images.length;
    setProduct((prev: any) => {
      const imgs = Array.isArray(prev?.images) ? [...prev.images] : [];
      imgs.push("");
      return { ...(prev || {}), images: imgs };
    });
    setSelectedImageIndex(nextIndex);
    setImageDrafts((prev) => ({ ...prev, [nextIndex]: "" }));
  };

  if (loading) {
    return (
      <Container maxWidth="6xl" padding="lg">
        <div className="text-center py-12">로딩 중...</div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="6xl" padding="lg">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            상품을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            요청하신 상품이 존재하지 않거나 삭제되었습니다.
          </p>
          <Button variant="primary" onClick={handleBack}>
            상품 목록으로 돌아가기
          </Button>
        </div>
      </Container>
    );
  }

  const marginRate = (
    ((product.selling_price - product.cost_price) / product.selling_price) *
    100
  ).toFixed(0);

  const hasImages = images.length > 0;
  const effectiveSelectedIndex = hasImages
    ? Math.min(Math.max(selectedImageIndex, 0), images.length - 1)
    : -1;
  const selectedImageOriginal =
    effectiveSelectedIndex >= 0 ? images[effectiveSelectedIndex] : undefined;
  const selectedImageDraft =
    effectiveSelectedIndex >= 0
      ? imageDrafts[effectiveSelectedIndex] ?? undefined
      : undefined;
  const previewImage = selectedImageDraft ?? selectedImageOriginal;
  const representativeImage = product.representative_image;
  const isSelectedRepresentative =
    !!previewImage && representativeImage === selectedImageOriginal;

  return (
    <>
      <Container
        maxWidth="full"
        padding="lg"
        centered={false}
        className="bg-gray-50 min-h-screen"
      >
        <div className="mx-auto w-full max-w-7xl px-0 lg:px-4">
          <div className="flex flex-col gap-6 lg:flex-row">
            <aside className="hidden w-60 shrink-0 lg:block">
              <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900">상품 섹션</h2>
                <p className="mt-1 text-xs text-gray-500">원하는 영역으로 빠르게 이동하세요.</p>
                <nav className="mt-4 space-y-1">
                  {PAGE_SECTIONS.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        type="button"
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                          isActive
                            ? "bg-blue-50 font-semibold text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                        aria-current={isActive ? "true" : "false"}
                      >
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>
            <div className="min-w-0 flex-1">
              <div className="sticky top-16 z-10 mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm lg:hidden">
                <label htmlFor="mobile-section-nav" className="text-xs font-medium text-gray-500">
                  섹션 이동
                </label>
                <select
                  id="mobile-section-nav"
                  className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                  value={activeSection}
                  onChange={(e) => scrollToSection(e.target.value)}
                >
                  {PAGE_SECTIONS.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-6">
                <section
                  id="overview"
                  data-section-id="overview"
                  ref={registerSectionRef("overview")}
                  className="scroll-mt-28 space-y-4"
                >
                  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="text-blue-600"
                      >
                        ← 목록으로
                      </Button>
                      <Stack direction="row" gap={2} className="flex-wrap">
                        <Button
                          variant={editing ? "outline" : "primary"}
                          aria-pressed={!editing}
                          onClick={() => setEditing((s) => !s)}
                          className="font-medium"
                          title={editing ? "편집 잠금" : "편집 가능"}
                        >
                          {editing ? "잠금" : "수정"}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-blue-500 text-blue-600"
                          onClick={() => {
                            setSettingsForm({
                              is_selling: !!product.is_selling,
                              is_soldout: !!product.is_soldout,
                              is_dutyfree: !!product.is_dutyfree,
                              origin_country: product.origin_country || "",
                              purchase_name: product.purchase_name || "",
                              shipping_policy: product.shipping_policy || "",
                              hs_code: product.hs_code || "",
                              box_qty: product.box_qty || "",
                              is_stock_linked: !!(
                                product.variants &&
                                product.variants[0] &&
                                product.variants[0].is_stock_linked
                              ),
                              classification_id: product.classification_id || "",
                            });
                            setShowSettingsModal(true);
                          }}
                        >
                          상품 설정
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => {
                            if (!confirm("정말 이 상품을 휴지통으로 이동하시겠습니까?"))
                              return;
                            try {
                              const raw = localStorage.getItem("trashed_products_v1");
                              const existing = raw ? JSON.parse(raw) : [];
                              existing.push(product);
                              localStorage.setItem(
                                "trashed_products_v1",
                                JSON.stringify(existing),
                              );
                            } catch (e) {}
                            if (onNavigate) onNavigate("products-list");
                            else window.location.href = "/products";
                          }}
                        >
                          삭제
                        </Button>
                      </Stack>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-800">등록 정보</h3>
                        <dl className="mt-2 space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <dt>등록 아이디</dt>
                            <dd>
                              <strong>
                                {product?.created_by ||
                                  product?.registered_by ||
                                  "api_test"}
                              </strong>
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>등록일자</dt>
                            <dd>
                              {product?.created_at
                                ? `${new Date(product.created_at).toLocaleDateString("ko-KR")} ${new Date(product.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
                                : "-"}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>최종 수정자</dt>
                            <dd>
                              <strong>
                                {product?.updated_by ||
                                  product?.modified_by ||
                                  product?.created_by ||
                                  "api_test"}
                              </strong>
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>최종 수정일</dt>
                            <dd>
                              {product?.updated_at
                                ? `${new Date(product.updated_at).toLocaleDateString("ko-KR")} ${new Date(product.updated_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
                                : "-"}
                            </dd>
                          </div>
                        </dl>
                        <Button
                          variant="outline"
                          size="small"
                          className="mt-3 w-full"
                          onClick={() => {
                            const now = new Date().toISOString();
                            setProduct((prev: any) => ({
                              ...(prev || {}),
                              created_at: now,
                            }));
                          }}
                        >
                          상품등록일자 오늘로 갱신
                        </Button>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-800">가격/재고 요약</h3>
                        <dl className="mt-2 space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <dt>판매가</dt>
                            <dd>{formatPrice(product.selling_price)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>공급가</dt>
                            <dd>{formatPrice(product.supply_price)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>원가</dt>
                            <dd>{formatPrice(product.cost_price)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>총재고</dt>
                            <dd>
                              {product.variants
                                ? (product.variants as any[])
                                    .reduce(
                                      (s: number, v: any) => s + (v.stock || 0),
                                      0,
                                    )
                                    .toLocaleString()
                                : "0"}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>마진률</dt>
                            <dd>{marginRate}%</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>등록일</dt>
                            <dd>{formatDate(product.created_at)}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <Card padding="md" className="shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="text-sm text-gray-600">
                        <div>
                          등록아이디:{" "}
                          <strong>
                            {product?.created_by || product?.registered_by || "api_test"}
                          </strong>{" "}
                          | 등록일자 :{" "}
                          {product?.created_at
                            ? `${new Date(product.created_at).toLocaleDateString("ko-KR")} ${new Date(product.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
                            : "-"}
                        </div>
                        <div>
                          최종수정아이디:{" "}
                          <strong>
                            {product?.updated_by ||
                              product?.modified_by ||
                              product?.created_by ||
                              "api_test"}
                          </strong>{" "}
                          | 최종수정일자 :{" "}
                          {product?.updated_at
                            ? `${new Date(product.updated_at).toLocaleDateString("ko-KR")} ${new Date(product.updated_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
                            : "-"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => {
                            const now = new Date().toISOString();
                            setProduct((prev: any) => ({
                              ...(prev || {}),
                              created_at: now,
                            }));
                          }}
                        >
                          상품등록일자 오늘로 갱신
                        </Button>
                      </div>
                    </div>
                  </Card>
                </section>

                <section
                  id="media"
                  data-section-id="media"
                  ref={registerSectionRef("media")}
                  className="scroll-mt-28"
                >
                  <Card padding="lg" className="shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse min-w-0">
              <colgroup>
                <col className="w-72" />
                <col />
              </colgroup>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600 align-top">
                    대표 이미지
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative w-full max-w-xs">
                          <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-white">
                            <img
                              src={previewImage || FALLBACK_IMAGE}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                              }}
                            />
                            {isSelectedRepresentative && (
                              <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                                대표 이미지
                              </span>
                            )}
                          </div>
                          {uploadingIndex === effectiveSelectedIndex && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 text-xs text-gray-700">
                              업로드 중...
                            </div>
                          )}
                          {!hasImages && !editing && (
                            <div className="mt-2 text-xs text-gray-500">
                              등록된 이미지가 없습니다.
                            </div>
                          )}
                        </div>
                        <div className="min-w-[220px] flex-1 space-y-3">
                          <div>
                            <label className="text-xs text-gray-600">이미지 URL</label>
                            {effectiveSelectedIndex >= 0 ? (
                              <input
                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                value={selectedImageDraft ?? selectedImageOriginal ?? ""}
                                onChange={(e) =>
                                  handleImageDraftChange(
                                    effectiveSelectedIndex,
                                    e.target.value,
                                  )
                                }
                                onBlur={() => commitImageDraft(effectiveSelectedIndex)}
                                placeholder="https:// 혹은 data:image 형식을 입력하세요"
                                disabled={!editing}
                              />
                            ) : (
                              <div className="mt-2 text-sm text-gray-500">
                                등록된 이미지가 없습니다. 아래에서 이미지를 추가하세요.
                              </div>
                            )}
                          </div>
                          {editing && effectiveSelectedIndex >= 0 && (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="small"
                                variant="primary"
                                onClick={() => handleSetRepresentative(effectiveSelectedIndex)}
                                disabled={!selectedImageOriginal || isSelectedRepresentative}
                              >
                                대표 이미지로 설정
                              </Button>
                              <Button
                                size="small"
                                variant="outline"
                                onClick={() => triggerReplaceImage(effectiveSelectedIndex)}
                                disabled={!editing || selectedImageIndex < 0}
                              >
                                파일로 교체
                              </Button>
                              <Button
                                size="small"
                                variant="outline"
                                onClick={() => commitImageDraft(effectiveSelectedIndex)}
                                disabled={selectedImageDraft === undefined}
                              >
                                URL 적용
                              </Button>
                              <Button
                                size="small"
                                variant="outline"
                                onClick={() => handleRemoveImage(effectiveSelectedIndex)}
                                disabled={!hasImages}
                              >
                                삭제
                              </Button>
                            </div>
                          )}
                          {editing && (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                              <Button size="small" variant="outline" onClick={triggerAddImages}>
                                파일 업로드
                              </Button>
                              <Button size="small" variant="outline" onClick={handleAddBlankImage}>
                                URL 슬롯 추가
                              </Button>
                              <span className="text-xs text-gray-500">다중 파일 선택 가능</span>
                              {uploadingIndex === -1 && (
                                <span className="text-xs text-blue-600">업로드 중...</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-600">썸네일 목록</div>
                        {images.length ? (
                          <div className="flex flex-wrap gap-3">
                            {images.map((src: string, idx: number) => {
                              const draftValue = imageDrafts[idx];
                              const thumbSrc = draftValue ?? src ?? FALLBACK_IMAGE;
                              const isActive = effectiveSelectedIndex === idx;
                              const isRepresentative = representativeImage === src;
                              return (
                                <button
                                  type="button"
                                  key={`${src}-${idx}`}
                                  className={`relative h-20 w-20 overflow-hidden rounded border transition focus:outline-none focus:ring ${
                                    isActive
                                      ? "border-blue-500 ring-2 ring-blue-200"
                                      : "border-gray-200"
                                  }`}
                                  onClick={() => handleSelectImage(idx)}
                                  title={`이미지 ${idx + 1}`}
                                >
                                  <img
                                    src={thumbSrc || FALLBACK_IMAGE}
                                    alt={`thumb-${idx}`}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                    }}
                                  />
                                  {isRepresentative && (
                                    <span className="absolute left-1 top-1 rounded bg-blue-600 px-1 text-[10px] font-semibold text-white">
                                      대표
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded border border-dashed px-4 py-6 text-center text-sm text-gray-500">
                            이미지가 없습니다. 파일 업로드 또는 URL 슬롯 추가 버튼을 사용하세요.
                          </div>
                        )}
                      </div>
                      <input
                        ref={replaceImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleReplaceImageFileChange}
                        className="hidden"
                      />
                      <input
                        ref={addImageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAddImageFiles}
                        className="hidden"
                      />
                    </div>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600">상품명</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {editing ? (
                      <input
                        className="w-full px-2 py-1 border rounded"
                        value={product.name || ""}
                        onChange={(e) =>
                          setProduct((p: any) => ({
                            ...(p || {}),
                            name: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      product.name
                    )}
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600">기본 정보</td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div>상품ID: {product.id}</div>
                      <div>
                        코드:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded"
                            value={product.code || ""}
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                code: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          product.code
                        )}
                      </div>
                      <div>
                        브랜드:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded"
                            value={product.brand || ""}
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                brand: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          product.brand || "-"
                        )}
                      </div>
                      <div>공급사ID: {product.supplier_id || "-"}</div>
                    </div>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    가격 / 재고
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        판매가:{" "}
                        <strong>
                          {editing ? (
                            <input
                              className="px-2 py-1 border rounded text-right"
                              value={String(product.selling_price || 0)}
                              onChange={(e) =>
                                setProduct((p: any) => ({
                                  ...(p || {}),
                                  selling_price: Number(e.target.value || 0),
                                }))
                              }
                            />
                          ) : (
                            formatPrice(product.selling_price)
                          )}
                        </strong>
                      </div>
                      <div>
                        원가:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded text-right"
                            value={String(product.cost_price || 0)}
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                cost_price: Number(e.target.value || 0),
                              }))
                            }
                          />
                        ) : (
                          formatPrice(product.cost_price)
                        )}
                      </div>
                      <div>
                        공급가:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded text-right"
                            value={String(product.supply_price || 0)}
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                supply_price: Number(e.target.value || 0),
                              }))
                            }
                          />
                        ) : (
                          formatPrice(product.supply_price)
                        )}
                      </div>
                      <div>
                        총재고:{" "}
                        <strong>
                          {product.variants
                            ? (product.variants as any[])
                                .reduce(
                                  (s: number, v: any) => s + (v.stock || 0),
                                  0,
                                )
                                .toLocaleString()
                            : "0"}
                        </strong>
                      </div>
                      <div>
                        마진률: <strong>{marginRate}%</strong>
                      </div>
                      <div>등록일: {formatDate(product.created_at)}</div>
                    </div>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600">추가 속성</td>
                  <td className="px-4 py-3 text-gray-700 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      공급처:{" "}
                      <strong>{product?.supplier_name || "자사"}</strong>
                    </div>
                    <div>
                      원산지:{" "}
                      {editing ? (
                        <input
                          className="px-2 py-1 border rounded"
                          value={product.origin_country || ""}
                          onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              origin_country: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        product?.origin_country || "미지정"
                      )}
                    </div>
                    <div>
                      사입상품명:{" "}
                      {editing ? (
                        <input
                          className="px-2 py-1 border rounded"
                          value={product.purchase_name || ""}
                          onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              purchase_name: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        product?.purchase_name || "미입력"
                      )}
                    </div>
                    <div>
                      배송비정책:{" "}
                      {editing ? (
                        <input
                          className="px-2 py-1 border rounded"
                          value={product.shipping_policy || ""}
                          onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              shipping_policy: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        product?.shipping_policy || "미지정"
                      )}
                    </div>
                    <div>
                      HS Code:{" "}
                      {editing ? (
                        <input
                          className="px-2 py-1 border rounded"
                          value={product.hs_code || ""}
                          onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              hs_code: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        product.hs_code || "-"
                      )}
                    </div>
                    <div>
                      박스당수량:{" "}
                      {editing ? (
                        <input
                          className="px-2 py-1 border rounded w-24"
                          value={product.box_qty || ""}
                          onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              box_qty: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        product.box_qty || "-"
                      )}
                    </div>
                    <div>
                      재고연동:{" "}
                      {editing ? (
                        <select
                          value={
                            product.variants &&
                            product.variants[0] &&
                            product.variants[0].is_stock_linked
                              ? "1"
                              : "0"
                          }
                          onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              variants: p?.variants
                                ? p.variants.map((v: any, i: number) =>
                                    i === 0
                                      ? {
                                          ...v,
                                          is_stock_linked:
                                            e.target.value === "1",
                                        }
                                      : v,
                                  )
                                : p?.variants,
                            }))
                          }
                          className="px-2 py-1 border rounded"
                        >
                          <option value="1">연동</option>
                          <option value="0">미연동</option>
                        </select>
                      ) : product.variants &&
                        product.variants[0] &&
                        product.variants[0].is_stock_linked ? (
                        "연동"
                      ) : (
                        "미연동"
                      )}
                    </div>
                    <div>
                      분류:{" "}
                      {editing ? (
                        <input
                          className="px-2 py-1 border rounded"
                          value={
                            classificationNames[product.classification_id] ||
                            product.classification ||
                            ""
                          }
                          onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              classification: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        classificationNames[product.classification_id] ||
                        product.classification ||
                        "미지정"
                      )}
                    </div>
                    <div>
                      외부몰 데이터:{" "}
                      {product.externalMall?.platform ||
                        product.externalMall?.platformName ||
                        "없음"}
                    </div>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600 align-top">
                    태그
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {editing ? (
                        <input
                          className="px-2 py-1 border rounded w-full"
                          value={(product.tags || []).join(", ")}
                          onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              tags: e.target.value
                                .split(",")
                                .map((s: string) => s.trim())
                                .filter(Boolean),
                            }))
                          }
                        />
                      ) : (
                        product.tags &&
                        product.tags.map((t: string) => (
                          <Badge key={t} variant="neutral">
                            {t}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                </tr>

                {/* 상세 설명은 아래의 상세 설명 카드에서 보여줍니다 (중복 제거) */}
              </tbody>
            </table>
          </div>
        </Card>

      </section>

      <section
        id="options"
        data-section-id="options"
        ref={registerSectionRef("options")}
        className="scroll-mt-28"
      >
        <Card padding="lg" className="shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">상품 옵션</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden min-w-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                    옵션명
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                    코드
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                    바코드1
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                    바코드2
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                    바코드3
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                    판매가
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                    원가
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                    공급가
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                    재고
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                    위치
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {product.variants &&
                  (product.variants as any[]).map(
                    (variant: any, vIdx: number) => (
                      <tr
                        key={variant.id || vIdx}
                        className="bg-white border-b border-gray-100"
                      >
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {editing ? (
                            <input
                              className="w-full px-2 py-1 border rounded"
                              value={variant.variant_name || ""}
                              onChange={(e) =>
                                setProduct((p: any) => {
                                  const copy = JSON.parse(JSON.stringify(p));
                                  copy.variants[vIdx].variant_name =
                                    e.target.value;
                                  return copy;
                                })
                              }
                            />
                          ) : (
                            variant.variant_name
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {editing ? (
                            <input
                              className="px-2 py-1 border rounded"
                              value={variant.code || ""}
                              onChange={(e) =>
                                setProduct((p: any) => {
                                  const copy = JSON.parse(JSON.stringify(p));
                                  copy.variants[vIdx].code = e.target.value;
                                  return copy;
                                })
                              }
                            />
                          ) : (
                            variant.code
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {editing ? (
                            <input
                              className="px-2 py-1 border rounded"
                              value={variant.barcode1 || ""}
                              onChange={(e) =>
                                setProduct((p: any) => {
                                  const copy = JSON.parse(JSON.stringify(p));
                                  copy.variants[vIdx].barcode1 = e.target.value;
                                  return copy;
                                })
                              }
                            />
                          ) : (
                            variant.barcode1
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {editing ? (
                            <input
                              className="px-2 py-1 border rounded"
                              value={variant.barcode2 || ""}
                              onChange={(e) =>
                                setProduct((p: any) => {
                                  const copy = JSON.parse(JSON.stringify(p));
                                  copy.variants[vIdx].barcode2 = e.target.value;
                                  return copy;
                                })
                              }
                            />
                          ) : (
                            variant.barcode2 || "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {editing ? (
                            <input
                              className="px-2 py-1 border rounded"
                              value={variant.barcode3 || ""}
                              onChange={(e) =>
                                setProduct((p: any) => {
                                  const copy = JSON.parse(JSON.stringify(p));
                                  copy.variants[vIdx].barcode3 = e.target.value;
                                  return copy;
                                })
                              }
                            />
                          ) : (
                            variant.barcode3 || "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-green-700 font-bold">
                          {editing ? (
                            <input
                              className="w-24 px-2 py-1 border rounded text-right"
                              value={String(variant.selling_price || 0)}
                              onChange={(e) =>
                                setProduct((p: any) => {
                                  const copy = JSON.parse(JSON.stringify(p));
                                  copy.variants[vIdx].selling_price = Number(
                                    e.target.value || 0,
                                  );
                                  return copy;
                                })
                              }
                            />
                          ) : (
                            formatPrice(variant.selling_price)
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {editing ? (
                            <input
                              className="w-24 px-2 py-1 border rounded text-right"
                              value={String(variant.cost_price || 0)}
                              onChange={(e) =>
                                setProduct((p: any) => {
                                  const copy = JSON.parse(JSON.stringify(p));
                                  copy.variants[vIdx].cost_price = Number(
                                    e.target.value || 0,
                                  );
                                  return copy;
                                })
                              }
                            />
                          ) : (
                            formatPrice(variant.cost_price)
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-700 font-bold">
                          {editing ? (
                            <input
                              className="w-24 px-2 py-1 border rounded text-right"
                              value={String(variant.supply_price || 0)}
                              onChange={(e) =>
                                setProduct((p: any) => {
                                  const copy = JSON.parse(JSON.stringify(p));
                                  copy.variants[vIdx].supply_price = Number(
                                    e.target.value || 0,
                                  );
                                  return copy;
                                })
                              }
                            />
                          ) : (
                            formatPrice(variant.supply_price)
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {editing ? (
                            <input
                              className="w-20 px-2 py-1 border rounded text-right"
                              value={String(variant.stock || 0)}
                              onChange={(e) =>
                                setProduct((p: any) => {
                                  const copy = JSON.parse(JSON.stringify(p));
                                  copy.variants[vIdx].stock = Number(
                                    e.target.value || 0,
                                  );
                                  return copy;
                                })
                              }
                            />
                          ) : (
                            `${variant.stock}개`
                          )}
                        </td>
                        <td className="px-4 py-3 text-left text-gray-700">
                          {editing ? (
                            <input
                              className="px-2 py-1 border rounded"
                              value={variant.warehouse_location || ""}
                              onChange={(e) =>
                                setProduct((p: any) => {
                                  const copy = JSON.parse(JSON.stringify(p));
                                  copy.variants[vIdx].warehouse_location =
                                    e.target.value;
                                  return copy;
                                })
                              }
                            />
                          ) : (
                            variant.warehouse_location || "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-1 justify-center">
                            {variant.is_selling ? (
                              <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">
                                판매중
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                                판매중지
                              </span>
                            )}
                            {variant.is_soldout ? (
                              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs">
                                품절
                              </span>
                            ) : null}
                            {variant.is_for_sale === false ? (
                              <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs">
                                미판매
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section
        id="extra"
        data-section-id="extra"
        ref={registerSectionRef("extra")}
        className="scroll-mt-28"
      >
        <Card padding="lg" className="shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">추가 정보</h2>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-gray-600">가로(cm)</label>
                  {editing ? (
                    <input
                      className="mt-1 w-full rounded border px-2 py-2"
                      value={
                        product.width_cm ??
                        (product.variants && product.variants[0] && product.variants[0].width_cm) ??
                        ""
                      }
                      onChange={(e) =>
                        setProduct((p: any) => ({ ...(p || {}), width_cm: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="mt-1">
                      {product.width_cm ||
                        (product.variants && product.variants[0] && product.variants[0].width_cm) ||
                        "-"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-600">세로(cm)</label>
                  {editing ? (
                    <input
                      className="mt-1 w-full rounded border px-2 py-2"
                      value={
                        product.height_cm ??
                        (product.variants && product.variants[0] && product.variants[0].height_cm) ??
                        ""
                      }
                      onChange={(e) =>
                        setProduct((p: any) => ({ ...(p || {}), height_cm: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="mt-1">
                      {product.height_cm ||
                        (product.variants && product.variants[0] && product.variants[0].height_cm) ||
                        "-"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-600">높이(cm)</label>
                  {editing ? (
                    <input
                      className="mt-1 w-full rounded border px-2 py-2"
                      value={
                        product.depth_cm ??
                        (product.variants && product.variants[0] && product.variants[0].depth_cm) ??
                        ""
                      }
                      onChange={(e) =>
                        setProduct((p: any) => ({ ...(p || {}), depth_cm: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="mt-1">
                      {product.depth_cm ||
                        (product.variants && product.variants[0] && product.variants[0].depth_cm) ||
                        "-"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-600">무게(g)</label>
                  {editing ? (
                    <input
                      className="mt-1 w-full rounded border px-2 py-2"
                      value={
                        product.weight_g ??
                        (product.variants && product.variants[0] && product.variants[0].weight_g) ??
                        ""
                      }
                      onChange={(e) =>
                        setProduct((p: any) => ({ ...(p || {}), weight_g: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="mt-1">
                      {product.weight_g ||
                        (product.variants && product.variants[0] && product.variants[0].weight_g) ||
                        "-"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-600">부피(cc)</label>
                  {editing ? (
                    <input
                      className="mt-1 w-full rounded border px-2 py-2"
                      value={
                        product.volume_cc ??
                        (product.variants && product.variants[0] && product.variants[0].volume_cc) ??
                        ""
                      }
                      onChange={(e) =>
                        setProduct((p: any) => ({ ...(p || {}), volume_cc: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="mt-1">
                      {product.volume_cc ||
                        (product.variants && product.variants[0] && product.variants[0].volume_cc) ||
                        "-"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-600">원산지</label>
                  {editing ? (
                    <input
                      className="mt-1 w-full rounded border px-2 py-2"
                      value={product.origin_country || ""}
                      onChange={(e) =>
                        setProduct((p: any) => ({ ...(p || {}), origin_country: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="mt-1">{product.origin_country || "-"}</div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600">외부몰 데이터</label>
                {editing ? (
                  <input
                    className="mt-1 w-full rounded border px-2 py-2"
                    value={
                      product.externalMall?.platform ||
                      product.externalMall?.platformName ||
                      ""
                    }
                    onChange={(e) =>
                      setProduct((p: any) => ({
                        ...(p || {}),
                        externalMall: {
                          ...(p.externalMall || {}),
                          platform: e.target.value,
                        },
                      }))
                    }
                  />
                ) : (
                  <div className="mt-1">
                    {product.externalMall?.platform ||
                      product.externalMall?.platformName ||
                      "없음"}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-2">메모</div>
              {editing ? (
                <div className="space-y-2">
                  {(product.memos || []).map((m: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <input
                        className="flex-1 rounded border px-2 py-2"
                        value={m}
                        onChange={(e) =>
                          setProduct((p: any) => {
                            const memos = Array.isArray(p.memos)
                              ? [...p.memos]
                              : [];
                            memos[idx] = e.target.value;
                            return { ...(p || {}), memos };
                          })
                        }
                      />
                      <button
                        className="rounded border px-2 py-1 text-sm"
                        onClick={() =>
                          setProduct((p: any) => {
                            const memos = Array.isArray(p.memos)
                              ? [...p.memos]
                              : [];
                            memos.splice(idx, 1);
                            return { ...(p || {}), memos };
                          })
                        }
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  <button
                    className="rounded border px-3 py-1 text-sm"
                    onClick={() =>
                      setProduct((p: any) => ({
                        ...(p || {}),
                        memos: [...(p.memos || []), ""],
                      }))
                    }
                  >
                    메모 추가
                  </button>
                </div>
              ) : (
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {(product.memos || []).map((m: string, idx: number) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      </section>

      <section
        id="description"
        data-section-id="description"
        ref={registerSectionRef("description")}
        className="scroll-mt-28"
      >
        <Card padding="lg" className="shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            상품 상세 설명
          </h2>
          <div className="prose max-w-none text-lg text-gray-700">
            {/* Show WYSIWYG HTML editor when editing, otherwise sanitized render */}
            {editing ? (
              <div>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    className="px-2 py-1 border rounded text-sm"
                    onClick={() => {
                      document.execCommand("bold");
                      descEditorRef.current?.focus();
                    }}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 border rounded text-sm"
                    onClick={() => {
                      document.execCommand("italic");
                      descEditorRef.current?.focus();
                    }}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 border rounded text-sm"
                    onClick={() => {
                      document.execCommand("underline");
                      descEditorRef.current?.focus();
                    }}
                  >
                    U
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 border rounded text-sm"
                    onClick={() => {
                      const url = window.prompt("링크 URL 입력:");
                      if (url) document.execCommand("createLink", false, url);
                      descEditorRef.current?.focus();
                    }}
                  >
                    link
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 border rounded text-sm"
                    onClick={() => {
                      const src = window.prompt("이미지 URL 입력:");
                      if (src) document.execCommand("insertImage", false, src);
                      descEditorRef.current?.focus();
                    }}
                  >
                    img
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 border rounded text-sm"
                    onClick={() => {
                      document.execCommand("insertUnorderedList");
                      descEditorRef.current?.focus();
                    }}
                  >
                    ul
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 border rounded text-sm"
                    onClick={() => {
                      document.execCommand("insertOrderedList");
                      descEditorRef.current?.focus();
                    }}
                  >
                    ol
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 border rounded text-sm"
                    onClick={() => {
                      document.execCommand("removeFormat");
                      descEditorRef.current?.focus();
                    }}
                  >
                    clear
                  </button>
                </div>
                <div
                  ref={descEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-[160px] p-3 border rounded bg-white prose max-w-none text-base text-gray-800"
                  onInput={(e) => {
                    const html = (e.target as HTMLDivElement).innerHTML;
                    setProduct((p: any) => ({ ...(p || {}), description: html }));
                  }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(String(product.description || "")),
                  }}
                />
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(String(product.description || "")),
                }}
              />
            )}
          </div>
        </Card>
      </section>

              </div>
            </div>
          </div>
        </div>

        {/* 상품 설정 모달 */}
        <Modal
          open={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title="상품 설정"
        >
          <div className="space-y-4">
            <div className="font-bold text-lg">OMS 상품 설정</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">활성화</div>
                <div>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!settingsForm?.is_active}
                      onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), is_active: e.target.checked }))
                      }
                    />
                    <span className="text-sm">활성</span>
                  </label>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">판매중</div>
                <div>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!settingsForm?.is_selling}
                      onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), is_selling: e.target.checked }))
                      }
                    />
                    <span className="text-sm">판매중</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">품절</div>
                <div>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!settingsForm?.is_soldout}
                      onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), is_soldout: e.target.checked }))
                      }
                    />
                    <span className="text-sm">품절</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">면세여부</div>
                <div>
                  <select
                    value={settingsForm?.is_dutyfree ? "1" : "0"}
                    onChange={(e) =>
                      setSettingsForm((s: any) => ({ ...(s || {}), is_dutyfree: e.target.value === "1" }))
                    }
                    className="px-2 py-1 border rounded"
                  >
                    <option value="1">면세</option>
                    <option value="0">과세</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">원산지</div>
                <input
                  className="w-full px-2 py-1 border rounded"
                  value={settingsForm?.origin_country || ""}
                  onChange={(e) =>
                    setSettingsForm((s: any) => ({ ...(s || {}), origin_country: e.target.value }))
                  }
                />
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">사입상품명</div>
                <input
                  className="w-full px-2 py-1 border rounded"
                  value={settingsForm?.purchase_name || ""}
                  onChange={(e) =>
                    setSettingsForm((s: any) => ({ ...(s || {}), purchase_name: e.target.value }))
                  }
                />
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">배송비정책</div>
                <input
                  className="w-full px-2 py-1 border rounded"
                  value={settingsForm?.shipping_policy || ""}
                  onChange={(e) =>
                    setSettingsForm((s: any) => ({ ...(s || {}), shipping_policy: e.target.value }))
                  }
                />
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">HS Code</div>
                <input
                  className="w-full px-2 py-1 border rounded"
                  value={settingsForm?.hs_code || ""}
                  onChange={(e) =>
                    setSettingsForm((s: any) => ({ ...(s || {}), hs_code: e.target.value }))
                  }
                />
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">박스당수량</div>
                <input
                  className="w-full px-2 py-1 border rounded"
                  value={settingsForm?.box_qty || ""}
                  onChange={(e) =>
                    setSettingsForm((s: any) => ({ ...(s || {}), box_qty: e.target.value }))
                  }
                />
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">재고연동 (첫 옵션)</div>
                <select
                  value={settingsForm?.is_stock_linked ? "1" : "0"}
                  onChange={(e) =>
                    setSettingsForm((s: any) => ({ ...(s || {}), is_stock_linked: e.target.value === "1" }))
                  }
                  className="px-2 py-1 border rounded"
                >
                  <option value="1">연동</option>
                  <option value="0">미연동</option>
                </select>
              </div>

              <div className="col-span-2">
                <div className="text-sm text-gray-600 mb-1">분류 ID</div>
                <input
                  className="w-full px-2 py-1 border rounded"
                  value={settingsForm?.classification_id || ""}
                  onChange={(e) =>
                    setSettingsForm((s: any) => ({ ...(s || {}), classification_id: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowSettingsModal(false)}
              >
                닫기
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  // apply settingsForm to product (local state)
                  if (settingsForm) {
                    setProduct((prev: any) => ({
                      ...(prev || {}),
                      is_selling: !!settingsForm.is_selling,
                      is_soldout: !!settingsForm.is_soldout,
                      is_dutyfree: !!settingsForm.is_dutyfree,
                      origin_country: settingsForm.origin_country,
                      purchase_name: settingsForm.purchase_name,
                      shipping_policy: settingsForm.shipping_policy,
                      hs_code: settingsForm.hs_code,
                      box_qty: settingsForm.box_qty,
                      classification_id: settingsForm.classification_id,
                      // propagate stock link to first variant if present
                      variants: prev?.variants
                        ? prev.variants.map((v: any, i: number) =>
                            i === 0
                              ? {
                                  ...(v || {}),
                                  is_stock_linked: !!settingsForm.is_stock_linked,
                                }
                              : v,
                          )
                        : prev?.variants,
                    }));
                  }
                  setShowSettingsModal(false);
                  setToast("상품 설정이 저장되었습니다.");
                }}
              >
                저장
              </Button>
            </div>
          </div>
        </Modal>

      </Container>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default ProductDetailPage;
