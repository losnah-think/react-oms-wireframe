import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  Container,
  Stack,
  GridRow,
  GridCol,
} from "../../design-system";
import { normalizeProductGroup } from "../../utils/groupUtils";
import type { ProductFormData } from "../../types/multitenant";
import Toast from "../../components/Toast";

const safeJson = async (res: Response | undefined, fallback: any) => {
  if (!res || !res.ok) return fallback;
  try {
    const j = await res.json();
    if (!j) return fallback;
    if (Array.isArray(j)) return { groups: j };
    if (j.groups && Array.isArray(j.groups)) return { groups: j.groups };
    return fallback;
  } catch {
    return fallback;
  }
};

interface ProductsAddPageProps {
  onNavigate?: (page: string) => void;
  onSave?: (data: ProductFormData) => void;
  productId?: string;
}

const initialFormData: ProductFormData = {
  basicInfo: {
    productName: "",
    englishProductName: "",
    productCode: "",
    productCategory: "",
    brandId: "",
    supplierId: "",
    codes: { internal: "", cafe24: "", channels: [] },
    categoryId: "",
    pricing: {
      sellingPrice: 0,
      consumerPrice: 0,
      supplyPrice: 0,
      commissionRate: 15,
      isSupplyPriceCalculated: true,
      calculationMethod: "commission",
    },
    originalCost: 0,
    representativeSellingPrice: 0,
    representativeSupplyPrice: 0,
    marketPrice: 0,
    consumerPrice: 0,
    foreignCurrencyPrice: 0,
    stock: 0,
    safeStock: 0,
    isOutOfStock: false,
    isSelling: false,
    isSoldout: false,
    description: "",
    representativeImage: "",
    descriptionImages: [],
    thumbnailUrl: "",
    images: [],
    width: 0,
    height: 0,
    depth: 0,
    weight: 0,
    volume: 0,
    hsCode: "",
    origin: "",
    isTaxExempt: false,
    showProductNameOnInvoice: true,
    productDesigner: "",
    productRegistrant: "",
    productYear: "",
    productSeason: "",
    externalProductId: "",
    externalUrl: "",
    active: true,
    tags: [],
    logistics: {
      width: 0,
      height: 0,
      depth: 0,
      weight: 0,
      packagingUnit: "ea",
      packagingQuantity: 1,
      isFragile: false,
      isLiquid: false,
    },
    policies: {
      showProductNameOnInvoice: true,
      preventConsolidation: false,
      shippingPolicyId: undefined,
      giftPolicyId: undefined,
      isSampleIncluded: false,
      isReturnable: true,
      isExchangeable: true,
      returnPeriodDays: 14,
    },
  },
  additionalInfo: {
    productDesigner: "",
    publishDate: undefined,
    detailedLogistics: {
      width: undefined,
      height: undefined,
      depth: undefined,
      weight: undefined,
      packagingUnit: "ea",
      packagingQuantity: 1,
      isFragile: false,
      isLiquid: false,
      packageWidth: undefined,
      packageHeight: undefined,
      packageDepth: undefined,
      packageWeight: undefined,
      countryOfOrigin: "KR",
      hsCode: "",
      storageConditions: "",
      shelfLife: undefined,
    },
    memos: Array.from({ length: 15 }).map(() => ""),
  },
  validation: {
    errors: {},
    warnings: {},
    isValid: true,
    touchedFields: new Set(),
  },
};
const ProductsAddPage: React.FC<ProductsAddPageProps> = ({
  onNavigate,
  onSave,
  productId,
}) => {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [collapsedSections, setCollapsedSections] = useState<{
    [k: string]: boolean;
  }>({ additionalInfo: true, logistics: true, policies: true });
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [productFilterOptions, setProductFilterOptions] = useState<any>({
    brands: [],
    categories: [],
    suppliers: [],
    status: [],
  });
  const [groupsData, setGroupsData] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 필드 업데이트 함수
  const updateField = (path: string, value: any) => {
    const keys = path.split(".");
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur: any = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        cur = cur[keys[i]] = cur[keys[i]] ?? {};
      }
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  // variants / options helpers
  const addOptionGroup = () => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.additionalInfo.options = copy.additionalInfo.options || [];
      copy.additionalInfo.options.push({
        id: `opt-${Date.now()}`,
        name: "옵션 그룹",
        type: "other",
        values: [],
        isRequired: false,
      });
      return copy;
    });
  };

  const removeOptionGroup = (id: string) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.additionalInfo.options = (copy.additionalInfo.options || []).filter(
        (o: any) => o.id !== id,
      );
      return copy;
    });
  };

  const addOptionValue = (groupId: string) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const g = (copy.additionalInfo.options || []).find(
        (o: any) => o.id === groupId,
      );
      if (!g) return copy;
      g.values = g.values || [];
      g.values.push({
        id: `val-${Date.now()}`,
        value: "새값",
        additionalPrice: 0,
        stock: 0,
        isActive: true,
      });
      return copy;
    });
  };

  const updateOptionValue = (groupId: string, valueId: string, patch: any) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const g = (copy.additionalInfo.options || []).find(
        (o: any) => o.id === groupId,
      );
      if (!g) return copy;
      const v = (g.values || []).find((vv: any) => vv.id === valueId);
      if (!v) return copy;
      Object.assign(v, patch);
      return copy;
    });
  };

  const removeOptionValue = (groupId: string, valueId: string) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const g = (copy.additionalInfo.options || []).find(
        (o: any) => o.id === groupId,
      );
      if (!g) return copy;
      g.values = (g.values || []).filter((vv: any) => vv.id !== valueId);
      return copy;
    });
  };

  // Persist variants to server
  const saveVariants = async () => {
    if (!productId) {
      setToastMessage("편집 모드에서만 Variants를 저장할 수 있습니다.");
      return;
    }
    try {
      const payload = (formData.additionalInfo.options || []).flatMap(
        (g: any) =>
          (g.values || []).map((v: any) => ({
            id: v.id && String(v.id).startsWith("val-") ? undefined : v.id,
            sku: v.sku || undefined,
            price: v.additionalPrice || undefined,
            stock: v.stock || undefined,
            option_values: { [g.name || g.id]: v.value },
          })),
      );
      const res = await fetch(`/api/products/${productId}/variants`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "failed");
      }
      const body = await res.json();
      alert("Variants 저장 완료");
      // refresh product data
      const fres = await fetch(`/api/products/${productId}`);
      if (fres.ok) {
        const fb = await fres.json();
        const { mapDbProductToForm } = await import("src/lib/productMappers");
        setFormData(mapDbProductToForm(fb.product));
      }
    } catch (e: any) {
      console.error("saveVariants error", e);
      alert("Variants 저장 실패: " + (e?.message || String(e)));
    }
  };

  // 기존 상품 데이터 로딩 (수정 모드)
  useEffect(() => {
    if (!productId) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) return;
        const body = await res.json();
        if (!mounted) return;
        const p = body.product;
        if (!p) return;
        // use mapper helper
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { mapDbProductToForm } = await import("src/lib/productMappers");
        const mapped = mapDbProductToForm(p);
        setFormData(mapped);
      } catch (err) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productId]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/meta/product-filters")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setProductFilterOptions(
          data || { brands: [], categories: [], suppliers: [], status: [] },
        );
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/meta/groups")
      .then((r) => safeJson(r, { groups: [] }))
      .then((data) => {
        if (!mounted) return;
        const groups = data && data.groups ? data.groups : [];
        setGroupsData(Array.isArray(groups) ? groups : []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // 공급가 자동계산
  useEffect(() => {
    const selling = formData.basicInfo.pricing.sellingPrice || 0;
    const com = formData.basicInfo.pricing.commissionRate || 0;
    if (selling > 0 && com > 0) {
      const calc = Math.round((selling * (100 - com)) / 100);
      updateField("basicInfo.pricing.supplyPrice", calc);
    }
  }, [
    formData.basicInfo.pricing.sellingPrice,
    formData.basicInfo.pricing.commissionRate,
  ]);

  const toggleSection = (name: string) =>
    setCollapsedSections((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleSave = async () => {
    setSaving(true);
    if (
      !formData.basicInfo.productName ||
      !formData.basicInfo.codes.internal ||
      !formData.basicInfo.categoryId ||
      !formData.basicInfo.brandId
    ) {
      alert("필수 항목을 입력하세요.");
      setSaving(false);
      return;
    }
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    onSave?.(formData);
    onNavigate?.("products-list");
  };

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      // basic validation
      if (
        !formData.basicInfo.productName ||
        !formData.basicInfo.codes.internal
      ) {
        setToastMessage("필수 항목을 입력하세요.");
        setSaving(false);
        return;
      }
      await new Promise((r) => setTimeout(r, 700));
      onSave?.(formData);
      setToastMessage("상품이 저장되었습니다. 계속 등록하실 수 있습니다.");
      // reset form but preserve commonly reused selectors (brand, supplier, category)
      setFormData((prev) => {
        const preserved = {
          basicInfo: {
            brandId:
              prev.basicInfo?.brandId || initialFormData.basicInfo.brandId,
            supplierId:
              prev.basicInfo?.supplierId ||
              initialFormData.basicInfo.supplierId,
            categoryId:
              prev.basicInfo?.categoryId ||
              initialFormData.basicInfo.categoryId,
            codes: { ...initialFormData.basicInfo.codes },
          },
          additionalInfo: { ...initialFormData.additionalInfo },
          validation: { ...initialFormData.validation },
        } as ProductFormData;
        // ensure codes.internal is cleared
        preserved.basicInfo.codes.internal = "";
        return preserved;
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Container maxWidth="full" className="py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">상품 등록</h1>
            <div>
              <button
                className="px-3 py-1 border rounded text-sm mr-2"
                onClick={() => setShowAdvanced((s) => !s)}
              >
                {showAdvanced ? "고급항목 숨기기" : "고급항목 표시"}
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                onClick={handleSaveAndContinue}
              >
                저장 후 계속
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            {/* 메인 폼 영역 */}
            <form className="flex-1 space-y-6">
              <Card>
                <div className="mb-4">
                  <h2 className="text-lg font-bold">기본 정보</h2>
                  <p className="text-sm text-gray-500">
                    상품의 기본 정보를 입력하세요.
                  </p>
                </div>
                <GridRow gutter={24}>
                  <GridCol span={12}>
                    <Input
                      label="상품명"
                      required
                      placeholder="예: 프리미엄 티셔츠"
                      value={formData.basicInfo.productName}
                      onChange={(e) =>
                        updateField("basicInfo.productName", e.target.value)
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <Input
                      label="영문 상품명"
                      placeholder="예: Premium T-shirt"
                      value={formData.basicInfo.englishProductName || ""}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.englishProductName",
                          e.target.value,
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <Input
                      label="상품코드"
                      required
                      placeholder="내부 상품코드"
                      value={formData.basicInfo.codes.internal}
                      onChange={(e) =>
                        updateField("basicInfo.codes.internal", e.target.value)
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      그룹(소속)
                    </label>
                    {!showAdvanced ? (
                      <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm">
                        {formData.basicInfo.categoryId || "미지정"}
                      </div>
                    ) : (
                      <select
                        value={formData.basicInfo.categoryId}
                        onChange={(e) =>
                          updateField("basicInfo.categoryId", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">카테고리 선택</option>
                        {(productFilterOptions.categories || []).map(
                          (cat: any) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ),
                        )}
                      </select>
                    )}
                  </GridCol>
                  <GridCol span={12}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      브랜드
                    </label>
                    {!showAdvanced ? (
                      <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm">
                        {formData.basicInfo.brandId || "미지정"}
                      </div>
                    ) : (
                      <select
                        value={formData.basicInfo.brandId}
                        onChange={(e) =>
                          updateField("basicInfo.brandId", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">브랜드 선택</option>
                        {(productFilterOptions.brands || []).map(
                          (brand: any) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ),
                        )}
                      </select>
                    )}
                  </GridCol>
                  <GridCol span={12}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      공급사
                    </label>
                    <select
                      value={formData.basicInfo.supplierId || ""}
                      onChange={(e) =>
                        updateField("basicInfo.supplierId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">공급사 선택</option>
                      {(productFilterOptions.suppliers || []).map(
                        (supplier: any) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ),
                      )}
                    </select>
                  </GridCol>
                </GridRow>
              </Card>
              <Card>
                <div className="mb-4">
                  <h2 className="text-lg font-bold">가격 정보</h2>
                  <p className="text-sm text-gray-500">
                    판매가, 공급가 등 가격 정보를 입력하세요.
                  </p>
                </div>
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <Input
                      label="원가"
                      type="number"
                      placeholder="원가"
                      value={formData.basicInfo.originalCost || 0}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.originalCost",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="판매가"
                      required
                      type="number"
                      placeholder="판매가"
                      value={formData.basicInfo.pricing.sellingPrice || 0}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.pricing.sellingPrice",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="공급가"
                      type="number"
                      placeholder="공급가"
                      value={formData.basicInfo.pricing.supplyPrice || 0}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.pricing.supplyPrice",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="시장가"
                      type="number"
                      placeholder="시장가"
                      value={formData.basicInfo.pricing.marketPrice || 0}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.pricing.marketPrice",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="소비자가"
                      type="number"
                      placeholder="소비자가"
                      value={formData.basicInfo.pricing.consumerPrice || 0}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.pricing.consumerPrice",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="외화가"
                      type="number"
                      placeholder="외화가"
                      value={
                        formData.basicInfo.pricing.foreignCurrencyPrice || 0
                      }
                      onChange={(e) =>
                        updateField(
                          "basicInfo.pricing.foreignCurrencyPrice",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                </GridRow>
              </Card>
              <Card>
                <div className="mb-4">
                  <h2 className="text-lg font-bold">재고 및 상태</h2>
                  <p className="text-sm text-gray-500">
                    재고, 판매 상태를 관리하세요.
                  </p>
                </div>
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <Input
                      label="재고"
                      type="number"
                      placeholder="재고 수량"
                      value={formData.basicInfo.stock || 0}
                      onChange={(e) =>
                        updateField("basicInfo.stock", Number(e.target.value))
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="안전재고"
                      type="number"
                      placeholder="안전재고"
                      value={formData.basicInfo.safeStock || 0}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.safeStock",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="품절여부"
                      type="checkbox"
                      checked={formData.basicInfo.isOutOfStock || false}
                      onChange={(e) =>
                        updateField("basicInfo.isOutOfStock", e.target.checked)
                      }
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="판매중"
                      type="checkbox"
                      checked={formData.basicInfo.isSelling || false}
                      onChange={(e) =>
                        updateField("basicInfo.isSelling", e.target.checked)
                      }
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="판매종료"
                      type="checkbox"
                      checked={formData.basicInfo.isSoldout || false}
                      onChange={(e) =>
                        updateField("basicInfo.isSoldout", e.target.checked)
                      }
                    />
                  </GridCol>
                </GridRow>
              </Card>
              <Card>
                <div className="mb-4">
                  <h2 className="text-lg font-bold">상세 정보</h2>
                  <p className="text-sm text-gray-500">
                    상품 이미지 및 설명을 입력하세요.
                  </p>
                </div>
                <GridRow gutter={24}>
                  <GridCol span={12}>
                    <Input
                      label="대표 이미지 URL"
                      placeholder="대표 이미지 URL"
                      value={formData.basicInfo.representativeImage || ""}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.representativeImage",
                          e.target.value,
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <Input
                      label="상세 이미지 URL(,로 구분)"
                      placeholder="상세 이미지 URL"
                      value={
                        formData.basicInfo.descriptionImages?.join(",") || ""
                      }
                      onChange={(e) =>
                        updateField(
                          "basicInfo.descriptionImages",
                          e.target.value.split(","),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <Input
                      label="상품 설명"
                      placeholder="상품 설명"
                      value={formData.basicInfo.description || ""}
                      onChange={(e) =>
                        updateField("basicInfo.description", e.target.value)
                      }
                      fullWidth
                    />
                  </GridCol>
                </GridRow>
              </Card>
              <Card>
                <div className="mb-4">
                  <h2 className="text-lg font-bold">물리적 정보</h2>
                  <p className="text-sm text-gray-500">
                    상품의 크기, 무게, 부피 정보를 입력하세요.
                  </p>
                </div>
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <Input
                      label="가로(cm)"
                      type="number"
                      placeholder="가로"
                      value={formData.basicInfo.logistics.width || 0}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.logistics.width",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="세로(cm)"
                      type="number"
                      placeholder="세로"
                      value={formData.basicInfo.logistics.height || 0}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.logistics.height",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="높이(cm)"
                      type="number"
                      placeholder="높이"
                      value={formData.basicInfo.logistics.depth || 0}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.logistics.depth",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="무게(g)"
                      type="number"
                      placeholder="무게"
                      value={formData.basicInfo.logistics.weight || 0}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.logistics.weight",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="부피(cm³)"
                      type="number"
                      placeholder="부피"
                      value={formData.basicInfo.logistics.volume || 0}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.logistics.volume",
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                </GridRow>
              </Card>
              <Card>
                <div className="mb-4">
                  <h2 className="text-lg font-bold">기타 정보</h2>
                  <p className="text-sm text-gray-500">
                    HS코드, 원산지, 면세여부 등 기타 정보를 입력하세요.
                  </p>
                </div>
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <Input
                      label="HS 코드"
                      placeholder="HS 코드"
                      value={formData.basicInfo.hsCode || ""}
                      onChange={(e) =>
                        updateField("basicInfo.hsCode", e.target.value)
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="원산지"
                      placeholder="원산지"
                      value={formData.basicInfo.origin || ""}
                      onChange={(e) =>
                        updateField("basicInfo.origin", e.target.value)
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="면세여부"
                      type="checkbox"
                      checked={formData.basicInfo.isTaxExempt || false}
                      onChange={(e) =>
                        updateField("basicInfo.isTaxExempt", e.target.checked)
                      }
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="송장에 상품명 표시"
                      type="checkbox"
                      checked={
                        formData.basicInfo.policies.showProductNameOnInvoice ||
                        false
                      }
                      onChange={(e) =>
                        updateField(
                          "basicInfo.policies.showProductNameOnInvoice",
                          e.target.checked,
                        )
                      }
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="상품 디자이너"
                      placeholder="상품 디자이너"
                      value={formData.additionalInfo.productDesigner || ""}
                      onChange={(e) =>
                        updateField(
                          "additionalInfo.productDesigner",
                          e.target.value,
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="상품 등록자"
                      placeholder="상품 등록자"
                      value={formData.additionalInfo.productRegistrant || ""}
                      onChange={(e) =>
                        updateField(
                          "additionalInfo.productRegistrant",
                          e.target.value,
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="연도"
                      placeholder="연도"
                      value={formData.additionalInfo.productYear || ""}
                      onChange={(e) =>
                        updateField(
                          "additionalInfo.productYear",
                          e.target.value,
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="시즌"
                      placeholder="시즌"
                      value={formData.additionalInfo.productSeason || ""}
                      onChange={(e) =>
                        updateField(
                          "additionalInfo.productSeason",
                          e.target.value,
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                </GridRow>
              </Card>
              <Card>
                <div className="mb-4">
                  <h2 className="text-lg font-bold">외부 연동 정보</h2>
                  <p className="text-sm text-gray-500">
                    외부 상품ID, URL 등 연동 정보를 입력하세요.
                  </p>
                </div>
                <GridRow gutter={24}>
                  <GridCol span={12}>
                    <Input
                      label="외부 상품ID"
                      placeholder="외부 상품ID"
                      value={formData.basicInfo.externalProductId || ""}
                      onChange={(e) =>
                        updateField(
                          "basicInfo.externalProductId",
                          e.target.value,
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <Input
                      label="외부 상품URL"
                      placeholder="외부 상품URL"
                      value={formData.basicInfo.externalUrl || ""}
                      onChange={(e) =>
                        updateField("basicInfo.externalUrl", e.target.value)
                      }
                      fullWidth
                    />
                  </GridCol>
                </GridRow>
              </Card>
              <Card>
                <div className="mb-4">
                  <h2 className="text-lg font-bold">활성화 여부</h2>
                  <p className="text-sm text-gray-500">
                    상품 활성화 상태를 설정하세요.
                  </p>
                </div>
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <Input
                      label="활성화"
                      type="checkbox"
                      checked={formData.basicInfo.active !== false}
                      onChange={(e) =>
                        updateField("basicInfo.active", e.target.checked)
                      }
                    />
                  </GridCol>
                </GridRow>
              </Card>
              <div className="sticky bottom-0 bg-white py-4 flex justify-end border-t z-10">
                <Stack direction="row" gap={3}>
                  <Button
                    variant="outline"
                    onClick={() => onNavigate?.("products-list")}
                  >
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    loading={saving}
                    onClick={handleSave}
                  >
                    {saving ? "저장중..." : "물품등록"}
                  </Button>
                  <Button
                    variant="outline"
                    loading={saving}
                    onClick={handleSaveAndContinue}
                  >
                    {saving ? "처리중..." : "등록후계속"}
                  </Button>
                </Stack>
              </div>
            </form>
            {/* 사이드 패널 영역 */}
            <aside className="w-full md:w-80 flex-shrink-0">
              <Card className="mb-6">
                <h2 className="text-lg font-bold mb-2">상품 미리보기</h2>
                <div className="flex flex-col items-center gap-2">
                  {formData.basicInfo.representativeImage ? (
                    <img
                      src={formData.basicInfo.representativeImage}
                      alt="상품 이미지"
                      className="w-32 h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded text-gray-400">
                      이미지 없음
                    </div>
                  )}
                  <div className="text-base font-semibold mt-2">
                    {formData.basicInfo.productName || "상품명 미입력"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.basicInfo.codes.internal || "상품코드 미입력"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.basicInfo.categoryId || "카테고리 미입력"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.basicInfo.brandId || "브랜드 미입력"}
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="text-lg font-bold mb-2">상품 요약</h2>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    판매가:{" "}
                    <span className="font-semibold">
                      {formData.basicInfo.pricing.sellingPrice
                        ? `${formData.basicInfo.pricing.sellingPrice.toLocaleString()}원`
                        : "-"}
                    </span>
                  </li>
                  <li>
                    재고:{" "}
                    <span className="font-semibold">
                      {formData.basicInfo.stock ?? "-"}
                    </span>
                  </li>
                  <li>
                    상태:{" "}
                    <span className="font-semibold">
                      {formData.basicInfo.isSelling ? "판매중" : "판매중지"}
                    </span>
                  </li>
                  <li>
                    활성화:{" "}
                    <span className="font-semibold">
                      {formData.basicInfo.active ? "활성" : "비활성"}
                    </span>
                  </li>
                </ul>
              </Card>
              <Card className="mt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold mb-2">Variants / Options</h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-sm text-blue-600"
                      onClick={addOptionGroup}
                    >
                      + 그룹
                    </button>
                    <button
                      type="button"
                      className="text-sm text-green-600"
                      onClick={saveVariants}
                    >
                      Variants 저장
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  {formData.additionalInfo.options &&
                  formData.additionalInfo.options.length > 0 ? (
                    <div className="space-y-2">
                      {formData.additionalInfo.options.map((opt: any) => (
                        <div
                          key={opt.id}
                          className="border rounded p-2 bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-semibold">
                              {opt.name} ({(opt.values || []).length})
                            </div>
                            <div>
                              <button
                                type="button"
                                className="text-xs text-green-600 mr-2"
                                onClick={() => addOptionValue(opt.id)}
                              >
                                값+
                              </button>
                              <button
                                type="button"
                                className="text-xs text-red-600"
                                onClick={() => removeOptionGroup(opt.id)}
                              >
                                그룹-
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            {(opt.values || []).map((v: any) => (
                              <div
                                key={v.id}
                                className="p-1 bg-white rounded flex gap-2 items-center"
                              >
                                <input
                                  className="px-2 py-1 border rounded w-28"
                                  value={v.value}
                                  onChange={(e) =>
                                    updateOptionValue(opt.id, v.id, {
                                      value: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  className="px-2 py-1 border rounded w-20"
                                  type="number"
                                  value={v.additionalPrice ?? 0}
                                  onChange={(e) =>
                                    updateOptionValue(opt.id, v.id, {
                                      additionalPrice: Number(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  className="px-2 py-1 border rounded w-20"
                                  type="number"
                                  value={v.stock ?? 0}
                                  onChange={(e) =>
                                    updateOptionValue(opt.id, v.id, {
                                      stock: Number(e.target.value),
                                    })
                                  }
                                />
                                <button
                                  className="text-sm text-red-600"
                                  onClick={() =>
                                    removeOptionValue(opt.id, v.id)
                                  }
                                >
                                  삭제
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">Variants 없음</div>
                  )}
                </div>
              </Card>
              <Card className="mt-4">
                <h2 className="text-lg font-bold mb-2">External Mall Info</h2>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    External SKU: {formData.basicInfo.externalProductId || "-"}
                  </div>
                  <div>
                    External URL:{" "}
                    {formData.basicInfo.externalUrl ? (
                      <a
                        className="text-blue-600"
                        href={formData.basicInfo.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        링크
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div>
                    Channels: {(formData.basicInfo.codes.channels || []).length}
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </Container>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
};

export default ProductsAddPage;
