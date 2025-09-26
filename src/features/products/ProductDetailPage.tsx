import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Card,
  Button,
  Badge,
  Stack,
  Modal,
  GridRow,
  GridCol } from
"../../design-system";
import SideGuide from "../../components/SideGuide";
import Toast from "../../components/Toast";
import { normalizeProductGroup } from "../../utils/groupUtils";
import { useRouter } from "next/router";
import {
  formatDate,
  formatPrice,
  getStockStatus } from
"../../utils/productUtils";
import OptionEditPage from "./OptionEditPage";
import MarketplaceSalesPanel from '../../components/marketplace/MarketplaceSalesPanel';
import { clientBarcodeStore } from "../../lib/clientBarcodeStore";
import { useT } from '../../i18n';


const DEFAULT_COMPLIANCE = {
  productSerialNumber: '',
  purchaseProductName: '',
  marginAmount: 0,
  includeInIncomingList: false,
  salesChannelProductCode: '',
  salesChannelCodes: '',
  knittingInfo: '',
  englishCategoryName: '',
  washingMethod: '',
  brandCommissionRate: 0,
  englishProductCategoryName: '',
  dutyCode: '',
  expectedInboundFlag: false
};

const mergeCompliance = (source?: any) => ({
  ...DEFAULT_COMPLIANCE,
  ...(source || {})
});

const COMPLIANCE_EXTRA_FIELD_MAP: Record<string, string> = {
  productSerialNumber: 'product_serial_number',
  purchaseProductName: 'purchase_product_name',
  includeInIncomingList: 'include_in_incoming_list',
  salesChannelProductCode: 'sales_channel_product_code',
  salesChannelCodes: 'sales_channel_codes',
  knittingInfo: 'knitting_info',
  englishCategoryName: 'english_category_name',
  washingMethod: 'washing_method',
  brandCommissionRate: 'brand_commission_rate',
  englishProductCategoryName: 'english_product_category_name',
  dutyCode: 'duty_code',
  expectedInboundFlag: 'expected_inbound_flag',
  invoiceDisplayName: 'invoice_display_name',
  purchaseName: 'purchase_name',
  marginAmount: 'margin_amount'
};

