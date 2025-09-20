import React, { useState, useMemo, useEffect } from "react";
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
  getStockStatus,
} from "../../utils/productUtils";

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

  const handleBack = () => {
    if (onNavigate) {
      onNavigate("products-list");
    } else {
      // Next.js pages/[id].tsx에서 직접 접근 시 목록으로 이동
      window.location.href = "/products";
    }
  };

  const handleVariantNavigate = (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    variant: any,
    index: number,
  ) => {
    if (!variant) return;
    const target = event.target as HTMLElement | null;
    if (target && target.closest("input, button, a, textarea, select, [role='button']")) {
      return;
    }
    const pid = product?.id ?? productId;
    if (!pid) return;
    const resolvedVariantId =
      variant.id ??
      variant.variant_id ??
      variant.code ??
      variant.option_code ??
      variant.barcode1 ??
      variant.barcode ??
      `index-${index}`;
    const nextPath = `/products/${encodeURIComponent(String(pid))}/options/${encodeURIComponent(String(resolvedVariantId))}`;
    try {
      router?.push?.(nextPath);
    } catch (err) {
      if (typeof window !== "undefined") {
        window.location.href = nextPath;
      }
    }
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

  const sellingPriceValue = Number(product?.selling_price ?? 0);
  const costPriceValue = Number(product?.cost_price ?? 0);
  const supplyPriceValue = Number(product?.supply_price ?? 0);
  const marginRate = sellingPriceValue
    ? (
        ((sellingPriceValue - costPriceValue) / sellingPriceValue) * 100
      ).toFixed(0)
    : null;
  const consumerPriceValue =
    typeof product?.consumer_price === "number"
      ? product.consumer_price
      : typeof product?.pricing?.consumerPrice === "number"
        ? product.pricing.consumerPrice
        : null;
  const marketPriceValue =
    typeof product?.market_price === "number"
      ? product.market_price
      : typeof product?.pricing?.marketPrice === "number"
        ? product.pricing.marketPrice
        : null;
  const marginAmountValue = (() => {
    if (typeof product?.margin_amount === "number") {
      return product.margin_amount;
    }
    if (
      Number.isFinite(sellingPriceValue) &&
      Number.isFinite(supplyPriceValue)
    ) {
      return sellingPriceValue - supplyPriceValue;
    }
    if (Number.isFinite(sellingPriceValue) && Number.isFinite(costPriceValue)) {
      return sellingPriceValue - costPriceValue;
    }
    return null;
  })();
  const brandCommissionRateRaw =
    typeof product?.brand_commission_rate === "number"
      ? product.brand_commission_rate
      : typeof product?.commission_rate === "number"
        ? product.commission_rate
        : typeof product?.pricing?.commissionRate === "number"
          ? product.pricing.commissionRate
          : null;
  const brandCommissionRatePercent =
    typeof brandCommissionRateRaw === "number"
      ? brandCommissionRateRaw > 1
        ? brandCommissionRateRaw
        : brandCommissionRateRaw * 100
      : null;
  const internalProductCode =
    product?.codes?.internal || product?.code || product?.sku || "-";
  const cafe24ProductCode = (() => {
    if (product?.codes?.cafe24) return product.codes.cafe24;
    if (product?.cafe24_product_code) return product.cafe24_product_code;
    if (product?.cafe24ProductCode) return product.cafe24ProductCode;
    const platformLabel = (
      product?.externalMall?.platformName || product?.externalMall?.platform || ""
    )
      .toString()
      .toLowerCase();
    if (
      platformLabel.includes("cafe24") &&
      product?.externalMall?.external_sku
    ) {
      return product.externalMall.external_sku;
    }
    return (
      product?.externalMall?.cafe24ProductCode ||
      product?.cafe24_product_code_v2 ||
      ""
    );
  })();
  const sellerProductCode =
    product?.seller_product_code ||
    product?.sellerProductCode ||
    product?.codes?.seller ||
    "";
  const sellerChannelCodes = (() => {
    if (Array.isArray(product?.codes?.channels)) {
      return product.codes.channels;
    }
    if (Array.isArray(product?.channel_codes)) {
      return product.channel_codes;
    }
    if (product?.seller_codes && typeof product.seller_codes === "object") {
      return Object.entries(product.seller_codes).map(([key, value]) => ({
        channelId: key,
        channelName: key,
        code: value as string,
      }));
    }
    if (
      product?.externalMall?.external_sku &&
      (product?.externalMall?.platform || product?.externalMall?.platformName)
    ) {
      return [
        {
          channelId: product.externalMall.platformName ||
            product.externalMall.platform,
          channelName:
            product.externalMall.platformName ||
            product.externalMall.platform,
          code: product.externalMall.external_sku,
        },
      ];
    }
    return [];
  })();
  const productYearValue =
    product?.product_year || product?.year || product?.season_year || "";
  const productSeasonValue =
    product?.product_season || product?.season || product?.season_name || "";
  const englishProductName =
    product?.name_en || product?.english_name || product?.nameEnglish || "";
  const englishCategoryName =
    product?.english_category_name ||
    product?.category_name_en ||
    product?.categoryEnglishName ||
    "";
  const foreignCurrencyPriceValue =
    product?.foreign_currency_price ||
    product?.foreignCurrencyPrice ||
    product?.pricing?.foreignCurrencyPrice ||
    (product?.foreign_currency &&
    typeof product.foreign_currency === "object"
      ? product.foreign_currency.price
      : null) ||
    "";
  const formatPriceOrDash = (value?: number | null) =>
    typeof value === "number" && Number.isFinite(value)
      ? formatPrice(value)
      : "-";

  return (
    <>
      <Container
        maxWidth="6xl"
        padding="lg"
        className="bg-gray-50 min-h-screen"
      >
        {/* 상단 액션 바 */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-blue-600"
          >
            ← 목록으로
          </Button>
          <Stack direction="row" gap={2}>
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
                // prepare settings form from current product
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
                // navigate back to products list and show toast via onNavigate
                if (onNavigate) onNavigate("products-list");
                else window.location.href = "/products";
              }}
            >
              삭제
            </Button>
          </Stack>
        </div>

        {/* 등록/수정 정보 */}
        <Card padding="md" className="mb-6">
          <div className="flex justify-between items-center">
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

        {/* 상품 이미지 및 기본 정보 — TABLE VIEW */}
        <Card padding="lg" className="mb-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse min-w-0">
              <colgroup>
                <col className="w-48" />
                <col />
              </colgroup>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600 align-top">
                    대표 이미지
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-48 h-48 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={
                          Array.isArray(product.images) && product.images[0]
                            ? product.images[0]
                            : `https://picsum.photos/seed/${product.id || 'placeholder'}/800/600`
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://picsum.photos/seed/${product.id || 'placeholder'}/800/600`;
                        }}
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
                  <td className="px-4 py-3 text-sm text-gray-600">
                    영문 정보
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        영문 상품명:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded w-full"
                            value={englishProductName || ""}
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                name_en: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          englishProductName || "-"
                        )}
                      </div>
                      <div>
                        영문 카테고리명:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded w-full"
                            value={englishCategoryName || ""}
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                english_category_name: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          englishCategoryName || "-"
                        )}
                      </div>
                    </div>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600">기본 정보</td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div>상품ID: {product.id}</div>
                      <div>
                        자체상품코드:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded"
                            value={product.code || ""}
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                code: e.target.value,
                                codes: p?.codes
                                  ? { ...p.codes, internal: e.target.value }
                                  : p?.codes,
                              }))
                            }
                          />
                        ) : (
                          internalProductCode || "-"
                        )}
                      </div>
                      <div>
                        카페24상품코드:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded"
                            value={cafe24ProductCode || ""}
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                cafe24_product_code: e.target.value,
                                codes: p?.codes
                                  ? { ...p.codes, cafe24: e.target.value }
                                  : p?.codes,
                              }))
                            }
                          />
                        ) : (
                          cafe24ProductCode || "-"
                        )}
                      </div>
                      <div>
                        상품 연도:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded w-32"
                            value={productYearValue || ""}
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                product_year: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          productYearValue || "-"
                        )}
                      </div>
                      <div>
                        상품 시즌:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded w-32"
                            value={productSeasonValue || ""}
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                product_season: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          productSeasonValue || "-"
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
                      <div>
                        판매처 상품코드:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded"
                            value={sellerProductCode || ""}
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                seller_product_code: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          sellerProductCode || "-"
                        )}
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        판매처별상품코드:{" "}
                        {sellerChannelCodes.length ? (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {sellerChannelCodes.map((code: any, idx: number) => (
                              <Badge
                                key={`${code.channelId || code.channelName || idx}-${code.code}`}
                                variant="neutral"
                              >
                                {code.channelName || code.channelId || "판매처"}
                                {code.code ? `: ${code.code}` : ""}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    가격 / 재고
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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
                            formatPriceOrDash(sellingPriceValue)
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
                          formatPriceOrDash(costPriceValue)
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
                          formatPriceOrDash(supplyPriceValue)
                        )}
                      </div>
                      <div>
                        소비자가:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded text-right"
                            value={
                              consumerPriceValue !== null
                                ? String(consumerPriceValue)
                                : ""
                            }
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                consumer_price: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              }))
                            }
                          />
                        ) : (
                          formatPriceOrDash(consumerPriceValue)
                        )}
                      </div>
                      <div>
                        마진금액:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded text-right"
                            value={
                              marginAmountValue !== null
                                ? String(marginAmountValue)
                                : ""
                            }
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                margin_amount: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              }))
                            }
                          />
                        ) : (
                          formatPriceOrDash(marginAmountValue)
                        )}
                      </div>
                      <div>
                        시중가:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded text-right"
                            value={
                              marketPriceValue !== null
                                ? String(marketPriceValue)
                                : ""
                            }
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                market_price: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              }))
                            }
                          />
                        ) : (
                          formatPriceOrDash(marketPriceValue)
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
                        마진률:{" "}
                        <strong>{marginRate !== null ? `${marginRate}%` : "-"}</strong>
                      </div>
                      <div>
                        브랜드 수수료율:{" "}
                        {editing ? (
                          <div className="flex items-center gap-1">
                            <input
                              className="px-2 py-1 border rounded text-right w-20"
                              value={
                                brandCommissionRatePercent !== null
                                  ? String(
                                      Number(
                                        brandCommissionRatePercent.toFixed(2),
                                      ),
                                    )
                                  : ""
                              }
                              onChange={(e) => {
                                const raw = e.target.value;
                                const trimmed = raw.trim();
                                if (!trimmed) {
                                  setProduct((p: any) => ({
                                    ...(p || {}),
                                    brand_commission_rate: null,
                                  }));
                                  return;
                                }
                                const nextValue = Number(trimmed);
                                setProduct((p: any) => ({
                                  ...(p || {}),
                                  brand_commission_rate: Number.isFinite(
                                    nextValue,
                                  )
                                    ? nextValue / 100
                                    : p?.brand_commission_rate,
                                }));
                              }}
                            />
                            <span>%</span>
                          </div>
                        ) : brandCommissionRatePercent !== null ? (
                          `${brandCommissionRatePercent.toFixed(1)}%`
                        ) : (
                          "-"
                        )}
                      </div>
                      <div>
                        해외통화 상품가:{" "}
                        {editing ? (
                          <input
                            className="px-2 py-1 border rounded text-right"
                            value={
                              foreignCurrencyPriceValue
                                ? String(foreignCurrencyPriceValue)
                                : ""
                            }
                            onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                foreign_currency_price: e.target.value,
                              }))
                            }
                          />
                        ) : foreignCurrencyPriceValue ? (
                          foreignCurrencyPriceValue
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600">추가 속성</td>
                  <td className="px-4 py-3 text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
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
                    <div>
                      혼용률:{" "}
                      {editing ? (
                        <input
                          className="px-2 py-1 border rounded"
                          value={product.composition || product.material || ""}
                          onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              composition: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        product.composition || product.material || "-"
                      )}
                    </div>
                    <div>
                      세탁방법:{" "}
                      {editing ? (
                        <input
                          className="px-2 py-1 border rounded"
                          value={product.wash_method || product.care || ""}
                          onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              wash_method: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        product.wash_method || product.care || "-"
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      편직정보:{" "}
                      {editing ? (
                        <input
                          className="px-2 py-1 border rounded w-full"
                          value={product.knitting_info || ""}
                          onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              knitting_info: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        product.knitting_info || "-"
                      )}
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

        {/* 옵션 및 상세 정보 */}
        <Card padding="lg" className="mb-6">
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
                        className="bg-white border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={(event) =>
                          handleVariantNavigate(event, variant, vIdx)
                        }
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

        {/* 추가 상세 정보: 이미지, 메모, 사이즈/무게 */}
        <Card padding="lg" className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">추가 정보</h2>
          <div className="grid grid-cols-3 gap-4">
            {product.images &&
              product.images.map((src: string, idx: number) => (
                <div
                  key={idx}
                  className="w-full h-48 bg-gray-100 rounded overflow-hidden"
                >
                  <img
                    src={src}
                    className="w-full h-full object-cover"
                    alt={`image-${idx}`}
                  />
                </div>
              ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              가로(cm):{" "}
              {product.width_cm ||
                (product.variants &&
                  product.variants[0] &&
                  product.variants[0].width_cm) ||
                "-"}
            </div>
            <div>
              세로(cm):{" "}
              {product.height_cm ||
                (product.variants &&
                  product.variants[0] &&
                  product.variants[0].height_cm) ||
                "-"}
            </div>
            <div>
              높이(cm):{" "}
              {product.depth_cm ||
                (product.variants &&
                  product.variants[0] &&
                  product.variants[0].depth_cm) ||
                "-"}
            </div>
            <div>
              무게(g):{" "}
              {product.weight_g ||
                (product.variants &&
                  product.variants[0] &&
                  product.variants[0].weight_g) ||
                "-"}
            </div>
            <div>
              부피(cc):{" "}
              {product.volume_cc ||
                (product.variants &&
                  product.variants[0] &&
                  product.variants[0].volume_cc) ||
                "-"}
            </div>
            <div>원산지: {product.origin_country || "-"}</div>
            <div>
              외부몰 데이터:{" "}
              {product.externalMall?.platform ||
                product.externalMall?.platformName ||
                "없음"}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">메모</div>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {product.memos &&
                product.memos.map((m: string, idx: number) => (
                  <li key={idx}>{m}</li>
                ))}
            </ul>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-700"></div>
        </Card>

        {/* 상품 상세 설명 */}
        <Card padding="lg" className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            상품 상세 설명
          </h2>
          <div className="prose max-w-none text-lg text-gray-700">
            {/* Render HTML description safely for mock/demo content. Basic sanitizer: remove <script> tags. */}
            <div
              dangerouslySetInnerHTML={{
                __html: String(product.description || "").replace(
                  /<script[\s\S]*?>[\s\S]*?<\/[\s]*script>/gi,
                  "",
                ),
              }}
            />
          </div>
        </Card>

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
                {/* 활성화 상태는 mockProducts에 없음 */}
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">판매중</div>
                {/* 판매중 상태는 mockProducts에 없음 */}
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">품절</div>
                {/* 품절 상태는 mockProducts에 없음 */}
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">면세여부</div>
                <div className="font-semibold">
                  {editing ? (
                    <select
                      value={product.is_dutyfree ? "1" : "0"}
                      onChange={(e) =>
                        setProduct((p: any) => ({
                          ...(p || {}),
                          is_dutyfree: e.target.value === "1",
                        }))
                      }
                      className="px-2 py-1 border rounded"
                    >
                      <option value="1">면세</option>
                      <option value="0">과세</option>
                    </select>
                  ) : product.is_dutyfree ? (
                    "면세"
                  ) : (
                    "과세"
                  )}
                </div>
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
                                  is_stock_linked:
                                    !!settingsForm.is_stock_linked,
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

        {/* (상품 설명 수정 모달 제거) */}
      </Container>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default ProductDetailPage;
