import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Stack,
  GridRow,
  GridCol,
} from "../../design-system";
import { normalizeProductGroup } from '../../utils/groupUtils'
import Toast from '../../components/Toast'

interface ProductsEditPageProps {
  onNavigate?: (page: string) => void;
  productId?: string;
}

interface Product {
  id: string;
  optionName: string;
  optionCode: string;
  barcodeNumber: string;
  sellingPrice: number;
  color: string;
  size: string;
  isForSale: boolean;
  isOutOfStock: boolean;
  inventorySync: boolean;
}

// 모달 컴포넌트들
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
}

const ProductsEditPage: React.FC<ProductsEditPageProps> = ({
  onNavigate,
  productId,
}) => {
  // State for form data and collapsed sections
  const [formData, setFormData] = useState<any>({
    basicInfo: {},
    additionalInfo: {},
  });
  const [collapsedSections, setCollapsedSections] = useState<{
    [k: string]: boolean;
  }>({ additionalInfo: true, logistics: true, policies: true });
  const [productFilterOptions, setProductFilterOptions] = useState<any>({ brands: [], categories: [] });
  const [groupsData, setGroupsData] = useState<any[]>([])
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [examples, setExamples] = useState<any[]>([])
  const [loadingExampleId, setLoadingExampleId] = useState<string | number | null>(null)
  // Field update function

  // Map mock product to the formData shape used by this page
  const mapMockToForm = (p: any) => {
    const basic = {
      id: p.id,
      createdBy: p.registrant || 'api',
      createdAt: p.created_at ? new Date(p.created_at) : new Date(),
      modifiedBy: p.registrant || 'api',
      modifiedAt: p.created_at ? new Date(p.created_at) : new Date(),
      productName: p.name || '',
      englishProductName: p.name_en || '',
      productCode: p.code || '',
      categoryId: p.classification_id || p.classification || '',
      brandId: p.brand || p.brandId || '',
      supplierId: p.supplier || p.supplier_name || '',
      active: true,
      isSelling: p.is_soldout ? false : (p.is_selling !== undefined ? p.is_selling : true),
      isOutOfStock: !!p.is_soldout,
      pricing: {
        sellingPrice: p.selling_price ?? p.sellingPrice ?? null,
        consumerPrice: p.market_price ?? p.consumer_price ?? null,
        supplyPrice: p.supply_price ?? p.supplyPrice ?? null,
        commissionRate: p.brand_commission_rate ?? 0,
      },
      thumbnailUrl: p.main_image || p.thumbnail || '',
      description: p.description || p.product_description || '',
      stock: (Array.isArray(p.variants) ? p.variants.reduce((s: number, v: any) => s + (v.stock || 0), 0) : p.stock) || 0,
      pricingRaw: p,
    }

    const memos = [] as string[]
    for (let i = 1; i <= 15; i++) {
      const key = `memo${i}`
      memos.push(p[key] || '')
    }

    const options = [] as any[]
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      options.push({ id: 'imported-options', name: '기본옵션', values: p.variants.map((v: any) => ({
        id: v.id || `val-${Math.random().toString(36).slice(2,8)}`,
        sku: v.sku || v.option_code || v.optionCode || '',
        value: v.option_name || v.name || `${v.color || ''} ${v.size || ''}`.trim(),
        barcodeNumber: v.barcode || v.barcodeNumber || '',
        additionalPrice: 0,
        stock: v.stock ?? 0,
        isActive: v.is_selling !== undefined ? v.is_selling : true,
      })) })
    }

    return {
      basicInfo: basic,
      additionalInfo: {
        productDesigner: p.designer || '',
        publishDate: p.publish_date ? new Date(p.publish_date) : undefined,
        productSeason: p.product_season || p.productSeason || '',
        detailedLogistics: {
          packageWidth: p.dimensions?.width_cm || p.dimensions?.width || 0,
          packageHeight: p.dimensions?.height_cm || p.dimensions?.height || 0,
          packageDepth: p.dimensions?.depth_cm || p.dimensions?.depth || 0,
          packageWeight: p.weight_g || p.weight || 0,
          countryOfOrigin: p.origin || p.origin_code || p.manufacture_country || '',
          hsCode: p.hs_code || p.hsCode || '',
          storageConditions: p.storageConditions || '',
          shelfLife: p.shelf_life || p.shelfLife || 0,
        },
        memos,
        options,
      },
      validation: {
        errors: {},
        warnings: {},
        isValid: true,
        touchedFields: new Set(),
      }
    }
  }

  // Load available mock examples for manual selection (three cases)
  useEffect(() => {
    let mounted = true
    fetch('/api/products/mock-details')
      .then((r) => r.json().catch(() => ({ products: [] })))
      .then((data) => {
        if (!mounted) return
        const list = (data && data.products) ? data.products : []
        setExamples(list)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const loadExampleById = (id: string | number) => {
    const p = examples.find((x) => x.id === id)
    if (!p) return
    setLoadingExampleId(id)
    const mapped = mapMockToForm(p)
    setFormData(mapped)
    setLoadingExampleId(null)
    setToastMessage(`${p.name || '예시'} 데이터를 로드했습니다.`)
  }

  // Load product data (mock for now)
  useEffect(() => {
    if (productId) {
      // try to fetch the product from mock-details (by id), else fallback to a minimal default
      fetch('/api/products/mock-details')
        .then((r) => r.json().catch(() => ({ products: [] })))
        .then((data) => {
          const list = (data && data.products) ? data.products : []
          const p = list.find((x: any) => String(x.id) === String(productId)) || list[0]
          if (p) {
            setFormData(mapMockToForm(p))
          } else {
            setFormData({
              basicInfo: {},
              additionalInfo: {},
              validation: { errors: {}, warnings: {}, isValid: true, touchedFields: new Set() }
            })
          }
        })
        .catch(() => {
          setFormData({ basicInfo: {}, additionalInfo: {}, validation: { errors: {}, warnings: {}, isValid: true, touchedFields: new Set() } })
        })
    }
  }, [productId, examples])


  useEffect(() => {
    let mounted = true
    fetch('/api/meta/product-filters')
      .then(res => res.json())
      .then((data) => { if (!mounted) return; setProductFilterOptions(data || { brands: [], categories: [] }) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    fetch('/api/meta/groups')
      .then((r) => r.json().catch(() => ({ groups: [] })))
      .then((data) => { if (!mounted) return; setGroupsData((data && data.groups) ? data.groups : []) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const updateField = (path: string, value: any) => {
    const keys = path.split(".");
    setFormData((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur: any = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        cur = cur[keys[i]] = cur[keys[i]] ?? {};
      }
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // simulate save
      await new Promise((r) => setTimeout(r, 700));
      setToastMessage('수정이 저장되었습니다.');
      onNavigate && onNavigate('products-list');
    } finally {
      setSaving(false);
    }
  }

  const updateCreatedAtToToday = () => {
    const now = new Date();
    updateField('basicInfo.createdAt', now);
    updateField('basicInfo.modifiedAt', now);
  }

  // Option group and option CRUD helpers
  const addOptionGroup = (name?: string) => {
    const group = { id: `g-${Math.random().toString(36).slice(2,8)}`, name: name || '새 옵션 그룹', values: [] }
    setFormData((prev: any) => ({ ...prev, additionalInfo: { ...(prev.additionalInfo || {}), options: [...(prev.additionalInfo?.options || []), group] } }))
  }

  const removeOptionGroup = (gIdx: number) => {
    setFormData((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev))
      copy.additionalInfo.options = (copy.additionalInfo.options || []).filter((_: any, i: number) => i !== gIdx)
      return copy
    })
  }

  const addOptionValue = (gIdx: number, value?: string) => {
    setFormData((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev))
      const group = copy.additionalInfo.options[gIdx] = copy.additionalInfo.options[gIdx] || { id: `g-${gIdx}`, name: `옵션 ${gIdx+1}`, values: [] }
      group.values.push({ id: `v-${Math.random().toString(36).slice(2,8)}`, value: value || '새값', barcodeNumber: '', costPrice: 0, price: 0, stock: 0, isActive: true })
      return copy
    })
  }

  const removeOptionValue = (gIdx: number, vIdx: number) => {
    setFormData((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev))
      const group = copy.additionalInfo.options[gIdx]
      if (!group) return copy
      group.values = (group.values || []).filter((_: any, i: number) => i !== vIdx)
      return copy
    })
  }

  const copyOptionValue = (gIdx: number, vIdx: number) => {
    setFormData((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev))
      const group = copy.additionalInfo.options[gIdx]
      if (!group) return copy
      const v = group.values[vIdx]
      if (!v) return copy
      const nv = JSON.parse(JSON.stringify(v)); nv.id = `v-${Math.random().toString(36).slice(2,8)}`
      group.values.splice(vIdx+1, 0, nv)
      return copy
    })
  }

  return (
    <>
    <Container>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-700">홈 / 상품 / 상품 수정</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded bg-white text-sm" onClick={() => { if (examples[0]) loadExampleById(examples[0].id) }} disabled={!examples[0]}>
            {examples[0] ? (examples[0].name || '예제 1') : '예제1'}
          </button>
          <button className="px-3 py-1 border rounded bg-white text-sm" onClick={() => { if (examples[1]) loadExampleById(examples[1].id) }} disabled={!examples[1]}>
            {examples[1] ? (examples[1].name || '예제 2') : '예제2'}
          </button>
          <button className="px-3 py-1 border rounded bg-white text-sm" onClick={() => { if (examples[2]) loadExampleById(examples[2].id) }} disabled={!examples[2]}>
            {examples[2] ? (examples[2].name || '예제 3') : '예제3'}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          {/* 기본 정보 Card */}
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  <div><strong>등록아이디</strong> {formData.basicInfo?.createdBy || '-'}</div>
                  <div><strong>등록일자</strong> {formData.basicInfo?.createdAt ? new Date(formData.basicInfo.createdAt).toLocaleString() : '-'}</div>
                  <div className="mt-2"><strong>최종수정아이디</strong> {formData.basicInfo?.modifiedBy || '-'}</div>
                  <div><strong>최종수정일자</strong> {formData.basicInfo?.modifiedAt ? new Date(formData.basicInfo.modifiedAt).toLocaleString() : '-'}</div>
                </div>
                <div>
                  <button type="button" className="px-3 py-1 border rounded bg-white text-sm" onClick={updateCreatedAtToToday}>
                    상품등록일자 오늘로 갱신
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <button className="px-3 py-1 border rounded text-sm mr-2" onClick={() => setShowAdvanced((s) => !s)}>{showAdvanced ? '고급항목 숨기기' : '고급항목 표시'}</button>
                </div>
                <div>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={handleSave} disabled={saving}>{saving ? '저장중...' : '저장'}</button>
                </div>
              </div>

              <GridRow gutter={16}>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품명
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo?.productName || ""}
                    onChange={(e) =>
                      updateField("basicInfo.productName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    영문 상품명
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo?.englishProductName || ""}
                    onChange={(e) =>
                      updateField(
                        "basicInfo.englishProductName",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품 코드
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo?.productCode || ""}
                    onChange={(e) =>
                      updateField("basicInfo.productCode", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    그룹(소속)
                  </label>
                  {!showAdvanced ? (
                    <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm">{formData.basicInfo?.categoryId || '미지정'}</div>
                  ) : (
                    <select
                      value={formData.basicInfo?.categoryId || ""}
                      onChange={(e) =>
                        updateField("basicInfo.categoryId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">카테고리 선택</option>
                      {(productFilterOptions.categories || []).map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    브랜드
                  </label>
                  {!showAdvanced ? (
                    <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm">{formData.basicInfo?.brandId || '미지정'}</div>
                  ) : (
                    <select
                      value={formData.basicInfo?.brandId || ""}
                      onChange={(e) =>
                        updateField("basicInfo.brandId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">브랜드 선택</option>
                      {(productFilterOptions.brands || []).map((brand: any) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  )}
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    공급처
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo?.supplierId || ""}
                    onChange={(e) =>
                      updateField("basicInfo.supplierId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    원가 (원)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.basicInfo?.pricing?.costPrice ?? 0}
                    onChange={(e) =>
                      updateField(
                        "basicInfo.pricing.costPrice",
                        Number(Number(e.target.value).toFixed(2)),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    판매가
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.basicInfo?.pricing?.sellingPrice || 0}
                    onChange={(e) =>
                      updateField(
                        "basicInfo.pricing.sellingPrice",
                        Number(Number(e.target.value).toFixed(2)),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    소비자가
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.basicInfo?.pricing?.consumerPrice || 0}
                    onChange={(e) =>
                      updateField(
                        "basicInfo.pricing.consumerPrice",
                        Number(Number(e.target.value).toFixed(2)),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    공급가 (대표공급가)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.basicInfo?.pricing?.supplyPrice || 0}
                    onChange={(e) =>
                      updateField(
                        "basicInfo.pricing.supplyPrice",
                        Number(Number(e.target.value).toFixed(2)),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    마진금액 (자동)
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm">{(() => {
                    const sp = Number(formData.basicInfo?.pricing?.sellingPrice || 0)
                    const cp = Number(formData.basicInfo?.pricing?.costPrice || 0)
                    return (sp - cp).toFixed(2)
                  })()}</div>
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수수료율(%)
                  </label>
                  <input
                    type="number"
                    value={formData.basicInfo?.pricing?.commissionRate || 0}
                    onChange={(e) =>
                      updateField(
                        "basicInfo.pricing.commissionRate",
                        Number(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={12}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품 설명
                  </label>
                  <textarea
                    rows={6}
                    value={formData.basicInfo?.description || ""}
                    onChange={(e) =>
                      updateField("basicInfo.description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대표 이미지 URL
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo?.thumbnailUrl || ""}
                    onChange={(e) =>
                      updateField("basicInfo.thumbnailUrl", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    재고
                  </label>
                  <input
                    type="number"
                    value={formData.basicInfo?.stock || 0}
                    onChange={(e) =>
                      updateField("basicInfo.stock", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    활성화
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.basicInfo?.active || false}
                    onChange={(e) =>
                      updateField("basicInfo.active", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    판매중
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.basicInfo?.isSelling || false}
                    onChange={(e) =>
                      updateField("basicInfo.isSelling", e.target.checked)
                    }
                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    품절
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.basicInfo?.isOutOfStock || false}
                    onChange={(e) =>
                      updateField("basicInfo.isOutOfStock", e.target.checked)
                    }
                    className="h-4 w-4 text-red-600 border-gray-300 rounded"
                  />
                </GridCol>
              </GridRow>
            </div>
          </Card>
          {/* 추가 정보 Card */}
          <Card id="step2" className="mb-6 border-t-4 border-green-500">
            <div className="px-6 py-4 bg-green-50 border-b border-gray-200 rounded-t-lg">
              <Stack direction="row" gap={3} align="center">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div className="flex-1" />
              </Stack>
              <GridRow gutter={16}>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상세 물류 정보(높이)
                  </label>
                  <input
                    type="number"
                    value={
                      formData.additionalInfo?.detailedLogistics
                        ?.packageDepth || 0
                    }
                    onChange={(e) =>
                      updateField(
                        "additionalInfo.detailedLogistics.packageDepth",
                        Number(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상세 물류 정보(무게)
                  </label>
                  <input
                    type="number"
                    value={
                      formData.additionalInfo?.detailedLogistics
                        ?.packageWeight || 0
                    }
                    onChange={(e) =>
                      updateField(
                        "additionalInfo.detailedLogistics.packageWeight",
                        Number(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    원산지
                  </label>
                  <input
                    type="text"
                    value={
                      formData.additionalInfo?.detailedLogistics
                        ?.countryOfOrigin || ""
                    }
                    onChange={(e) =>
                      updateField(
                        "additionalInfo.detailedLogistics.countryOfOrigin",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HS코드
                  </label>
                  <input
                    type="text"
                    value={
                      formData.additionalInfo?.detailedLogistics?.hsCode || ""
                    }
                    onChange={(e) =>
                      updateField(
                        "additionalInfo.detailedLogistics.hsCode",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    보관 조건
                  </label>
                  <input
                    type="text"
                    value={
                      formData.additionalInfo?.detailedLogistics
                        ?.storageConditions || ""
                    }
                    onChange={(e) =>
                      updateField(
                        "additionalInfo.detailedLogistics.storageConditions",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    유통기한(일)
                  </label>
                  <input
                    type="number"
                    value={
                      formData.additionalInfo?.detailedLogistics?.shelfLife || 0
                    }
                    onChange={(e) =>
                      updateField(
                        "additionalInfo.detailedLogistics.shelfLife",
                        Number(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </GridCol>
              </GridRow>
              {/* Option editor table */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">옵션 편집</h3>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 border rounded text-sm" onClick={() => addOptionGroup()}>옵션 그룹 추가</button>
                  </div>
                </div>
                {(formData.additionalInfo?.options || []).map((group: any, gIdx: number) => (
                  <div key={group.id || gIdx} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">옵션 그룹: {group.name || `그룹 ${gIdx + 1}`}</div>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 border rounded text-sm" onClick={() => addOptionValue(gIdx)}>옵션 추가</button>
                        <button className="px-2 py-1 border rounded text-sm" onClick={() => removeOptionGroup(gIdx)}>그룹 삭제</button>
                      </div>
                    </div>
                    <div className="overflow-auto border rounded">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">옵션값</th>
                            <th className="px-3 py-2 text-left">바코드</th>
                            <th className="px-3 py-2 text-left">원가</th>
                            <th className="px-3 py-2 text-left">판매가</th>
                            <th className="px-3 py-2 text-left">마진</th>
                            <th className="px-3 py-2 text-left">재고</th>
                            <th className="px-3 py-2 text-left">판매여부</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(group.values || []).map((v: any, idx: number) => (
                            <tr key={v.id || idx} className="border-t">
                              <td className="px-3 py-2">{v.value}</td>
                              <td className="px-3 py-2"><input className="px-2 py-1 border rounded w-40" value={v.barcodeNumber || ''} onChange={(e) => updateField(`additionalInfo.options.${gIdx}.values.${idx}.barcodeNumber`, e.target.value)} /></td>
                              <td className="px-3 py-2"><input type="number" step="0.01" className="px-2 py-1 border rounded w-28" value={v.costPrice ?? v.cost_price ?? 0} onChange={(e) => updateField(`additionalInfo.options.${gIdx}.values.${idx}.costPrice`, Number(Number(e.target.value).toFixed(2)))} /></td>
                              <td className="px-3 py-2"><input type="number" step="0.01" className="px-2 py-1 border rounded w-28" value={v.price ?? v.sellingPrice ?? 0} onChange={(e) => updateField(`additionalInfo.options.${gIdx}.values.${idx}.price`, Number(Number(e.target.value).toFixed(2)))} /></td>
                              <td className="px-3 py-2">
                                {(() => {
                                  const cp = Number(v.costPrice ?? v.cost_price ?? 0)
                                  const sp = Number(v.price ?? v.sellingPrice ?? 0)
                                  return (sp - cp).toFixed(2)
                                })()}
                              </td>
                              <td className="px-3 py-2"><input type="number" className="px-2 py-1 border rounded w-20" value={v.stock ?? 0} onChange={(e) => updateField(`additionalInfo.options.${gIdx}.values.${idx}.stock`, Number(e.target.value))} /></td>
                              <td className="px-3 py-2 flex items-center gap-2">
                                <input type="checkbox" checked={v.isActive ?? true} onChange={(e) => updateField(`additionalInfo.options.${gIdx}.values.${idx}.isActive`, e.target.checked)} />
                                <button className="px-2 py-1 border rounded text-xs" onClick={() => copyOptionValue(gIdx, idx)}>복사</button>
                                <button className="px-2 py-1 border rounded text-xs" onClick={() => removeOptionValue(gIdx, idx)}>삭제</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Stack direction="row" gap={4} justify="end" className="pt-6">
            <Button
              variant="secondary"
              onClick={() => onNavigate && onNavigate("products-list")}
            >
              취소
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              수정 완료
            </Button>
          </Stack>
        </div>
        <div className="w-96 shrink-0">
          <Card className="mb-6">
            <h2 className="text-lg font-bold mb-2">상품 미리보기</h2>
            <div className="flex flex-col items-center gap-2">
              <img
                src={
                  formData.basicInfo?.thumbnailUrl ||
                  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=128&h=128&fit=crop"
                }
                alt="상품 이미지"
                className="w-32 h-32 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=128&h=128&fit=crop";
                }}
              />
              <div className="text-base font-semibold mt-2">
                {formData.basicInfo?.productName || "상품명 미입력"}
              </div>
              <div className="text-sm text-gray-500">
                {formData.basicInfo?.productCode || "상품코드 미입력"}
              </div>
              <div className="text-sm text-gray-500">
                {formData.basicInfo?.categoryId || "카테고리 미입력"}
              </div>
              <div className="text-sm text-gray-500">
                {formData.basicInfo?.brandId || "브랜드 미입력"}
              </div>
            </div>
          </Card>
          <Card className="mb-6">
            <h2 className="text-lg font-bold mb-2">상품 메모</h2>
            <div>
              <textarea
                rows={6}
                value={(Array.isArray(formData.additionalInfo?.memos) ? formData.additionalInfo.memos.join('\n') : formData.additionalInfo?.memos) || ''}
                onChange={(e) => updateField('additionalInfo.memos', e.target.value.split('\n'))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <div className="text-xs text-gray-500 mt-2">메모는 개행으로 구분됩니다. (기존 15개 메모 필드를 단일 메모 박스로 합쳤습니다)</div>
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-bold mb-2">상품 요약</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                판매가:{" "}
                <span className="font-semibold">
                  {formData.basicInfo?.pricing?.sellingPrice
                    ? `${formData.basicInfo.pricing.sellingPrice.toLocaleString()}원`
                    : "-"}
                </span>
              </li>
              <li>
                재고:{" "}
                <span className="font-semibold">
                  {formData.basicInfo?.stock ?? "-"}
                </span>
              </li>
              <li>
                상태:{" "}
                <span className="font-semibold">
                  {formData.basicInfo?.isSelling ? "판매중" : "판매중지"}
                </span>
              </li>
              <li>
                활성화:{" "}
                <span className="font-semibold">
                  {formData.basicInfo?.active ? "활성" : "비활성"}
                </span>
              </li>
              <li>
                첫 옵션 판매가: {" "}
                <span className="font-semibold">
                  {(() => {
                    // find first active variant across option groups
                    const options = formData.additionalInfo?.options || []
                    let fv: any = null
                    for (let g of options) {
                      if (Array.isArray(g.values) && g.values.length > 0) {
                        const found = g.values.find((v: any) => v.isActive !== false)
                        if (found) { fv = found; break }
                      }
                    }
                    if (!fv) return '-'
                    const base = Number(formData.basicInfo?.pricing?.sellingPrice ?? 0)
                    const add = Number(fv.additionalPrice ?? fv.price ?? fv.sellingPrice ?? 0)
                    const sp = base + add
                    return `${sp.toFixed(2)}원`
                  })()}
                </span>
              </li>
              <li>
                첫 옵션 마진: {" "}
                <span className="font-semibold">
                  {(() => {
                    const options = formData.additionalInfo?.options || []
                    let fv: any = null
                    for (let g of options) {
                      if (Array.isArray(g.values) && g.values.length > 0) {
                        const found = g.values.find((v: any) => v.isActive !== false)
                        if (found) { fv = found; break }
                      }
                    }
                    if (!fv) return '-'
                    const base = Number(formData.basicInfo?.pricing?.sellingPrice ?? 0)
                    const add = Number(fv.additionalPrice ?? fv.price ?? fv.sellingPrice ?? 0)
                    const sp = base + add
                    const cp = Number(fv.costPrice ?? fv.cost_price ?? 0)
                    return `${(sp - cp).toFixed(2)}원`
                  })()}
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Container>
    {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </>
  );
};

export default ProductsEditPage;
