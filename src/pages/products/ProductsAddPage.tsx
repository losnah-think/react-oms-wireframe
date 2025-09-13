import React, { useState, useEffect } from "react";
import { mockBrands } from "../../data/mockBrands";
import { mockCategories } from "../../data/mockCategories";
import { mockProductFilterOptions } from "../../data/mockProductFilters";
import {
  Button,
  Input,
  Card,
  Container,
  Stack,
  GridRow,
  GridCol,
} from "../../design-system";
import type { ProductFormData } from "../../types/multitenant";

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

  // 기존 상품 데이터 로딩 (수정 모드)
  useEffect(() => {
    if (productId) {
      // 실제 API 대신 mock 데이터 사용
      const mockProduct: ProductFormData = {
        basicInfo: {
          productName: "기존 상품명",
          englishProductName: "Existing Product",
          productCode: "PRD000001",
          productCategory: "의류",
          brandId: "brand-1",
          supplierId: "supplier-1",
          codes: { internal: "PRD000001", cafe24: "C24000001", channels: [] },
          categoryId: "cat-1",
          pricing: {
            sellingPrice: 29900,
            consumerPrice: 39900,
            supplyPrice: 25410,
            commissionRate: 15,
            isSupplyPriceCalculated: true,
            calculationMethod: "commission",
          },
          originalCost: 20000,
          representativeSellingPrice: 29900,
          representativeSupplyPrice: 25410,
          marketPrice: 35000,
          consumerPrice: 39900,
          foreignCurrencyPrice: 25,
          stock: 100,
          safeStock: 10,
          isOutOfStock: false,
          isSelling: true,
          isSoldout: false,
          description: "기존 상품 설명",
          representativeImage: "",
          descriptionImages: [],
          thumbnailUrl: "",
          images: [],
          width: 20,
          height: 15,
          depth: 5,
          weight: 300,
          volume: 1500,
          hsCode: "123456",
          origin: "KR",
          isTaxExempt: false,
          showProductNameOnInvoice: true,
          productDesigner: "홍길동",
          productRegistrant: "관리자",
          productYear: "2025",
          productSeason: "FW",
          externalProductId: "EXT-001",
          externalUrl: "https://example.com/product/EXT-001",
          active: true,
          tags: [{ id: "tag-1", name: "신상품", category: "general" }],
          logistics: {
            width: 20,
            height: 15,
            depth: 5,
            weight: 300,
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
          productDesigner: "홍길동",
          publishDate: new Date("2025-09-01"),
          detailedLogistics: {
            width: 20,
            height: 15,
            depth: 5,
            weight: 300,
            packagingUnit: "ea",
            packagingQuantity: 1,
            isFragile: false,
            isLiquid: false,
            packageWidth: undefined,
            packageHeight: undefined,
            packageDepth: undefined,
            packageWeight: undefined,
            countryOfOrigin: "KR",
            hsCode: "123456",
            storageConditions: "",
            shelfLife: undefined,
          },
        },
        validation: {
          errors: {},
          warnings: {},
          isValid: true,
          touchedFields: new Set(),
        },
      };
      setFormData(mockProduct);
    }
  }, [productId]);

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

  return (
    <Container maxWidth="full" className="py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">상품 등록</h1>
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
                    카테고리
                  </label>
                  <select
                    value={formData.basicInfo.categoryId}
                    onChange={(e) =>
                      updateField("basicInfo.categoryId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">카테고리 선택</option>
                    {mockCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </GridCol>
                <GridCol span={12}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    브랜드
                  </label>
                  <select
                    value={formData.basicInfo.brandId || ""}
                    onChange={(e) =>
                      updateField("basicInfo.brandId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">브랜드 선택</option>
                    {mockBrands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
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
                    {mockProductFilterOptions.suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
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
                    value={formData.basicInfo.pricing.foreignCurrencyPrice || 0}
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
                      updateField("basicInfo.safeStock", Number(e.target.value))
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
                      updateField("additionalInfo.productYear", e.target.value)
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
                      updateField("basicInfo.externalProductId", e.target.value)
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
                <Button variant="primary" loading={saving} onClick={handleSave}>
                  {saving ? "저장중..." : "상품 등록"}
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
          </aside>
        </div>
      </div>
    </Container>
  );
};

export default ProductsAddPage;
