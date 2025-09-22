import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Card,
  Button,
  Stack,
  Input,
  Badge,
} from "@/design-system";
import Toast from "@/components/Toast";
import { formatPrice } from "@/utils/productUtils";

interface OptionEditPageProps {
  productId?: string;
  variantId?: string;
}

type OptionFormState = {
  optionName: string;
  supplierOptionName: string;
  optionCode: string;
  barcode1: string;
  barcode2: string;
  barcode3: string;
  sellingPrice: string;
  costPrice: string;
  supplyPrice: string;
  stock: string;
  safetyStock: string;
  location: string;
  memo: string;
  grade: string;
  autoShip: boolean;
  syncStock: boolean;
  isSelling: boolean;
  isSoldout: boolean;
  importer: string;
  manufacturer: string;
  manufactureCountry: string;
  material: string;
  productType: string;
  usagePolicy: string;
  autoScan: boolean;
  hiddenRelease: boolean;
  preventBundle: boolean;
  cafeSaleUse: string;
  color: string;
  size: string;
  weight: string;
  width: string;
  height: string;
  depth: string;
  sellerOptionCodes: string;
  inboundExpectedDate: string;
  inboundExpectedQty: string;
  createdAt: string;
  updatedAt: string;
  orderStatus: string;
  optionMemo1: string;
  optionMemo2: string;
  optionMemo3: string;
  optionMemo4: string;
  optionMemo5: string;
  englishOptionName: string;
  foreignCurrencyPrice: string;
};

const defaultFormState: OptionFormState = {
  optionName: "",
  supplierOptionName: "",
  optionCode: "",
  barcode1: "",
  barcode2: "",
  barcode3: "",
  sellingPrice: "",
  costPrice: "",
  supplyPrice: "",
  stock: "",
  safetyStock: "",
  location: "",
  memo: "",
  grade: "",
  autoShip: false,
  syncStock: true,
  isSelling: true,
  isSoldout: false,
  importer: "",
  manufacturer: "",
  manufactureCountry: "",
  material: "",
  productType: "",
  usagePolicy: "",
  autoScan: false,
  hiddenRelease: false,
  preventBundle: false,
  cafeSaleUse: "",
  color: "",
  size: "",
  weight: "",
  width: "",
  height: "",
  depth: "",
  sellerOptionCodes: "",
  inboundExpectedDate: "",
  inboundExpectedQty: "",
  createdAt: "",
  updatedAt: "",
  orderStatus: "",
  optionMemo1: "",
  optionMemo2: "",
  optionMemo3: "",
  optionMemo4: "",
  optionMemo5: "",
  englishOptionName: "",
  foreignCurrencyPrice: "",
};