interface ProductDetailPageProps {
  productId?: string;
  onNavigate?: (page: string, productId?: string) => void;
  // when true, hide preview / rendered-prose areas (used by Add page)
  hidePreview?: boolean;
  // when true, render in 'create' mode: hide top actions and many edit buttons
  createMode?: boolean;
  // optional create handler used by Add page to persist a new product
  onCreate?: (product: any) => Promise<any>;
  // when provided, the page will use this object as the product and skip fetching
  initialProduct?: any;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId: propProductId,
  onNavigate,
  hidePreview,
  onCreate,
  createMode,
  initialProduct
}) => {
  // router and client-side id handling
  const router = useRouter();
  const t = useT();
  const [clientProductId, setClientProductId] = useState<string | null>(null);
  const initialProductId = propProductId || (router?.query?.id ? String(router.query.id) : undefined);

  // compute a stable productId for rendering: prefer prop/router on server, but allow client override
  const productId = clientProductId ?? initialProductId;
  const handleBack = () => {
    try {
      if (window && window.history && window.history.length > 1) {
        window.history.back();
        return;
      }
    } catch (e) {}
    try {
      // fallback to product list
      window.location.href = "/products";
    } catch (e) {}
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState<any>(null);
  // editing: true = form editable, false = read-only
  const [editing, setEditing] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [classificationNames, setClassificationNames] = useState<Record<string, string>>({});
  // Variant / option route detection
  const [isOptionRoute, setIsOptionRoute] = useState(false);
  const [optionKey, setOptionKey] = useState<string | null>(null);
  const [previewVariant, setPreviewVariant] = useState<any | null>(null);
  // variant modal / form state
  const [showVariantModal, setShowVariantModal] = useState<boolean>(false);
  const [variantForm, setVariantForm] = useState<any | null>(null);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  // image modal / draft list for editing images as URL list
  const [imageListDraft, setImageListDraft] = useState<string[]>([]);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  // description edit modal state (some pages used a modal edit flow previously)
  const [showDescEdit, setShowDescEdit] = useState<boolean>(false);
  const [descEditValue, setDescEditValue] = useState<string>("");
  const currentVariantIndex = useMemo(() => {
    if (!isOptionRoute || !product || !Array.isArray(product.variants) || !optionKey) return -1;
    // try to match by common identifiers
    const directIdx = product.variants.findIndex((v: any, i: number) => {
      const key =
      v.id ??
      v.variant_id ??
      v.code ??
      v.option_code ??
      v.barcode1 ??
      v.barcode ??
      `index-${i}`;
      return String(key) === String(optionKey);
    });
    if (directIdx >= 0) return directIdx;
    if (String(optionKey).startsWith("index-")) {
      const n = Number(String(optionKey).replace("index-", ""));
      if (!Number.isNaN(n) && product.variants[n]) return n;
    }
    return -1;
  }, [isOptionRoute, product?.variants, optionKey]);

  const currentVariant = useMemo(() => {
    if (currentVariantIndex < 0 || !product?.variants) return null;
    return (product.variants as any[])[currentVariantIndex];
  }, [product?.variants, currentVariantIndex]);
  // ---- end Option Edit helpers ----
  // Save UX: autosave and status
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const lastSavedDraftRef = useRef<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const downloadCsvTemplate = useCallback((platformId?: string) => {
    // Simple client-side template generator (keeps parity with ProductCsvUploadPage)
    let tpl = "";
    if (platformId === "makeshop") {
      const headers = [
      t('msg_0883'),
      t('msg_0833'),
      t('msg_0884'),
      t('msg_0886'),
      t('msg_0887'),
      t('msg_0410'),
      t('msg_0902'),
      t('msg_0925'),
      t('msg_0926'),
      t('msg_0927')];

      tpl = headers.join(t('msg_0928')).join(",");
    } else if (platformId === "cafe24") {
      const headers = [t('msg_0883'), t('msg_0833'), t('msg_0884'), t('msg_0885'), t('msg_0886'), t('msg_0887'), t('msg_0888')];
      tpl = headers.join(t('msg_0928')).join(",");
    } else if (platformId === "smartstore") {
      const headers = [t('msg_0896'), t('msg_0833'), t('msg_0897'), t('msg_0898'), t('msg_0899'), t('msg_0900')];
      tpl = headers.join(t('msg_0928')).join(",");
    } else {
      tpl = t('msg_0932');
    }

    const blob = new Blob([tpl], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${platformId || "template"}_template.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  // Populate client-only values to avoid SSR/CSR hydration mismatch
  useEffect(() => {
    // set clientProductId based on query params or location pathname
    try {
      if (typeof window !== "undefined") {
        const searchId = new URLSearchParams(window.location.search).get("id");
        if (searchId) setClientProductId(searchId);else
        {
          const segs = window.location.pathname.split("/").filter(Boolean);
          if (segs.length > 0) {
            const last = segs[segs.length - 1];
            // if last segment is numeric-like, use it as product id
            if (/^\d+$/.test(last)) setClientProductId(last);
          }
        }

        const isOpt = window.location.pathname.includes("/options/");
        setIsOptionRoute(isOpt);
        if (isOpt) {
          try {
            const segs = window.location.pathname.split("/").filter(Boolean);
            const idx = segs.indexOf("options");
            if (idx >= 0 && segs[idx + 1]) setOptionKey(decodeURIComponent(segs[idx + 1]));
          } catch (e) {
            setOptionKey(null);
          }
        }
      }
    } catch (e) {

      // no-op
    }}, []);

  // If an initialProduct is supplied (Add-page wrapper), use it instead of fetching from API
  useEffect(() => {

    // (moved) effect initialized after normalizeProduct is declared
  }, []);
  useEffect(() => {
    // mark when client mount is complete to keep SSR/CSR markup stable
    setIsClient(true);
  }, []);

  // Dropdown options for product-level fields (fetched from mock API)
  const [YEAR_OPTIONS, setYearOptions] = useState<string[]>([]);
  const [SEASON_OPTIONS, setSeasonOptions] = useState<string[]>([]);
  const [BRAND_OPTIONS, setBrandOptions] = useState<string[]>([]);

  const normalizeProduct = useCallback((input: any) => {
    if (!input) return null;
    const extraCompliance = mergeCompliance(input.extra_fields);
    const mergedCompliance = {
      ...extraCompliance,
      ...mergeCompliance(input.compliance)
    };
    const repSelling = Number(
      input.representative_selling_price ??
      input.selling_price ??
      0
    );
    const repSupply = Number(
      input.representative_supply_price ??
      input.supply_price ??
      input.cost_price ??
      0
    );
    mergedCompliance.marginAmount = Number(
      Number.isFinite(repSelling - repSupply) ?
      (repSelling - repSupply).toFixed(2) :
      '0'
    );
    if (typeof input.invoice_display_name !== 'undefined') {
      mergedCompliance.invoiceDisplayName = !!input.invoice_display_name;
    }
    const variants = Array.isArray(input.variants) ?
    input.variants.map((variant: any) => {
      const extra = {
        ...(variant.extra_fields || {})
      };
      const memoList = Array.isArray(extra.option_memos) ?
      extra.option_memos :
      Array.isArray(variant.option_memos) ?
      variant.option_memos :
      [];
      return {
        ...variant,
        extra_fields: extra,
        option_memos: memoList
      };
    }) :
    [];
    return {
      ...input,
      compliance: mergedCompliance,
      variants,
      description_images:
      input.description_images ||
      mergedCompliance.description_images ||
      []
    };
  }, []);

  // If an initialProduct is supplied (Add-page wrapper), use it instead of fetching from API
  useEffect(() => {
    if (!initialProduct) return;
    try {
      setProduct(normalizeProduct(initialProduct));
    } catch (e) {
      setProduct(initialProduct || null);
    }
    setLoading(false);
  }, [initialProduct, normalizeProduct]);

  const applyProductPatch = useCallback(
    (mutator: (draft: any) => void) => {
      setProduct((prev: any) => {
        if (!prev) return prev;
        const copy = JSON.parse(JSON.stringify(prev));
        mutator(copy);
        return normalizeProduct(copy);
      });
    },
    [normalizeProduct]
  );

  const updateVariant = useCallback(
    (index: number, mutator: (variant: any) => void) => {
      applyProductPatch((draft) => {
        if (!Array.isArray(draft.variants) || !draft.variants[index]) return;
        mutator(draft.variants[index]);
      });
    },
    [applyProductPatch]
  );

  const updateCurrentVariant = useCallback(
    (mutator: (variant: any) => void) => {
      if (currentVariantIndex < 0) return;
      updateVariant(currentVariantIndex, mutator);
    },
    [currentVariantIndex, updateVariant]
  );

  const updateCompliance = useCallback((patch: Record<string, any>) => {
    setProduct((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        compliance: {
          ...mergeCompliance(prev.compliance),
          ...patch
        }
      };
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/meta/product-options").
    then((r) => r.json()).
    then((body) => {
      if (!mounted) return;
      setYearOptions(body.years || []);
      setSeasonOptions(body.seasons || []);
      setBrandOptions(body.brands || []);
    }).
    catch(() => {
      if (!mounted) return;
      const now = new Date().getFullYear();
      setYearOptions(Array.from({ length: 10 }).map((_, i) => String(now - 5 + i)));
      setSeasonOptions([t('msg_0004'), "SS", "FW", "SPRING", "SUMMER", "AUTUMN", "WINTER"]);
      setBrandOptions([t('msg_0005'), t('msg_0006'), t('msg_0007'), t('msg_0008')]);
    });
    return () => {
      mounted = false;
    };
  }, []);


  useEffect(() => {
    if (!productId) return;
    let mounted = true;
    setLoading(true);
    console.debug("[ProductDetailPage] fetching product id=", productId);
    fetch(`/api/products/${productId}`).
    then(async (r) => {
      if (!mounted) return;
      if (!r.ok) {
        console.warn(
          "[ProductDetailPage] product fetch non-ok status=",
          r.status
        );
        const pid = Number(productId) || Date.now();
        setProduct(
          normalizeProduct({
            id: pid,
            code: `PRD-PLACEHOLDER-${pid}`,
            name: `샘플 상품 (${pid})`,
            selling_price: 0,
            supply_price: 0,
            cost_price: 0,
            images: [],
            variants: [],
            description: t('msg_0933')
          }) || null
        );
        return;
      }
      const data = await r.json();
      // Some API routes return `{ product }`, others return the raw product.
      const resolved = data?.product ?? data;
      console.debug("[ProductDetailPage] fetched data=", resolved);
      setProduct(normalizeProduct(resolved || {}));
    }).
    catch((e) => {
      console.error("[ProductDetailPage] fetch error", e);
      if (!mounted) return;
      const pid = Number(productId) || Date.now();
      setProduct(
        normalizeProduct({
          id: pid,
          code: `PRD-PLACEHOLDER-${pid}`,
          name: `샘플 상품 (${pid})`,
          selling_price: 0,
          supply_price: 0,
          cost_price: 0,
          images: [],
          variants: [],
          description: t('msg_0934')
        }) || null
      );
    }).
    finally(() => {
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
        productId
      );
    }
  }, [loading, product, productId]);

  // load classification names for display
  useEffect(() => {
    let mounted = true;
    fetch("/api/meta/classifications").
    then((r) => r.json()).
    then((body) => {
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
    }).
    catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleCancelRestore = useCallback(() => {
    if (lastSavedDraftRef.current) {
      setProduct((p: any) => ({
        ...(p || {}),
        description: lastSavedDraftRef.current.description || ''
      }));
    }
  }, []);

  const handleVariantNavigate = (
  event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
  variant: any,
  index: number) =>
  {
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

  if (!isClient || loading) {
    return (
      <Container maxWidth="6xl" padding="lg">
        <div className="text-center py-12">{t("msg_1424")}</div>
      </Container>);

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
      </Container>);

  }

  const sellingPriceValue = Number(product?.selling_price ?? 0);
  const costPriceValue = Number(product?.cost_price ?? 0);
  const supplyPriceValue = Number(product?.supply_price ?? 0);
  const marginRate = sellingPriceValue ?
  (
  (sellingPriceValue - costPriceValue) / sellingPriceValue * 100).
  toFixed(0) :
  null;
  const consumerPriceValue =
  typeof product?.consumer_price === "number" ?
  product.consumer_price :
  typeof product?.pricing?.consumerPrice === "number" ?
  product.pricing.consumerPrice :
  null;
  const marketPriceValue =
  typeof product?.market_price === "number" ?
  product.market_price :
  typeof product?.pricing?.marketPrice === "number" ?
  product.pricing.marketPrice :
  null;
  const marginAmountValue = (() => {
    if (typeof product?.margin_amount === "number") {
      return product.margin_amount;
    }
    if (
    Number.isFinite(sellingPriceValue) &&
    Number.isFinite(supplyPriceValue))
    {
      return sellingPriceValue - supplyPriceValue;
    }
    if (Number.isFinite(sellingPriceValue) && Number.isFinite(costPriceValue)) {
      return sellingPriceValue - costPriceValue;
    }
    return null;
  })();
  const brandCommissionRateRaw =
  typeof product?.brand_commission_rate === "number" ?
  product.brand_commission_rate :
  typeof product?.commission_rate === "number" ?
  product.commission_rate :
  typeof product?.pricing?.commissionRate === "number" ?
  product.pricing.commissionRate :
  null;
  const brandCommissionRatePercent =
  typeof brandCommissionRateRaw === "number" ?
  brandCommissionRateRaw > 1 ?
  brandCommissionRateRaw :
  brandCommissionRateRaw * 100 :
  null;
  const internalProductCode =
  product?.codes?.internal || product?.code || product?.sku || "-";
  const cafe24ProductCode = (() => {
    if (product?.codes?.cafe24) return product.codes.cafe24;
    if (product?.cafe24_product_code) return product.cafe24_product_code;
    if (product?.cafe24ProductCode) return product.cafe24ProductCode;
    const platformLabel = (
    product?.externalMall?.platformName || product?.externalMall?.platform || "").

    toString().
    toLowerCase();
    if (
    platformLabel.includes("cafe24") &&
    product?.externalMall?.external_sku)
    {
      return product.externalMall.external_sku;
    }
    return (
      product?.externalMall?.cafe24ProductCode ||
      product?.cafe24_product_code_v2 ||
      "");

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
        code: value as string
      }));
    }
    if (
    product?.externalMall?.external_sku && (
    product?.externalMall?.platform || product?.externalMall?.platformName))
    {
      return [
      {
        channelId: product.externalMall.platformName ||
        product.externalMall.platform,
        channelName:
        product.externalMall.platformName ||
        product.externalMall.platform,
        code: product.externalMall.external_sku
      }];

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
  product?.pricing?.foreignCurrencyPrice || (
  product?.foreign_currency &&
  typeof product.foreign_currency === "object" ?
  product.foreign_currency.price :
  null) ||
  "";
  const formatPriceOrDash = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ?
  formatPrice(value) :
  "-";

  // 할인 미리보기 컴포넌트 (정의는 JSX 바깥에 있어야 함)
  const PreviewPrice: React.FC<{price: number;type: string;value: number;}> = ({ price, type, value }) => {
    const calc = (p: number) => {
      if (!Number.isFinite(p)) return p;
      if (type === "percent") return Math.max(0, Math.round(p * (1 - Number(value || 0) / 100)));
      if (type === "amount") return Math.max(0, Math.round(p - Number(value || 0)));
      return p;
    };
    const next = calc(Number(price || 0));
    if (!Number.isFinite(price)) return <span>-</span>;
    if (type === "none" || Number(value || 0) === 0) return <span>{formatPrice(Number(price || 0))}</span>;
    return (
      <div className="flex items-baseline gap-2">
        <span className="line-through text-gray-400">{formatPrice(Number(price || 0))}</span>
        <span className="font-semibold text-green-700">{formatPrice(Number(next || 0))}</span>
      </div>);

  };

  // If on option edit route, render the dedicated Option Edit Page (unified page navigation)
  if (isOptionRoute) {
    return (
      <OptionEditPage
        product={product}
        currentVariant={currentVariant}
        updateCurrentVariant={updateCurrentVariant}
        optionKey={optionKey} />);


  }

  return (
    <>
      <Container
        maxWidth="6xl"
        padding="lg"
        className="bg-gray-50 min-h-screen">

        {/* 상단 액션 바 */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              if (onNavigate) onNavigate("products-list");else
              window.location.href = "/products";
            }}
            className="text-blue-600">

            ← 목록으로
          </Button>
            <Stack direction="row" gap={2}>
              {/* Hide top action buttons in createMode: keep only back/help */}
              {!createMode &&
            <>
                  <Button
                variant={editing ? "outline" : "primary"}
                aria-pressed={!editing}
                onClick={() => setEditing((s) => !s)}
                className="font-medium"
                title={editing ? t('msg_0935') : t('msg_0936')}>

                    {editing ? t('msg_0937') : t('msg_0655')}
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
                    box_qty: String(product.box_qty || ""),
                    is_stock_linked: !!(
                    product.variants &&
                    product.variants[0] &&
                    product.variants[0].is_stock_linked),

                    classification_id: product.classification_id || "",
                    // --- 할인/적용 관련 ---
                    discountType: product.pricing && (product.pricing as any).discountType || "none",
                    discountValue: Number(
                      product.pricing && (product.pricing as any).discountValue || 0
                    ),
                    discountStartAt:
                    product.pricing && (product.pricing as any).discountStartAt || "",
                    discountEndAt:
                    product.pricing && (product.pricing as any).discountEndAt || "",
                    discountApplyTo:
                    product.pricing && (product.pricing as any).discountApplyTo || "product",
                    applyImmediately: false
                  });
                  setShowSettingsModal(true);
                }}>{t("msg_0950")}


              </Button>
                  <Button
                variant="danger"
                onClick={() => {
                  if (!confirm(t('msg_0938')))
                  return;
                  try {
                    const raw = localStorage.getItem("trashed_products_v1");
                    const existing = raw ? JSON.parse(raw) : [];
                    existing.push(product);
                    localStorage.setItem(
                      "trashed_products_v1",
                      JSON.stringify(existing)
                    );
                  } catch (e) {}
                  if (onNavigate) onNavigate("products-list");else
                  window.location.href = "/products";
                }}>{t("msg_0227")}


              </Button>
                </>
            }
              {/* In createMode we will show bottom fixed actions; top create button removed */}
            </Stack>
          {!createMode &&
          <div className="ml-2">
              <Button variant="outline" size="small" onClick={() => setIsHelpOpen(true)}>{t("msg_0223")}

            </Button>
            </div>
          }
        </div>

        {/* 24-Grid Layout 시작: 3 / 12 / 1 / 5 / 3 */}
        <GridRow gutter={24}>
          <GridCol span={3}><div></div></GridCol>
          <GridCol span={12}>

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
                {product?.created_at ?
                    `${new Date(product.created_at).toLocaleDateString("ko-KR")} ${new Date(product.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}` :
                    "-"}
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
                {product?.updated_at ?
                    `${new Date(product.updated_at).toLocaleDateString("ko-KR")} ${new Date(product.updated_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}` :
                    "-"}
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
                        created_at: now
                      }));
                    }}>

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
                            Array.isArray(product?.images) && product?.images[0] ?
                            product.images[0] :
                            `https://picsum.photos/seed/${product?.id || 'placeholder'}/800/600`
                            }
                            alt={product?.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                              `https://picsum.photos/seed/${product?.id || 'placeholder'}/800/600`;
                            }} />

                    </div>
                    {/* URL input for representative image: supports entering a direct image URL (used in create mode) */}
                    {(editing || createMode) &&
                        <div className="mt-2">
                        <input
                            placeholder={t('msg_0939')}
                            className="w-full px-2 py-1 border rounded"
                            value={Array.isArray(product?.images) && product.images[0] || ""}
                            onChange={(e) => {
                              const url = e.target.value;
                              setProduct((p: any) => {
                                const copy = { ...(p || {}) };
                                copy.images = Array.isArray(copy.images) ? copy.images.slice() : [];
                                copy.images[0] = url;
                                return copy;
                              });
                            }} />

                      </div>
                        }
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600">{t("msg_0833")}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {editing ?
                        <input
                          className="w-full px-2 py-1 border rounded"
                          value={product.name || ""}
                          onChange={(e) =>
                          setProduct((p: any) => ({
                            ...(p || {}),
                            name: e.target.value
                          }))
                          } /> :


                        product.name
                        }
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
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded w-full"
                              value={englishProductName || ""}
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                name_en: e.target.value
                              }))
                              } /> :


                            englishProductName || "-"
                            }
                      </div>
                      <div>
                        영문 카테고리명:{" "}
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded w-full"
                              value={englishCategoryName || ""}
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                english_category_name: e.target.value
                              }))
                              } /> :


                            englishCategoryName || "-"
                            }
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
        
                      </div>
                      <div>
                        상품 연도:{" "}
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded w-32"
                              value={productYearValue || ""}
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                product_year: e.target.value
                              }))
                              } /> :


                            productYearValue || "-"
                            }
                      </div>
                      <div>
                        상품 시즌:{" "}
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded w-32"
                              value={productSeasonValue || ""}
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                product_season: e.target.value
                              }))
                              } /> :


                            productSeasonValue || "-"
                            }
                      </div>
                      <div>
                        브랜드:{" "}
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded"
                              value={product.brand || ""}
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                brand: e.target.value
                              }))
                              } /> :


                            product.brand || "-"
                            }
                      </div>
                      <div>공급사ID: {product.supplier_id || "-"}</div>
                      <div>
                        판매처 상품코드:{" "}
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded"
                              value={sellerProductCode || ""}
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                seller_product_code: e.target.value
                              }))
                              } /> :


                            sellerProductCode || "-"
                            }
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        판매처별상품코드:{" "}
                        {sellerChannelCodes.length ?
                            <div className="mt-1 flex flex-wrap gap-2">
                            {sellerChannelCodes.map((code: any, idx: number) =>
                              <Badge
                                key={`${code.channelId || code.channelName || idx}-${code.code}`}
                                variant="neutral">

                                {code.channelName || code.channelId || t('msg_0112')}
                                {code.code ? `: ${code.code}` : ""}
                              </Badge>
                              )}
                          </div> :

                            "-"
                            }
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3 mt-4">
                        <MarketplaceSalesPanel product={product} />
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
                          {editing ?
                              <input
                                className="px-2 py-1 border rounded text-right"
                                value={String(product.selling_price || 0)}
                                onChange={(e) =>
                                setProduct((p: any) => ({
                                  ...(p || {}),
                                  selling_price: Number(e.target.value || 0)
                                }))
                                } /> :


                              formatPriceOrDash(sellingPriceValue)
                              }
                        </strong>
                      </div>
                      <div>
                        원가:{" "}
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded text-right"
                              value={String(product.cost_price || 0)}
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                cost_price: Number(e.target.value || 0)
                              }))
                              } /> :


                            formatPriceOrDash(costPriceValue)
                            }
                      </div>
                      <div>
                        공급가:{" "}
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded text-right"
                              value={String(product.supply_price || 0)}
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                supply_price: Number(e.target.value || 0)
                              }))
                              } /> :


                            formatPriceOrDash(supplyPriceValue)
                            }
                      </div>
                      <div>
                        소비자가:{" "}
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded text-right"
                              value={
                              consumerPriceValue !== null ?
                              String(consumerPriceValue) :
                              ""
                              }
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                consumer_price: e.target.value ?
                                Number(e.target.value) :
                                null
                              }))
                              } /> :


                            formatPriceOrDash(consumerPriceValue)
                            }
                      </div>
                      <div>
                        마진금액:{" "}
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded text-right"
                              value={
                              marginAmountValue !== null ?
                              String(marginAmountValue) :
                              ""
                              }
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                margin_amount: e.target.value ?
                                Number(e.target.value) :
                                null
                              }))
                              } /> :


                            formatPriceOrDash(marginAmountValue)
                            }
                      </div>
                      <div>
                        시중가:{" "}
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded text-right"
                              value={
                              marketPriceValue !== null ?
                              String(marketPriceValue) :
                              ""
                              }
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                market_price: e.target.value ?
                                Number(e.target.value) :
                                null
                              }))
                              } /> :


                            formatPriceOrDash(marketPriceValue)
                            }
                      </div>
                      <div>
                        총재고:{" "}
                        <strong>
                          {product.variants ?
                              (product.variants as any[]).
                              reduce(
                                (s: number, v: any) => s + (v.stock || 0),
                                0
                              ).
                              toLocaleString() :
                              "0"}
                        </strong>
                      </div>
                      <div>
                        마진률:{" "}
                        <strong>{marginRate !== null ? `${marginRate}%` : "-"}</strong>
                      </div>
                      <div>
                        브랜드 수수료율:{" "}
                        {editing ?
                            <div className="flex items-center gap-1">
                            <input
                                className="px-2 py-1 border rounded text-right w-20"
                                value={
                                brandCommissionRatePercent !== null ?
                                String(
                                  Number(
                                    brandCommissionRatePercent.toFixed(2)
                                  )
                                ) :
                                ""
                                }
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const trimmed = raw.trim();
                                  if (!trimmed) {
                                    setProduct((p: any) => ({
                                      ...(p || {}),
                                      brand_commission_rate: null
                                    }));
                                    return;
                                  }
                                  const nextValue = Number(trimmed);
                                  setProduct((p: any) => ({
                                    ...(p || {}),
                                    brand_commission_rate: Number.isFinite(
                                      nextValue
                                    ) ?
                                    nextValue / 100 :
                                    p?.brand_commission_rate
                                  }));
                                }} />

                            <span>%</span>
                          </div> :
                            brandCommissionRatePercent !== null ?
                            `${brandCommissionRatePercent.toFixed(1)}%` :

                            "-"
                            }
                      </div>
                      <div>
                        해외통화 상품가:{" "}
                        {editing ?
                            <input
                              className="px-2 py-1 border rounded text-right"
                              value={
                              foreignCurrencyPriceValue ?
                              String(foreignCurrencyPriceValue) :
                              ""
                              }
                              onChange={(e) =>
                              setProduct((p: any) => ({
                                ...(p || {}),
                                foreign_currency_price: e.target.value
                              }))
                              } /> :

                            foreignCurrencyPriceValue ?
                            foreignCurrencyPriceValue :

                            "-"
                            }
                      </div>
                    </div>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600">추가 속성</td>
                  <td className="px-4 py-3 text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      공급처:{" "}
                      <strong>{product?.supplier_name || t('msg_0012')}</strong>
                    </div>
                    <div>
                      원산지:{" "}
                      {editing ?
                          <input
                            className="px-2 py-1 border rounded"
                            value={product.origin_country || ""}
                            onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              origin_country: e.target.value
                            }))
                            } /> :


                          product?.origin_country || t('msg_0331')
                          }
                    </div>
                    <div>
                      사입상품명:{" "}
                      {editing ?
                          <input
                            className="px-2 py-1 border rounded"
                            value={product.purchase_name || ""}
                            onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              purchase_name: e.target.value
                            }))
                            } /> :


                          product?.purchase_name || t('msg_0940')
                          }
                    </div>
                    <div>
                      배송비정책:{" "}
                      {editing ?
                          <input
                            className="px-2 py-1 border rounded"
                            value={product.shipping_policy || ""}
                            onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              shipping_policy: e.target.value
                            }))
                            } /> :


                          product?.shipping_policy || t('msg_0331')
                          }
                    </div>
                    <div>
                      HS Code:{" "}
                      {editing ?
                          <input
                            className="px-2 py-1 border rounded"
                            value={product.hs_code || ""}
                            onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              hs_code: e.target.value
                            }))
                            } /> :


                          product.hs_code || "-"
                          }
                    </div>
                    <div>
                      박스당수량:{" "}
                      {editing ?
                          <input
                            className="px-2 py-1 border rounded w-24"
                            value={product.box_qty || ""}
                            onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              box_qty: e.target.value
                            }))
                            } /> :


                          product.box_qty || "-"
                          }
                    </div>
                    <div>
                      재고연동:{" "}
                      {editing ?
                          <select
                            value={
                            product.variants &&
                            product.variants[0] &&
                            product.variants[0].is_stock_linked ?
                            "1" :
                            "0"
                            }
                            onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              variants: p?.variants ?
                              p.variants.map((v: any, i: number) =>
                              i === 0 ?
                              {
                                ...v,
                                is_stock_linked:
                                e.target.value === "1"
                              } :
                              v
                              ) :
                              p?.variants
                            }))
                            }
                            className="px-2 py-1 border rounded">

                          <option value="1">{t("msg_0941")}</option>
                          <option value="0">{t("msg_0942")}</option>
                        </select> :
                          product.variants &&
                          product.variants[0] &&
                          product.variants[0].is_stock_linked ?
                          t('msg_0941') :

                          t('msg_0942')
                          }
                    </div>
                    <div>
                      분류:{" "}
                      {editing ?
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
                              classification: e.target.value
                            }))
                            } /> :


                          classificationNames[product.classification_id] ||
                          product.classification ||
                          t('msg_0331')
                          }
                    </div>
                    <div>
                      외부몰 데이터:{" "}
                      {product.externalMall?.platform ||
                          product.externalMall?.platformName ||
                          t('msg_0943')}
                    </div>
                    <div>
                      혼용률:{" "}
                      {editing ?
                          <input
                            className="px-2 py-1 border rounded"
                            value={product.composition || product.material || ""}
                            onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              composition: e.target.value
                            }))
                            } /> :


                          product.composition || product.material || "-"
                          }
                    </div>
                    <div>
                      세탁방법:{" "}
                      {editing ?
                          <input
                            className="px-2 py-1 border rounded"
                            value={product.wash_method || product.care || ""}
                            onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              wash_method: e.target.value
                            }))
                            } /> :


                          product.wash_method || product.care || "-"
                          }
                    </div>
                    <div className="sm:col-span-2">
                      편직정보:{" "}
                      {editing ?
                          <input
                            className="px-2 py-1 border rounded w-full"
                            value={product.knitting_info || ""}
                            onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              knitting_info: e.target.value
                            }))
                            } /> :


                          product.knitting_info || "-"
                          }
                    </div>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 text-sm text-gray-600 align-top">
                    태그
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {editing ?
                          <input
                            className="px-2 py-1 border rounded w-full"
                            value={(product.tags || []).join(", ")}
                            onChange={(e) =>
                            setProduct((p: any) => ({
                              ...(p || {}),
                              tags: e.target.value.
                              split(",").
                              map((s: string) => s.trim()).
                              filter(Boolean)
                            }))
                            } /> :


                          product.tags &&
                          product.tags.map((t: string) =>
                          <Badge key={t} variant="neutral">
                            {t}
                          </Badge>
                          )
                          }
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">상품 옵션</h2>
            {(editing || createMode) &&
                <div>
                <Button
                    variant="outline"
                    size="small"
                    onClick={() => {
                      // append a basic empty variant to the product
                      setProduct((p: any) => {
                        const copy = JSON.parse(JSON.stringify(p || {}));
                        copy.variants = Array.isArray(copy.variants) ? copy.variants.slice() : [];
                        const nextIdx = copy.variants.length + 1;
                        copy.variants.push({
                          variant_name: `옵션 ${nextIdx}`,
                          code: '',
                          barcode1: '',
                          barcode2: '',
                          barcode3: '',
                          selling_price: 0,
                          cost_price: 0,
                          supply_price: 0,
                          stock: 0
                        });
                        return normalizeProduct(copy);
                      });
                      setToast(t('msg_0944'))
                    }}>

                  옵션 추가
                </Button>
              </div>
                }
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden min-w-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">{t("msg_1157")}

                      </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">{t("msg_1410")}

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
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">{t("msg_0884")}

                      </th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">{t("msg_1163")}

                      </th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">{t("msg_0885")}

                      </th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                    마진
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">{t("msg_0410")}

                      </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">{t("msg_1075")}

                      </th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">{t("msg_0902")}

                      </th>
                </tr>
              </thead>
              <tbody>
                {product.variants &&
                    (product.variants as any[]).map(
                      (variant: any, vIdx: number) =>
                      <tr
                        key={variant.id || vIdx}
                        className="bg-white border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={(event) =>
                        handleVariantNavigate(event, variant, vIdx)
                        }
                        onMouseEnter={() => setPreviewVariant(variant)}
                        onMouseLeave={() => setPreviewVariant(null)}>

                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {editing ?
                          <input
                            className="w-full px-2 py-1 border rounded"
                            value={variant.variant_name || ""}
                            onChange={(e) =>
                            updateVariant(vIdx, (draft) => {
                              draft.variant_name = e.target.value;
                            })
                            } /> :


                          variant.variant_name
                          }
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {editing ?
                          <input
                            className="px-2 py-1 border rounded"
                            value={variant.code || ""}
                            onChange={(e) =>
                            updateVariant(vIdx, (draft) => {
                              draft.code = e.target.value;
                            })
                            } /> :


                          <a
                            href={`/products/${encodeURIComponent(String(product?.id ?? productId))}/options/${encodeURIComponent(String(
                              variant.id ??
                              variant.variant_id ??
                              variant.code ??
                              variant.option_code ??
                              variant.barcode1 ??
                              variant.barcode ??
                              `index-${vIdx}`
                            ))}`}
                            className="text-blue-600 underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              const pid = product?.id ?? productId;
                              const vid =
                              variant.id ??
                              variant.variant_id ??
                              variant.code ??
                              variant.option_code ??
                              variant.barcode1 ??
                              variant.barcode ??
                              `index-${vIdx}`;
                              const nextPath = `/products/${encodeURIComponent(String(pid))}/options/${encodeURIComponent(String(vid))}`;
                              try {
                                router?.push?.(nextPath);
                              } catch {
                                if (typeof window !== "undefined") window.location.href = nextPath;
                              }
                            }}>

                              {variant.code || "-"}
                            </a>
                          }
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {editing ?
                          <input
                            className="px-2 py-1 border rounded"
                            value={variant.barcode1 || ""}
                            onChange={(e) =>
                            updateVariant(vIdx, (draft) => {
                              draft.barcode1 = e.target.value;
                            })
                            } /> :


                          variant.barcode1
                          }
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {editing ?
                          <input
                            className="px-2 py-1 border rounded"
                            value={variant.barcode2 || ""}
                            onChange={(e) =>
                            updateVariant(vIdx, (draft) => {
                              draft.barcode2 = e.target.value;
                            })
                            } /> :


                          variant.barcode2 || "-"
                          }
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {editing ?
                          <input
                            className="px-2 py-1 border rounded"
                            value={variant.barcode3 || ""}
                            onChange={(e) =>
                            updateVariant(vIdx, (draft) => {
                              draft.barcode3 = e.target.value;
                            })
                            } /> :


                          variant.barcode3 || "-"
                          }
                        </td>
                        <td className="px-4 py-3 text-right text-green-700 font-bold">
                          {editing ?
                          <input
                            className="w-24 px-2 py-1 border rounded text-right"
                            value={String(variant.selling_price || 0)}
                            onChange={(e) =>
                            updateVariant(vIdx, (draft) => {
                              draft.selling_price = Number(e.target.value || 0);
                            })
                            } /> :


                          formatPrice(variant.selling_price)
                          }
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {editing ?
                          <input
                            className="w-24 px-2 py-1 border rounded text-right"
                            value={String(variant.cost_price || 0)}
                            onChange={(e) =>
                            updateVariant(vIdx, (draft) => {
                              draft.cost_price = Number(e.target.value || 0);
                            })
                            } /> :


                          formatPrice(variant.cost_price)
                          }
                        </td>
                        <td className="px-4 py-3 text-right text-blue-700 font-bold">
                          {editing ?
                          <input
                            className="w-24 px-2 py-1 border rounded text-right"
                            value={String(variant.supply_price || 0)}
                            onChange={(e) =>
                            updateVariant(vIdx, (draft) => {
                              draft.supply_price = Number(e.target.value || 0);
                            })
                            } /> :


                          formatPrice(variant.supply_price)
                          }
                        </td>
                        <td className="px-4 py-3 text-right text-purple-700 font-semibold">
                          {formatPrice(
                            typeof variant.margin_amount === 'number' ?
                            variant.margin_amount :
                            Number(
                              (Number(variant.selling_price || 0) -
                              Number(variant.supply_price || 0)).toFixed(2)
                            )
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {editing ?
                          <input
                            className="w-20 px-2 py-1 border rounded text-right"
                            value={String(variant.stock || 0)}
                            onChange={(e) =>
                            setProduct((p: any) => {
                              const copy = JSON.parse(JSON.stringify(p));
                              copy.variants[vIdx].stock = Number(
                                e.target.value || 0
                              );
                              return normalizeProduct(copy);
                            })
                            } /> :


                          `${variant.stock}개`
                          }
                        </td>
                        <td className="px-4 py-3 text-left text-gray-700">
                          {editing ?
                          <input
                            className="px-2 py-1 border rounded"
                            value={variant.warehouse_location || ""}
                            onChange={(e) =>
                            updateVariant(vIdx, (draft) => {
                              draft.warehouse_location = e.target.value;
                            })
                            } /> :


                          variant.warehouse_location || "-"
                          }
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-1 justify-center">
                            {variant.is_selling ?
                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">{t("msg_0406")}

                            </span> :

                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">{t("msg_0407")}

                            </span>
                            }
                            {variant.is_soldout ?
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs">{t("msg_0413")}

                            </span> :
                            null}
                            {variant.is_for_sale === false ?
                            <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs">{t("msg_0814")}

                            </span> :
                            null}
                          </div>
                        </td>
                      </tr>

                    )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 추가 상세 정보: 이미지, 메모, 사이즈/무게 */}
        <Card padding="lg" className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">추가 정보</h2>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">추가 이미지</h3>
            <div className="flex items-center gap-2">
              {!createMode &&
                  <>
                  <Button
                      variant="outline"
                      size="small"
                      onClick={() => {
                        setImageListDraft(Array.isArray(product.images) ? product.images.slice() : []);
                        setShowImageModal(true);
                      }}>

                    추가 이미지 편집
                  </Button>
                  <Button
                      variant="outline"
                      size="small"
                      onClick={() => {
                        setDescEditValue(product.description || "");
                        setShowDescEdit(true);
                      }}>{t("msg_0951")}


                    </Button>
                </>
                  }
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images &&
                product.images.map((src: string, idx: number) =>
                <div
                  key={idx}
                  className="w-full h-48 bg-gray-100 rounded overflow-hidden">

                  <img
                    src={src}
                    className="w-full h-full object-cover"
                    alt={`image-${idx}`} />

                </div>
                )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              가로(cm): {" "}
              {editing ?
                  <input
                    className="px-2 py-1 border rounded w-32"
                    value={product.width_cm || product.variants && product.variants[0] && product.variants[0].width_cm || ""}
                    onChange={(e) =>
                    applyProductPatch((draft) => {
                      draft.width_cm = e.target.value;
                    })
                    } /> :


                  product.width_cm || product.variants && product.variants[0] && product.variants[0].width_cm || "-"
                  }
            </div>
            <div>
              세로(cm): {" "}
              {editing ?
                  <input
                    className="px-2 py-1 border rounded w-32"
                    value={product.height_cm || product.variants && product.variants[0] && product.variants[0].height_cm || ""}
                    onChange={(e) =>
                    applyProductPatch((draft) => {
                      draft.height_cm = e.target.value;
                    })
                    } /> :


                  product.height_cm || product.variants && product.variants[0] && product.variants[0].height_cm || "-"
                  }
            </div>
            <div>
              높이(cm): {" "}
              {editing ?
                  <input
                    className="px-2 py-1 border rounded w-32"
                    value={product.depth_cm || product.variants && product.variants[0] && product.variants[0].depth_cm || ""}
                    onChange={(e) =>
                    applyProductPatch((draft) => {
                      draft.depth_cm = e.target.value;
                    })
                    } /> :


                  product.depth_cm || product.variants && product.variants[0] && product.variants[0].depth_cm || "-"
                  }
            </div>
            <div>
              무게(g): {" "}
              {editing ?
                  <input
                    className="px-2 py-1 border rounded w-32"
                    value={product.weight_g || product.variants && product.variants[0] && product.variants[0].weight_g || ""}
                    onChange={(e) =>
                    applyProductPatch((draft) => {
                      draft.weight_g = e.target.value;
                    })
                    } /> :


                  product.weight_g || product.variants && product.variants[0] && product.variants[0].weight_g || "-"
                  }
            </div>
            <div>
              부피(cc): {" "}
              {editing ?
                  <input
                    className="px-2 py-1 border rounded w-32"
                    value={product.volume_cc || product.variants && product.variants[0] && product.variants[0].volume_cc || ""}
                    onChange={(e) =>
                    applyProductPatch((draft) => {
                      draft.volume_cc = e.target.value;
                    })
                    } /> :


                  product.volume_cc || product.variants && product.variants[0] && product.variants[0].volume_cc || "-"
                  }
            </div>
            <div>
              원산지: {editing ?
                  <input
                    className="px-2 py-1 border rounded w-32"
                    value={product.origin_country || ''}
                    onChange={(e) =>
                    applyProductPatch((draft) => {
                      draft.origin_country = e.target.value;
                    })
                    } /> :


                  product.origin_country || "-"
                  }
            </div>
            <div className="sm:col-span-3" />
            <div>
              외부몰 데이터:{" "}
              {product.externalMall?.platform ||
                  product.externalMall?.platformName ||
                  t('msg_0943')}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">{t("msg_1183")}</div>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {editing ?
                  <li>
                  <textarea className="w-full p-2 border rounded" value={(product.memos || []).join('\n')} onChange={(e) => setProduct((p: any) => ({ ...(p || {}), memos: e.target.value.split('\n').map((s: any) => s.trim()).filter(Boolean) }))} />
                </li> :

                  product.memos &&
                  product.memos.map((m: string, idx: number) =>
                  <li key={idx}>{m}</li>
                  )
                  }
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
            {editing ?
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">HTML 편집 (기본 스크립트 태그는 제거됩니다)</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="small" onClick={() => {setShowDescEdit(true);setDescEditValue(product.description || '');}}>모달 편집</Button>
                    {!hidePreview &&
                      <Button variant="outline" size="small" onClick={() => {
                        // toggle preview content by re-sanitizing
                        setProduct((p: any) => ({ ...p, description: String(p.description || '') }));
                        setToast(t('msg_0945'))
                      }}>미리보기 갱신</Button>
                      }
                  </div>
                </div>
                <textarea className="w-full h-48 p-2 border rounded font-mono text-sm" value={product.description || ''} onChange={(e) => setProduct((p: any) => ({ ...p, description: e.target.value }))} />
                {/* hide per-section cancel/save buttons in createMode */}
                {!createMode &&
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="small" onClick={() => {
                      // restore from last saved draft or original
                      handleCancelRestore();
                    }}>{t("msg_0546")}</Button>
                    <Button variant="primary" size="small" onClick={() => {
                      try {
                        const key = `product_draft_${product.id}`;
                        const payload = JSON.parse(localStorage.getItem(key) || '{}');
                        payload.description = product.description || '';
                        localStorage.setItem(key, JSON.stringify(payload));
                        lastSavedDraftRef.current = payload;
                        setSaveStatus('saved');
                        setToast(t('msg_0946'))
                      } catch (e) {
                        setToast(t('msg_0947'))
                      }
                    }}>{t("msg_0351")}</Button>
                  </div>
                  }
                {!hidePreview && !createMode &&
                  <>
                    <div className="border-t pt-2 text-sm text-gray-500">미리보기:</div>
                    <div className="prose max-w-none bg-white p-4 rounded" dangerouslySetInnerHTML={{ __html: String(product.description || '').replace(/<script[\s\S]*?>[\s\S]*?<\/[\s]*script>/gi, '') }} />
                  </>
                  }
              </div> :

                <div
                  dangerouslySetInnerHTML={{
                    __html: String(product.description || "").replace(
                      /<script[\s\S]*?>[\s\S]*?<\/[\s]*script>/gi,
                      ""
                    )
                  }} />

                }
          </div>
        </Card>

        {/* Image Management Modal */}
        <Modal open={showImageModal} onClose={() => setShowImageModal(false)} title={t('msg_0948')}>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">이미지 목록 (URL)</div>
              {imageListDraft.map((url, i) =>
                  <div key={i} className="flex items-center gap-2 mb-2">
                  <input className="flex-1 px-2 py-1 border rounded" value={url} onChange={(e) => setImageListDraft((s) => {const c = s.slice();c[i] = e.target.value;return c;})} />
                  <button className="text-red-500" onClick={() => setImageListDraft((s) => s.filter((_, idx) => idx !== i))}>{t("msg_0227")}</button>
                </div>
                  )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setImageListDraft((s) => [...s, ''])}>이미지 추가</Button>
                <Button variant="outline" onClick={() => setImageListDraft([])}>모두 삭제</Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowImageModal(false)}>{t("msg_0546")}</Button>
              <Button variant="primary" onClick={() => {setProduct((p: any) => ({ ...(p || {}), images: imageListDraft }));setShowImageModal(false);setToast(t('msg_0949')); try {localStorage.setItem(`product_draft_${product.id}`, JSON.stringify({ images: imageListDraft, description: descEditValue }));} catch (e) {}}}>{t("msg_0351")}</Button>
            </div>
          </div>
        </Modal>

        {/* Description Edit Modal */}
        {/* Product Settings Modal */}
        <Modal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} title={t('msg_0950')}>
          {settingsForm ?
              <div className="space-y-6">
              {/* 판매 상태 & 연동 */}
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-2">판매/상태</div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={!!settingsForm.is_selling}
                        onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), is_selling: e.target.checked }))
                        } />

                    판매 활성화
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={!!settingsForm.is_soldout}
                        onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), is_soldout: e.target.checked }))
                        } />

                    품절 처리
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={!!settingsForm.is_dutyfree}
                        onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), is_dutyfree: e.target.checked }))
                        } />

                    면세 상품
                  </label>
                  <div className="text-sm">
                    <div className="text-gray-700 mb-1">재고 연동</div>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2">
                        <input
                            type="radio"
                            name="settings-stock-linked"
                            checked={!!settingsForm.is_stock_linked}
                            onChange={() =>
                            setSettingsForm((s: any) => ({ ...(s || {}), is_stock_linked: true }))
                            } />{t("msg_0941")}


                        </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                            type="radio"
                            name="settings-stock-linked"
                            checked={!settingsForm.is_stock_linked}
                            onChange={() =>
                            setSettingsForm((s: any) => ({ ...(s || {}), is_stock_linked: false }))
                            } />{t("msg_0942")}


                        </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 기본 정책 */}
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-2">기본 정책</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-sm">
                    <div className="text-gray-700 mb-1">원산지</div>
                    <input
                        className="w-full px-2 py-1 border rounded"
                        value={settingsForm.origin_country}
                        onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), origin_country: e.target.value }))
                        } />

                  </div>
                  <div className="text-sm">
                    <div className="text-gray-700 mb-1">사입상품명</div>
                    <input
                        className="w-full px-2 py-1 border rounded"
                        value={settingsForm.purchase_name}
                        onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), purchase_name: e.target.value }))
                        } />

                  </div>
                  <div className="text-sm">
                    <div className="text-gray-700 mb-1">배송비정책</div>
                    <input
                        className="w-full px-2 py-1 border rounded"
                        value={settingsForm.shipping_policy}
                        onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), shipping_policy: e.target.value }))
                        } />

                  </div>
                  <div className="text-sm">
                    <div className="text-gray-700 mb-1">HS Code</div>
                    <input
                        className="w-full px-2 py-1 border rounded"
                        value={settingsForm.hs_code}
                        onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), hs_code: e.target.value }))
                        } />

                  </div>
                  <div className="text-sm">
                    <div className="text-gray-700 mb-1">박스당수량</div>
                    <input
                        type="number"
                        className="w-full px-2 py-1 border rounded"
                        value={settingsForm.box_qty}
                        onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), box_qty: e.target.value }))
                        } />

                  </div>
                  <div className="text-sm">
                    <div className="text-gray-700 mb-1">분류 ID</div>
                    <input
                        className="w-full px-2 py-1 border rounded"
                        value={settingsForm.classification_id}
                        onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), classification_id: e.target.value }))
                        } />

                  </div>
                </div>
              </div>

              {/* 할인 적용 */}
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-2">{t("msg_0536")}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-sm">
                    <div className="text-gray-700 mb-1">할인 유형</div>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2">
                        <input
                            type="radio"
                            name="discount-type"
                            checked={settingsForm.discountType === "none"}
                            onChange={() =>
                            setSettingsForm((s: any) => ({ ...(s || {}), discountType: "none" }))
                            } />{t("msg_0943")}


                        </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                            type="radio"
                            name="discount-type"
                            checked={settingsForm.discountType === "percent"}
                            onChange={() =>
                            setSettingsForm((s: any) => ({ ...(s || {}), discountType: "percent" }))
                            } />

                        % 할인
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                            type="radio"
                            name="discount-type"
                            checked={settingsForm.discountType === "amount"}
                            onChange={() =>
                            setSettingsForm((s: any) => ({ ...(s || {}), discountType: "amount" }))
                            } />

                        금액 할인
                      </label>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-700 mb-1">할인 값</div>
                    <input
                        type="number"
                        className="w-full px-2 py-1 border rounded"
                        value={settingsForm.discountValue}
                        onChange={(e) =>
                        setSettingsForm((s: any) => ({ ...(s || {}), discountValue: Number(e.target.value || 0) }))
                        }
                        disabled={settingsForm.discountType === "none"} />

                  </div>
                  <div className="text-sm">
                    <div className="text-gray-700 mb-1">적용 범위</div>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2">
                        <input
                            type="radio"
                            name="discount-apply-to"
                            checked={settingsForm.discountApplyTo === "product"}
                            onChange={() =>
                            setSettingsForm((s: any) => ({ ...(s || {}), discountApplyTo: "product" }))
                            } />

                        상품 대표가
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                            type="radio"
                            name="discount-apply-to"
                            checked={settingsForm.discountApplyTo === "variants"}
                            onChange={() =>
                            setSettingsForm((s: any) => ({ ...(s || {}), discountApplyTo: "variants" }))
                            } />

                        옵션가
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                            type="radio"
                            name="discount-apply-to"
                            checked={settingsForm.discountApplyTo === "both"}
                            onChange={() =>
                            setSettingsForm((s: any) => ({ ...(s || {}), discountApplyTo: "both" }))
                            } />

                        둘 다
                      </label>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-700 mb-1">기간(선택)</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                          type="datetime-local"
                          className="w-full px-2 py-1 border rounded"
                          value={settingsForm.discountStartAt}
                          onChange={(e) =>
                          setSettingsForm((s: any) => ({ ...(s || {}), discountStartAt: e.target.value }))
                          } />

                      <input
                          type="datetime-local"
                          className="w-full px-2 py-1 border rounded"
                          value={settingsForm.discountEndAt}
                          onChange={(e) =>
                          setSettingsForm((s: any) => ({ ...(s || {}), discountEndAt: e.target.value }))
                          } />

                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                          type="checkbox"
                          checked={!!settingsForm.applyImmediately}
                          onChange={(e) =>
                          setSettingsForm((s: any) => ({ ...(s || {}), applyImmediately: e.target.checked }))
                          } />

                      할인가를 즉시 판매단가에 반영
                    </label>
                  </div>
                  {/* 미리보기 */}
                  {!hidePreview &&
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-1">미리보기</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-2 rounded border bg-gray-50">
                          <div className="text-gray-600">대표 판매가</div>
                          <PreviewPrice
                            price={Number(product?.selling_price || 0)}
                            type={settingsForm.discountType}
                            value={Number(settingsForm.discountValue || 0)} />

                        </div>
                        <div className="p-2 rounded border bg-gray-50">
                          <div className="text-gray-600">첫 번째 옵션가</div>
                          <PreviewPrice
                            price={Number(product?.variants?.[0]?.selling_price || 0)}
                            type={settingsForm.discountType}
                            value={Number(settingsForm.discountValue || 0)} />

                        </div>
                      </div>
                    </div>
                    }
                </div>
              </div>

              {/* 액션 */}
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>{t("msg_0546")}</Button>
                <Button
                    variant="primary"
                    onClick={() => {
                      // 적용 로직
                      const {
                        is_selling,
                        is_soldout,
                        is_dutyfree,
                        origin_country,
                        purchase_name,
                        shipping_policy,
                        hs_code,
                        box_qty,
                        is_stock_linked,
                        classification_id,
                        discountType,
                        discountValue,
                        discountStartAt,
                        discountEndAt,
                        discountApplyTo,
                        applyImmediately
                      } = settingsForm || {};

                      applyProductPatch((draft) => {
                        draft.is_selling = !!is_selling;
                        draft.is_soldout = !!is_soldout;
                        draft.is_dutyfree = !!is_dutyfree;
                        draft.origin_country = String(origin_country || "");
                        draft.purchase_name = String(purchase_name || "");
                        draft.shipping_policy = String(shipping_policy || "");
                        draft.hs_code = String(hs_code || "");
                        draft.box_qty = box_qty ? Number(box_qty) : "";
                        draft.classification_id = String(classification_id || "");

                        // 재고 연동: 첫 옵션 기준 유지 (기존 로직과 합치)
                        if (Array.isArray(draft.variants) && draft.variants[0]) {
                          draft.variants[0].is_stock_linked = !!is_stock_linked;
                        }

                        // 할인 메타 저장 (표준화)
                        draft.pricing = {
                          ...(draft.pricing || {}),
                          discountType,
                          discountValue: Number(discountValue || 0),
                          discountStartAt: String(discountStartAt || ""),
                          discountEndAt: String(discountEndAt || ""),
                          discountApplyTo: discountApplyTo || "product"
                        };

                        // 즉시 반영 옵션
                        const calc = (p: number) => {
                          if (!Number.isFinite(p)) return p;
                          if (discountType === "percent") return Math.max(0, Math.round(p * (1 - Number(discountValue || 0) / 100)));
                          if (discountType === "amount") return Math.max(0, Math.round(p - Number(discountValue || 0)));
                          return p;
                        };
                        if (applyImmediately && discountType !== "none") {
                          if (discountApplyTo === "product" || discountApplyTo === "both") {
                            draft.selling_price = calc(Number(draft.selling_price || 0));
                          }
                          if ((discountApplyTo === "variants" || discountApplyTo === "both") && Array.isArray(draft.variants)) {
                            draft.variants = draft.variants.map((v: any) => ({
                              ...v,
                              selling_price: calc(Number(v.selling_price || 0))
                            }));
                          }
                        }
                      });

                      setShowSettingsModal(false);
                    }}>

                  적용
                </Button>
              </div>
            </div> :

              <div className="text-sm text-gray-600">설정 정보를 불러오는 중…</div>
              }
        </Modal>
        <Modal open={showDescEdit} onClose={() => setShowDescEdit(false)} title={t('msg_0951')}>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">HTML 입력</div>
              <textarea className="w-full h-56 p-2 border rounded font-mono text-sm" value={descEditValue} onChange={(e) => setDescEditValue(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowDescEdit(false)}>{t("msg_0546")}</Button>
              <Button variant="primary" onClick={() => {setProduct((p: any) => ({ ...p, description: descEditValue }));setShowDescEdit(false);setToast(t('msg_0952')); try {localStorage.setItem(`product_draft_${product.id}`, JSON.stringify({ images: imageListDraft, description: descEditValue }));} catch (e) {}}}>{t("msg_0351")}</Button>
            </div>
          </div>
        </Modal>

        {/* Variant Edit Modal */}
        <Modal open={showVariantModal} onClose={() => setShowVariantModal(false)} title={t('msg_0953')}>
          <div className="space-y-4">
            {variantForm ?
                <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="text-sm text-gray-600">{t("msg_1157")}</div>
                  <input className="w-full px-2 py-1 border rounded" value={variantForm.variant_name || ''} onChange={(e) => setVariantForm((v: any) => ({ ...v, variant_name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-gray-600">{t("msg_1410")}</div>
                    <input className="w-full px-2 py-1 border rounded" value={variantForm.code || ''} onChange={(e) => setVariantForm((v: any) => ({ ...v, code: e.target.value }))} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">바코드1</div>
                    <input className="w-full px-2 py-1 border rounded" value={variantForm.barcode1 || ''} onChange={(e) => setVariantForm((v: any) => ({ ...v, barcode1: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-gray-600">{t("msg_0884")}</div>
                    <input className="w-full px-2 py-1 border rounded" value={String(variantForm.selling_price || 0)} onChange={(e) => setVariantForm((v: any) => ({ ...v, selling_price: Number(e.target.value || 0) }))} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{t("msg_0410")}</div>
                    <input className="w-full px-2 py-1 border rounded" value={String(variantForm.stock || 0)} onChange={(e) => setVariantForm((v: any) => ({ ...v, stock: Number(e.target.value || 0) }))} />
                  </div>
                </div>
              </div> :

                <div>옵션을 불러오는 중입니다.</div>
                }
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowVariantModal(false)}>{t("msg_0546")}</Button>
              <Button variant="primary" onClick={async () => {
                    if (editingVariantIndex === null || !product) {setShowVariantModal(false);return;}
                    // update local product state
                    setProduct((p: any) => {
                      const copy = JSON.parse(JSON.stringify(p));
                      copy.variants = copy.variants || [];
                      copy.variants[editingVariantIndex] = {
                        ...(copy.variants[editingVariantIndex] || {}),
                        ...(variantForm || {})
                      };
                      return normalizeProduct(copy);
                    });

                    // persist barcode change to clientBarcodeStore so barcode pages stay in sync
                    try {
                      const updatedVariant = variantForm || {};
                      const barcodeValue = updatedVariant.barcode1 || updatedVariant.barcode || null;
                      const storeId = updatedVariant.id ? String(updatedVariant.id) + `-${product.id}` : String(product.id);
                      clientBarcodeStore.updateProductBarcode(storeId, barcodeValue);
                    } catch (e) {
                      console.warn("clientBarcodeStore update failed", e);
                    }

                    setShowVariantModal(false);
                    setToast(t('msg_0954'))
                  }}>{t("msg_0351")}</Button>
            </div>
          </div>
        </Modal>

        {/* 중복된 기본 상품 설정 모달(제거됨) */}

        {/* (상품 설명 수정 모달 제거) */}
          </GridCol>
          <GridCol span={1}><div></div></GridCol>
          {!hidePreview &&
          <GridCol span={5}>
              <div className="sticky top-24">
              <Card padding="md" className="shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={Array.isArray(product.images) && product.images[0] ? product.images[0] : `https://picsum.photos/seed/${product.id || 'preview'}/300/300`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {(e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id || 'preview'}/300/300`;}} />

                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">{t("msg_0833")}</div>
                        <div className="font-semibold">{product.name || '-'}</div>
                        <div className="text-xs text-gray-500 mt-1">{t("msg_0887")}</div>
                        <div className="text-sm">{product.brand || '-'}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          {product.is_soldout &&
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">{t("msg_0413")}</span>
                          }
                          {product.is_selling ?
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{t("msg_0406")}</span> :

                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">비판매</span>
                          }
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">시중가</div>
                          <div className="text-sm text-gray-800">{formatPriceOrDash(marketPriceValue)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">{t("msg_0884")}</div>
                        <div className="text-lg font-bold text-green-700">
                          <PreviewPrice
                            price={Number(product.selling_price || 0)}
                            type={product.pricing && (product.pricing as any).discountType || 'none'}
                            value={product.pricing && (product.pricing as any).discountValue || 0} />

                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">총재고</div>
                        <div>
                          {product.variants ?
                          (product.variants as any[]).reduce((s: number, v: any) => s + (v.stock || 0), 0).toLocaleString() :
                          '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              </div>
            </GridCol>
          }
          <GridCol span={3}><div></div></GridCol>
        </GridRow>
      </Container>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
          {/* bottom fixed action bar for create mode */}
          {createMode &&
      <div className="fixed left-0 right-0 bottom-0 z-50 bg-white border-t p-4">
              <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => {
              try {handleBack();} catch (e) {window.location.href = '/products';}
            }}>{t("msg_0546")}</Button>
                  <Button variant="primary" onClick={async () => {
              if (!onCreate) return;
              try {
                setSaveStatus('saving');
                await onCreate(product || {});
                setSaveStatus('saved');
                setToast(t('msg_0955'))
                if (onNavigate) onNavigate('products-list');else
                window.location.href = '/products';
              } catch (e) {
                console.error('create failed', e);
                setSaveStatus('error');
                setToast(t('msg_0956'))
              }
            }}>생성</Button>
                </div>
              </div>
            </div>
      }
          <div className="fixed right-6 bottom-6 z-50">
            <button
          className="px-3 py-2 bg-white border rounded text-sm"
          onClick={() => setIsHelpOpen(true)}
          aria-label={t('msg_0223')}>{t("msg_0223")}


        </button>
          </div>
          <SideGuide open={isHelpOpen} onClose={() => setIsHelpOpen(false)} title={t('msg_0957')}>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex gap-2 items-center">
                <button
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
              onClick={() => window.location.href = "/products/csv"}>

                  CSV 상품 등록으로 이동
                </button>
                <button
              className="px-3 py-2 bg-white border rounded text-sm"
              onClick={() => downloadCsvTemplate()}>

                  샘플 CSV 템플릿 다운로드
                </button>
                <button
              className="px-3 py-2 bg-white border rounded text-sm"
              onClick={() => window.location.href = "/products/import"}>{t("msg_0267")}


            </button>
              </div>
              <div className="flex gap-2">
                {/* 상품/옵션 일괄 수정 링크 제거 (기능 미제공) */}
                <button
              className="px-3 py-2 bg-white border rounded text-sm"
              onClick={() => window.location.href = "/products/add"}>

                  개별 상품 등록으로 이동
                </button>
              </div>
              <div className="text-xs text-gray-500">또는 각 항목의 상세 도움말은 해당 페이지에서 확인하세요.</div>
              <div className="overflow-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1 text-left">구분</th>
                      <th className="border px-2 py-1 text-left">입력항목</th>
                      <th className="border px-2 py-1 text-left">작성방법 / 유의사항</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-2 py-1 align-top">필수값</td>
                      <td className="border px-2 py-1 align-top">{t("msg_0833")}</td>
                      <td className="border px-2 py-1">- 필수값(미입력 시 업로드 불가)<br />- 기존 등록 상품과 중복 시 업로드 불가</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">{t("msg_1157")}</td>
                      <td className="border px-2 py-1">- 필수값(미입력 시 업로드 불가)<br />- 옵션이 없으면 “단일옵션” 입력<br />- 작성 시 제공된 예시 형식 참고</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1 align-top">옵션값</td>
                      <td className="border px-2 py-1">{t("msg_0883")}</td>
                      <td className="border px-2 py-1">- 기존 등록 상품과 중복 시 업로드 불가<br />- 미입력 시 중복체크 안 함</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">{t("msg_1159")}</td>
                      <td className="border px-2 py-1">- 기존 등록 옵션과 중복 시 업로드 불가<br />- 미입력 시 중복체크 안 함</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">{t("msg_1160")}</td>
                      <td className="border px-2 py-1">- 중복 불가<br />- 미입력 시 FULGO가 자동 부여</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">사입상품명</td>
                      <td className="border px-2 py-1">- 실제 매입 상품명 입력</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">{t("msg_1158")}</td>
                      <td className="border px-2 py-1">- 실제 매입 옵션명 입력</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">대표이미지주소</td>
                      <td className="border px-2 py-1">- http:// 또는 https:// 포함 경로 입력</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">색상 / 사이즈</td>
                      <td className="border px-2 py-1">- 옵션 색상/사이즈 입력 가능<br />- 미입력 시 공란 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">{t("msg_0889")}</td>
                      <td className="border px-2 py-1">- 상품 설명 입력 가능<br />- 동일 상품의 옵션별 설명이 다를 경우 최상위 설명이 적용됨</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">영문상품명 / 영문옵션명</td>
                      <td className="border px-2 py-1">- 영어 상품명/옵션명 입력 가능<br />- 미입력 시 공란 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">HS코드</td>
                      <td className="border px-2 py-1">- 상품 HS Code 입력<br />- 미입력 시 공란 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">가로 / 세로 / 높이</td>
                      <td className="border px-2 py-1">- cm 단위 숫자 입력<br />- 옵션 일괄 등록 시 사용</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">무게 / 부피</td>
                      <td className="border px-2 py-1">- g 단위 무게 입력<br />- 부피 = (가로×세로×높이)/6000<br />- 소수점 첫째 자리까지 입력 가능</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">해외통화상품가 / 해외통화옵션가</td>
                      <td className="border px-2 py-1">- 형식: 통화코드/금액 (예: JPY/1000)</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">박스당수량</td>
                      <td className="border px-2 py-1">- 숫자 입력, 옵션 일괄 등록 시 사용</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">세탁방법</td>
                      <td className="border px-2 py-1">- 상품 세탁 방법 입력 가능<br />- 미입력 시 공란 처리</td>
                    </tr>

                    <tr>
                      <td className="border px-2 py-1 align-top">관리정보</td>
                      <td className="border px-2 py-1">{t("msg_0905")}</td>
                      <td className="border px-2 py-1">- FULGO 상품분류 관리에 등록된 값 입력<br />- 미입력 시 기본 분류 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">{t("msg_0113")}</td>
                      <td className="border px-2 py-1">- FULGO 공급처 관리 등록명 입력<br />- 미입력 시 기본 공급처<br />- 미등록 공급처 입력 시 자동 등록</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">공급처 전화번호 / 위치</td>
                      <td className="border px-2 py-1">- 신규 공급처 등록 시 함께 입력 가능<br />- 기존 공급처 수정은 공급처 관리에서</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">{t("msg_0887")}</td>
                      <td className="border px-2 py-1">- FULGO 브랜드 관리 등록명 입력<br />- 미입력 시 “선택안함” 처리<br />- 미등록 브랜드 입력 시 자동 등록</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">상품연도 / 시즌</td>
                      <td className="border px-2 py-1">- FULGO 상품 연도·시즌 관리 등록 값 입력<br />- 미입력 시 “선택안함” 처리<br />- 미등록 값 입력 시 자동 등록</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">상품디자이너 / 상품등록자</td>
                      <td className="border px-2 py-1">- 해당 사용자 아이디 입력<br />- 미입력 또는 불일치 시 “미선택” 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">{t("msg_1169")}</td>
                      <td className="border px-2 py-1">- 일반 / 우수 / 특별 중 입력<br />- 미입력 시 “일반” 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">{t("msg_1165")}</td>
                      <td className="border px-2 py-1">- 상품 보관 위치 입력<br />- 미입력 시 공란 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">입고예정목록반영여부</td>
                      <td className="border px-2 py-1">- “반영” 또는 “미반영” 입력<br />- 발주 시 입고 예정 목록 반영 여부</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">판매여부</td>
                      <td className="border px-2 py-1">- 판매 중: “판매”<br />- 판매 중지: “미판매”<br />- 미입력 시 “판매” 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">{t("msg_1168")}</td>
                      <td className="border px-2 py-1">- 품절: “품절”<br />- 정상: “미품절”<br />- 미입력 시 “미품절” 처리</td>
                    </tr>

                    <tr>
                      <td className="border px-2 py-1 align-top">부가정보</td>
                      <td className="border px-2 py-1">원가 / 공급가 / 대표판매가 / 시중가 / 마진금액</td>
                      <td className="border px-2 py-1">- 미입력 시 0 처리<br />- 숫자가 아닌 경우 자동으로 0 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">현재재고 / 안정재고</td>
                      <td className="border px-2 py-1">- 미입력 시 0 처리<br />- 숫자가 아닌 경우 자동으로 0 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">상품메모</td>
                      <td className="border px-2 py-1">- 최대 15개 입력 가능 (1~15)<br />- 미입력 시 공란 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">옵션메모</td>
                      <td className="border px-2 py-1">- 최대 5개 입력 가능 (1~5)<br />- 미입력 시 공란 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">바코드번호2 / 바코드번호3</td>
                      <td className="border px-2 py-1">- 추가 바코드 입력 가능(중복 불가)<br />- 미입력 시 공란 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">해외통화상품가 / 해외통화옵션가</td>
                      <td className="border px-2 py-1">- 다중 입력 가능</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">편직정보</td>
                      <td className="border px-2 py-1">- 선택안함 / woven / knit 중 입력<br />- 미입력 시 “선택안함” 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">상품태그</td>
                      <td className="border px-2 py-1">- 다중 입력 가능, 콤마(,) 구분<br />- 공백 자동 제거<br />- 미입력 시 공란 처리</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1" />
                      <td className="border px-2 py-1">소비자가 / 브랜드수수료율</td>
                      <td className="border px-2 py-1">- 미입력 시 0 처리<br />- 숫자가 아닌 경우 자동 0 처리</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </SideGuide>
    </>);

};

export default ProductDetailPage;