const OptionEditPage: React.FC<OptionEditPageProps> = ({
  productId: propProductId,
  variantId: propVariantId,
}) => {
  const router = useRouter();
  const {
    productId: queryProductId,
    id: queryId,
    variantId: queryVariantId,
  } = router.query;

  const productId = useMemo(() => {
    const candidates = [propProductId, queryProductId, queryId];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate) return candidate;
      if (Array.isArray(candidate) && candidate.length > 0)
        return candidate[0];
    }
    return "";
  }, [propProductId, queryProductId, queryId]);

  const variantId = useMemo(() => {
    const vid = propVariantId ||
      (typeof queryVariantId === "string"
        ? queryVariantId
        : Array.isArray(queryVariantId)
        ? queryVariantId[0]
        : "");
    return vid;
  }, [propVariantId, queryVariantId]);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any | null>(null);
  const [variant, setVariant] = useState<any | null>(null);
  const [form, setForm] = useState<OptionFormState>(defaultFormState);
  const [toast, setToast] = useState<string | null>(null);

  // Dropdown option lists (populate all choices you requested)
  const productLocations = [
    'ON',
    '상품위치-test',
    '마르헨제이_이천센터_국내재고',
    '마르헨제이_이천센터_출고존',
    '마르헨제이_이천센터_보관존',
    '마르헨제이_이천센터_입고존',
    '마르헨제이_이천센터_가상재고',
    '마르헨제이_이천센터_불량재고',
    '마르헨제이_이천센터_해외재고',
    '마르헨제이_본사창고_보관존',
    '마르헨제이_본사창고_입고존',
    '마르헨제이_본사창고_출고존',
  ];

  const saleStatuses = [
    { value: 'selling', label: '판매중' },
    { value: 'stopped', label: '판매중지' },
  ];

  const soldoutOptions = [
    { value: 'false', label: '미품절' },
    { value: 'true', label: '품절' },
  ];

  const grades = [
    '일반관리',
    '중요관리',
    '보류',
  ];

  const orderStatuses = [
    '선택 안함',
    '발주 필요',
    '발주 완료',
    '발주 보류',
  ];

  const suppliers = ['자사', '공급처A', '공급처B', '공급처C'];
  const manufacturers = ['제조원A', '제조원B', '제조원C'];
  const countries = ['KR', 'CN', 'US', 'JP'];
  const materials = ['면', '폴리에스터', '울', '레이온'];
  const productTypes = ['의류', '전자', '잡화', '생활'];
  const usageOptions = ['동일상품 동시적용', '별도적용'];
  const booleanOptions = [{ value: 'yes', label: '사용' }, { value: 'no', label: '사용안함' }];

  useEffect(() => {
    if (!productId) return;
    let mounted = true;
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((payload) => {
        if (!mounted) return;
        const resolved = payload?.product ?? payload;
        setProduct(resolved || null);
      })
      .catch(() => {
        if (!mounted) return;
        setProduct(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    if (!variantId) {
      setVariant(null);
      return;
    }
    const candidates = Array.isArray(product.variants)
      ? (product.variants as any[])
      : [];
    const found = candidates.find((v, idx) => {
      const possibleIds = [
        v.id,
        v.variant_id,
        v.option_id,
        v.code,
        v.option_code,
        v.barcode1,
        v.barcode,
        `index-${idx}`,
        String(idx),
      ]
        .filter(Boolean)
        .map((value) => String(value));
      return possibleIds.includes(String(variantId));
    });
    setVariant(found || null);
  }, [product, variantId]);

  // If product did not contain a rich variant, try fetching variant directly
  // from the API to obtain more fields (useful when getProduct returns a
  // lightweight placeholder). This helps when supabase is not configured
  // and the product payload lacks detailed variant data.
  useEffect(() => {
    if (!productId || !variantId) return;
    // if variant already present with useful fields, skip
    if (variant && (variant.sku || variant.selling_price || variant.stock)) return;
    let mounted = true;
    fetch(`/api/products/${productId}/variants/${variantId}`)
      .then((res) => res.json())
      .then((payload) => {
        if (!mounted) return;
        // payload may be a wrapper or the variant itself
        const v = payload?.variant ?? payload;
        if (v) {
          setVariant((prev: any) => {
            if (!prev) return v
            const mergedExtra = Object.assign({}, prev.extra_fields || {}, v.extra_fields || {})
            return Object.assign({}, prev, v, { extra_fields: mergedExtra })
          })
        }
      })
      .catch(() => {
        // ignore
      });
    return () => {
      mounted = false;
    };
  }, [productId, variantId, variant]);

  useEffect(() => {
    if (!variant) {
      setForm(defaultFormState);
      return;
    }
    const toStringValue = (value: unknown) =>
      value === null || value === undefined ? "" : String(value);
    setForm({
      optionName:
        variant.variant_name || variant.option_name || variant.name || "",
      supplierOptionName: variant.option_supplier_name || "",
      optionCode: variant.code || variant.option_code || "",
      barcode1: variant.barcode1 || variant.barcode || "",
      barcode2: variant.barcode2 || "",
      barcode3: variant.barcode3 || "",
      sellingPrice: toStringValue(variant.selling_price ?? variant.price),
      costPrice: toStringValue(variant.cost_price ?? variant.option_cost_price),
      supplyPrice: toStringValue(
        variant.supply_price ?? variant.option_supply_price,
      ),
      stock: toStringValue(variant.stock),
      safetyStock: toStringValue(
        variant.safety_stock ?? variant.safetyStock ?? "",
      ),
      location: variant.warehouse_location || variant.location || "",
      memo: variant.note || variant.memo || "",
      grade: variant.grade || "",
      autoShip: Boolean(variant.auto_ship),
      syncStock: Boolean(
        variant.is_stock_linked ?? variant.sync_stock ?? true,
      ),
      isSelling: Boolean(variant.is_selling ?? variant.isSelling ?? true),
      isSoldout: Boolean(variant.is_soldout ?? variant.isSoldout ?? false),
      color: variant.color || "",
      size: variant.size || "",
      manufacturer: variant.manufacturer || "",
      manufactureCountry: variant.manufacture_country || "",
      material: variant.material || "",
      weight: toStringValue(variant.weight_g ?? variant.weight),
      width: toStringValue(variant.width_cm ?? variant.width),
      height: toStringValue(variant.height_cm ?? variant.height),
      depth: toStringValue(variant.depth_cm ?? variant.depth),
      sellerOptionCodes:
        variant.channel_option_codes ||
        variant.extra_fields?.channel_option_codes ||
        "",
      inboundExpectedDate:
        variant.extra_fields?.inbound_expected_date || variant.inbound_expected_date || "",
      inboundExpectedQty: toStringValue(
        variant.extra_fields?.inbound_expected_qty ?? variant.inbound_expected_qty ?? "",
      ),
      createdAt: variant.created_at || variant.createdAt || "",
      updatedAt: variant.updated_at || variant.updatedAt || "",
      orderStatus: variant.order_status || variant.extra_fields?.order_status || "",
      importer: variant.supplier || variant.extra_fields?.supplier || "",
      productType: variant.product_type || variant.extra_fields?.product_type || "",
      usagePolicy: variant.usage_policy || variant.extra_fields?.usage_policy || "",
      autoScan: Boolean(variant.auto_scan ?? variant.extra_fields?.auto_scan ?? false),
      hiddenRelease: Boolean(variant.hidden_release ?? variant.extra_fields?.hidden_release ?? false),
      preventBundle: Boolean(variant.prevent_bundle ?? variant.extra_fields?.prevent_bundle ?? false),
      cafeSaleUse: variant.extra_fields?.cafe_sale_use || variant.cafe_sale_use || "",
      // option memos and additional display fields
      optionMemo1: variant.extra_fields?.option_memo1 || variant.option_memo1 || "",
      optionMemo2: variant.extra_fields?.option_memo2 || variant.option_memo2 || "",
      optionMemo3: variant.extra_fields?.option_memo3 || variant.option_memo3 || "",
      optionMemo4: variant.extra_fields?.option_memo4 || variant.option_memo4 || "",
      optionMemo5: variant.extra_fields?.option_memo5 || variant.option_memo5 || "",
      englishOptionName: variant.extra_fields?.english_option_name || variant.english_option_name || "",
      foreignCurrencyPrice: toStringValue(variant.extra_fields?.foreign_currency_price ?? variant.foreign_currency_price ?? ""),
  // flags are already set above (avoid duplicate keys)
    });
  }, [variant]);

  const statusBadges = useMemo(() => {
    if (!variant) return [] as Array<{ label: string; tone: "green" | "gray" | "red" }>;
    return [
      {
        label: variant.is_selling === false ? "판매중지" : "판매중",
        tone: variant.is_selling === false ? "gray" : "green",
      },
      {
        label: variant.is_soldout ? "품절" : "재고 보유",
        tone: variant.is_soldout ? "red" : "green",
      },
      {
        label: Boolean(
          variant.is_stock_linked ?? variant.sync_stock ?? true,
        )
          ? "재고연동"
          : "재고단독",
        tone: Boolean(
          variant.is_stock_linked ?? variant.sync_stock ?? true,
        )
          ? "green"
          : "gray",
      },
    ];
  }, [variant]);

  const handleChange = <K extends keyof OptionFormState>(
    key: K,
    value: OptionFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setToast("옵션 정보가 임시로 저장되었습니다. (목업)");
  };

  const handleBack = () => {
    if (router?.back) {
      router.back();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const FormRow: React.FC<{
    label: string;
    required?: boolean;
    children: React.ReactNode;
    alignTop?: boolean;
  }> = ({ label, required, children, alignTop = false }) => (
    <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0">
      <div
        className={`text-sm font-medium text-gray-700 flex gap-1 ${
          alignTop ? "items-start pt-1" : "items-center"
        }`}
      >
        {required ? <span className="text-red-500">*</span> : null}
        <span>{label}</span>
      </div>
      <div className={`flex flex-col ${alignTop ? "gap-2" : "gap-1"}`}>
        {children}
      </div>
    </div>
  );

  if (!productId) {
    return (
      <Container maxWidth="5xl" padding="lg">
        <div className="py-12 text-center">
          <h1 className="text-xl font-semibold text-gray-800">
            옵션을 불러올 수 없습니다
          </h1>
          <p className="mt-3 text-gray-600">
            유효한 상품 ID가 필요합니다.
          </p>
          <Button className="mt-6" variant="primary" onClick={handleBack}>
            돌아가기
          </Button>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="5xl" padding="lg">
        <div className="py-12 text-center text-gray-600">불러오는 중...</div>
      </Container>
    );
  }

  if (!product || !variant) {
    return (
      <Container maxWidth="5xl" padding="lg">
        <div className="py-12 text-center">
          <h1 className="text-xl font-semibold text-gray-800">
            옵션을 찾을 수 없습니다
          </h1>
          <p className="mt-3 text-gray-600">
            요청하신 옵션 정보가 존재하지 않거나 삭제되었습니다.
          </p>
          <Button className="mt-6" variant="primary" onClick={handleBack}>
            목록으로 돌아가기
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="6xl" padding="lg" className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">옵션정보수정</h1>
            <p className="mt-1 text-sm text-gray-600">
              {product?.name} · {form.optionName || variant.variant_name}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {statusBadges.map((badge) => (
                <Badge
                  key={`${badge.label}-${badge.tone}`}
                  variant={badge.tone === "green" ? "success" : badge.tone === "red" ? "danger" : "neutral"}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>
          <Stack direction="row" gap={2}>
            <Button variant="outline" onClick={handleBack}>
              돌아가기
            </Button>
            <Button variant="primary" onClick={handleSave}>
              저장
            </Button>
          </Stack>
        </div>

        <Card padding="lg" className="mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            기본 정보
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <FormRow label="상품명" required>
              <Input value={product.name || ""} disabled fullWidth />
            </FormRow>
            <FormRow label="옵션명" required>
              <Input
                value={form.optionName}
                onChange={(e) => handleChange("optionName", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="사입옵션명">
              <Input
                value={form.supplierOptionName}
                onChange={(e) =>
                  handleChange("supplierOptionName", e.target.value)
                }
                fullWidth
              />
            </FormRow>
            <FormRow label="옵션코드">
              <Input
                value={form.optionCode}
                onChange={(e) => handleChange("optionCode", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="바코드번호" required>
              <Input value={form.barcode1} disabled fullWidth />
              <p className="text-xs text-gray-500">
                바코드 번호는 시스템에서 관리되며 변경할 수 없습니다.
              </p>
            </FormRow>
            <FormRow label="바코드번호2">
              <Input value={form.barcode2} disabled fullWidth />
            </FormRow>
            <FormRow label="바코드번호3">
              <Input value={form.barcode3} disabled fullWidth />
            </FormRow>
          </div>
        </Card>

        <Card padding="lg" className="mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">가격 정보</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <FormRow label="판매가" required>
              <Input
                type="number"
                value={form.sellingPrice}
                onChange={(e) => handleChange("sellingPrice", e.target.value)}
                fullWidth
              />
              <span className="text-xs text-gray-500">
                현재가: {formatPrice(Number(form.sellingPrice || 0))}
              </span>
            </FormRow>
            <FormRow label="원가">
              <Input
                type="number"
                value={form.costPrice}
                onChange={(e) => handleChange("costPrice", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="공급가">
              <Input
                type="number"
                value={form.supplyPrice}
                onChange={(e) => handleChange("supplyPrice", e.target.value)}
                fullWidth
              />
            </FormRow>
          </div>
        </Card>

        <Card padding="lg" className="mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">재고 및 출고 정보</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <FormRow label="재고수량">
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="안전재고">
              <Input
                type="number"
                value={form.safetyStock}
                onChange={(e) => handleChange("safetyStock", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="상품위치">
              <select
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="rounded-md border px-2 py-2"
              >
                <option value="">선택</option>
                {productLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="자동발주">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.autoShip}
                  onChange={(e) => handleChange("autoShip", e.target.checked)}
                />
                사용
              </label>
            </FormRow>
            <FormRow label="재고연동">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.syncStock}
                  onChange={(e) => handleChange("syncStock", e.target.checked)}
                />
                연동 활성화
              </label>
            </FormRow>
            <FormRow label="판매상태">
              <select
                value={form.isSelling ? 'selling' : 'stopped'}
                onChange={(e) => handleChange('isSelling', e.target.value === 'selling')}
                className="rounded-md border px-2 py-2"
              >
                {saleStatuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </FormRow>
            <FormRow label="품절여부">
              <select
                value={form.isSoldout ? 'true' : 'false'}
                onChange={(e) => handleChange('isSoldout', e.target.value === 'true')}
                className="rounded-md border px-2 py-2"
              >
                {soldoutOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </FormRow>
          </div>
        </Card>

        <Card padding="lg" className="mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            추가 정보
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <FormRow label="관리등급">
              <select
                value={form.grade}
                onChange={(e) => handleChange('grade', e.target.value)}
                className="rounded-md border px-2 py-2"
              >
                <option value="">선택</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </FormRow>
            <FormRow label="입고 예정일">
              <Input value={form.inboundExpectedDate || ''} disabled fullWidth />
            </FormRow>
            <FormRow label="입고 예정수량">
              <Input value={form.inboundExpectedQty || ''} disabled fullWidth />
            </FormRow>
            <FormRow label="발주상태">
              <select
                value={form.orderStatus || ''}
                onChange={(e) => handleChange('orderStatus', e.target.value)}
                className="rounded-md border px-2 py-2"
              >
                {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormRow>
            <FormRow label="등록일자">
              <Input value={form.createdAt || ''} disabled fullWidth />
            </FormRow>
            <FormRow label="최종수정일자">
              <Input value={form.updatedAt || ''} disabled fullWidth />
            </FormRow>
            <FormRow label="색상">
              <Input
                value={form.color}
                onChange={(e) => handleChange("color", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="사이즈">
              <Input
                value={form.size}
                onChange={(e) => handleChange("size", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="제조사">
              <Input
                value={form.manufacturer}
                onChange={(e) =>
                  handleChange("manufacturer", e.target.value)
                }
                fullWidth
              />
            </FormRow>
            <FormRow label="제조국">
              <Input
                value={form.manufactureCountry}
                onChange={(e) =>
                  handleChange("manufactureCountry", e.target.value)
                }
                fullWidth
              />
            </FormRow>
            <FormRow label="소재">
              <Input
                value={form.material}
                onChange={(e) => handleChange("material", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="무게(g)">
              <Input
                type="number"
                value={form.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="가로(cm)">
              <Input
                type="number"
                value={form.width}
                onChange={(e) => handleChange("width", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="세로(cm)">
              <Input
                type="number"
                value={form.height}
                onChange={(e) => handleChange("height", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="높이(cm)">
              <Input
                type="number"
                value={form.depth}
                onChange={(e) => handleChange("depth", e.target.value)}
                fullWidth
              />
            </FormRow>
            <FormRow label="메모" alignTop>
              <textarea
                className="w-full min-h-[120px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.memo}
                onChange={(e) => handleChange("memo", e.target.value)}
              />
            </FormRow>
            <FormRow label="옵션메모1">
              <Input value={form.optionMemo1} onChange={(e) => handleChange('optionMemo1', e.target.value)} fullWidth />
            </FormRow>
            <FormRow label="옵션메모2">
              <Input value={form.optionMemo2} onChange={(e) => handleChange('optionMemo2', e.target.value)} fullWidth />
            </FormRow>
            <FormRow label="옵션메모3">
              <Input value={form.optionMemo3} onChange={(e) => handleChange('optionMemo3', e.target.value)} fullWidth />
            </FormRow>
            <FormRow label="옵션메모4">
              <Input value={form.optionMemo4} onChange={(e) => handleChange('optionMemo4', e.target.value)} fullWidth />
            </FormRow>
            <FormRow label="옵션메모5">
              <Input value={form.optionMemo5} onChange={(e) => handleChange('optionMemo5', e.target.value)} fullWidth />
            </FormRow>
            <FormRow label="영문옵션명">
              <Input value={form.englishOptionName} onChange={(e) => handleChange('englishOptionName', e.target.value)} fullWidth />
            </FormRow>
            <FormRow label="해외통화옵션가">
              <Input value={form.foreignCurrencyPrice} onChange={(e) => handleChange('foreignCurrencyPrice', e.target.value)} fullWidth />
            </FormRow>
            <FormRow label="미진열출고여부">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.hiddenRelease} onChange={(e) => handleChange('hiddenRelease', e.target.checked)} /> 미진열출고여부 설정
              </label>
            </FormRow>
            <FormRow label="옵션합포방지여부">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.preventBundle} onChange={(e) => handleChange('preventBundle', e.target.checked)} /> 옵션합포방지여부 설정
              </label>
            </FormRow>
            <FormRow label="자동스캔여부">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.autoScan} onChange={(e) => handleChange('autoScan', e.target.checked)} /> 자동 스캔 사용
              </label>
            </FormRow>
            <FormRow label="카페판매사용여부">
              <select value={form.cafeSaleUse || ''} onChange={(e) => handleChange('cafeSaleUse', e.target.value)} className="rounded-md border px-2 py-2">
                <option value="">선택</option>
                <option value="관리안함">관리안함</option>
                <option value="사용">사용</option>
              </select>
            </FormRow>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleBack}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSave}>
            저장
          </Button>
        </div>
      </Container>
      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
};

export default OptionEditPage;
