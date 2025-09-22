import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Input,
  Card,
  Container,
  Stack,
  GridRow,
  GridCol,
} from "../../design-system";
import SideGuide from "../../components/SideGuide";
import { mockBrands } from "../../data/mockBrands";
import * as mockSuppliersApi from "../../lib/mockSuppliers";
import type {
  ProductFormData,
  ProductTag,
} from "../../types/multitenant";
import Toast from "../../components/Toast";
import HierarchicalSelect, {
  type TreeNode as CategoryTreeNode,
} from "../../components/common/HierarchicalSelect";

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

const normalizeCategoryTree = (categories: any[]): CategoryTreeNode[] => {
  if (!Array.isArray(categories)) return [];

  const cloneNode = (node: any): CategoryTreeNode => {
    const children = Array.isArray(node.children)
      ? node.children.map((child: any) => cloneNode(child))
      : undefined;
    return {
      id: String(node.id ?? node.value ?? node.key ?? node.name ?? Math.random()),
      name: String(node.name ?? node.label ?? node.title ?? node.id ?? ""),
      children: children && children.length ? children : undefined,
    };
  };

  if (categories.some((cat) => Array.isArray(cat.children) && cat.children.length)) {
    return categories.map((cat) => cloneNode(cat));
  }

  const nodes: Record<string, { node: CategoryTreeNode; parentId: string | null }> = {};
  const roots: CategoryTreeNode[] = [];

  categories.forEach((cat) => {
    const id = String(cat.id ?? cat.value ?? cat.key ?? cat.name ?? Math.random());
    const name = String(cat.name ?? cat.label ?? cat.title ?? cat.id ?? id);
    const parentIdRaw =
      cat.parentId ??
      cat.parent_id ??
      cat.parent ??
      cat.parentID ??
      (Array.isArray(cat.pathIds) && cat.pathIds.length > 1
        ? cat.pathIds[cat.pathIds.length - 2]
        : null);
    const parentId = parentIdRaw != null ? String(parentIdRaw) : null;
    nodes[id] = {
      node: {
        id,
        name,
        children: [],
      },
      parentId,
    };
  });

  Object.entries(nodes).forEach(([id, wrapper]) => {
    const parentId = wrapper.parentId;
    if (parentId && nodes[parentId]) {
      const parent = nodes[parentId].node;
      if (!parent.children) parent.children = [];
      parent.children.push(wrapper.node);
    } else {
      roots.push(wrapper.node);
    }
  });

  const prune = (node: CategoryTreeNode): CategoryTreeNode => ({
    id: node.id,
    name: node.name,
    children:
      node.children && node.children.length
        ? node.children.map(prune)
        : undefined,
  });

  return roots.map(prune);
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
    boxQuantity: 1,
    composition: "",
    classificationPath: [],
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
    options: [
      {
        id: 'opt-default',
        name: '기본옵션',
        type: 'other',
        isRequired: false,
        values: [
          {
            id: 'val-default',
            value: '기본값',
            additionalPrice: 0,
            stock: 0,
            sku: '',
            barcode1: '',
            barcode2: '',
            barcode3: '',
            barcode_new: '',
            cost_price: 0,
            selling_price: 0,
            supply_price: 0,
            margin_amount: 0,
            option_supply_price: 0,
            supplier_name: '',
            purchase_option_name: '',
            management_grade: '',
            note: '',
            automation_flag: false,
            non_display_shipping: false,
            channel_option_code: '',
            per_channel_option_code: '',
            manufacturer: '',
            manufacturer_country: '',
            product_material: '',
            product_type: '',
            caution: '',
            usage_standard: '',
            color: '',
            size: '',
            overseas_price: 0,
            box_quantity: 0,
            safe_stock: 0,
            option_memos: ['', '', '', '', ''],
            width_cm: 0,
            height_cm: 0,
            depth_cm: 0,
            weight_g: 0,
            volume_cc: 0,
            warehouse_location: '',
            is_selling: true,
            is_soldout: false,
            is_stock_linked: true,
            isActive: true,
          },
        ],
      },
    ],
    madeDate: "",
    exprDate: "",
    publicationDate: "",
    firstSaleDate: "",
    externalMallPlatform: "",
    externalMallName: "",
    externalMallSku: "",
  },
  compliance: {
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
    purchaseName: '',
    invoiceDisplayName: true,
    dutyCode: '',
    expectedInboundFlag: false,
  },
  validation: {
    errors: {},
    warnings: {},
    isValid: true,
    touchedFields: new Set(),
  },
  // barcodeSettings moved to central settings page
};
const ProductsAddPage: React.FC<ProductsAddPageProps> = ({
  onNavigate,
  onSave,
  productId,
}) => {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [productFilterOptions, setProductFilterOptions] = useState<any>({
    brands: [],
    categories: [],
    suppliers: [],
    status: [],
  });
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);
  const [expandedOptionValueIds, setExpandedOptionValueIds] = useState<Record<string, boolean>>({});
  const [newTagName, setNewTagName] = useState("");

  const handleAddImageUrl = (url: string) => {
    if (!url) return;
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.basicInfo.images = copy.basicInfo.images || [];
      copy.basicInfo.images.unshift(url);
      if (!copy.basicInfo.representativeImage) copy.basicInfo.representativeImage = url;
      return copy;
    });
  };

  const handleRemoveImage = (idx: number) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.basicInfo.images = copy.basicInfo.images || [];
      const removed = copy.basicInfo.images.splice(idx, 1);
      if (copy.basicInfo.representativeImage && removed[0] === copy.basicInfo.representativeImage) {
        copy.basicInfo.representativeImage = copy.basicInfo.images[0] || '';
      }
      return copy;
    });
  };

  const handleSetRepresentative = (idx: number) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.basicInfo.representativeImage = (copy.basicInfo.images || [])[idx] || '';
      return copy;
    });
  };

  const updateDescriptionImage = (index: number, value: string) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const arr = Array.isArray(copy.basicInfo.descriptionImages)
        ? copy.basicInfo.descriptionImages
        : [];
      while (arr.length < 4) arr.push('');
      arr[index] = value;
      copy.basicInfo.descriptionImages = arr.slice(0, 4);
      return copy;
    });
  };

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

  const handleClassificationPathChange = (value: string) => {
    const parsed = value
      .split(/>|,|\/|\\/)
      .map((part) => part.trim())
      .filter(Boolean);
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.basicInfo.classificationPath = parsed;
      return copy;
    });
  };

  const handleAddTag = () => {
    const label = newTagName.trim();
    if (!label) return;
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const tags: Array<ProductTag | string> = Array.isArray(copy.basicInfo.tags)
        ? copy.basicInfo.tags
        : [];
      const exists = tags.some((tag) =>
        typeof tag === 'string' ? tag === label : tag.name === label,
      );
      if (!exists) {
        const newTag: ProductTag = {
          id: `tag-${Date.now()}`,
          name: label,
          category: 'general',
          createdAt: new Date().toISOString(),
        };
        tags.push(newTag);
      }
      copy.basicInfo.tags = tags;
      return copy;
    });
    setNewTagName("");
  };

  const handleRemoveTag = (key: string) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.basicInfo.tags = (copy.basicInfo.tags || []).filter((tag: ProductTag | string) => {
        if (typeof tag === 'string') {
          return tag !== key;
        }
        return tag.id !== key && tag.name !== key;
      });
      return copy;
    });
  };

  const handleMemoChange = (index: number, value: string) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const memos: string[] = Array.isArray(copy.additionalInfo.memos)
        ? [...copy.additionalInfo.memos]
        : [];
      if (index >= 0 && index < memos.length) {
        memos[index] = value;
      }
      copy.additionalInfo.memos = memos;
      return copy;
    });
  };

  const handleAddMemo = () => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const memos: string[] = Array.isArray(copy.additionalInfo.memos)
        ? [...copy.additionalInfo.memos]
        : [];
      memos.push("");
      copy.additionalInfo.memos = memos;
      return copy;
    });
  };

  const handleRemoveMemo = (index: number) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const memos: string[] = Array.isArray(copy.additionalInfo.memos)
        ? [...copy.additionalInfo.memos]
        : [];
      if (index >= 0 && index < memos.length) {
        memos.splice(index, 1);
      }
      copy.additionalInfo.memos = memos;
      return copy;
    });
  };

  const descriptionImageValues = useMemo(() => {
    const arr = Array.isArray(formData.basicInfo.descriptionImages)
      ? [...formData.basicInfo.descriptionImages]
      : [];
    while (arr.length < 4) arr.push('');
    return arr.slice(0, 4);
  }, [formData.basicInfo.descriptionImages]);

  const categoryTree = useMemo(
    () => normalizeCategoryTree(productFilterOptions.categories || []),
    [productFilterOptions.categories],
  );

  const categoryPathMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const traverse = (nodes: CategoryTreeNode[], parents: string[] = []) => {
      nodes.forEach((node) => {
        const currentPath = [...parents, node.name];
        map.set(node.id, currentPath);
        if (node.children && node.children.length) {
          traverse(node.children, currentPath);
        }
      });
    };
    traverse(categoryTree);
    return map;
  }, [categoryTree]);

  const selectedCategoryPathValue = useMemo(() => {
    const currentPath = formData.basicInfo.classificationPath || [];
    if (Array.isArray(currentPath) && currentPath.length) {
      return currentPath.join(' > ');
    }
    const fallback = categoryPathMap.get(formData.basicInfo.categoryId || '');
    return fallback ? fallback.join(' > ') : '';
  }, [formData.basicInfo.classificationPath, formData.basicInfo.categoryId, categoryPathMap]);

  const handleCategorySelect = (node: CategoryTreeNode | null, path: string[] = []) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.basicInfo.categoryId = node?.id || '';
      copy.basicInfo.productCategory = path[path.length - 1] || '';
      copy.basicInfo.classificationPath = path;
      return copy;
    });
  };

  const productMarginAmount = useMemo(() => {
    const selling = Number(
      formData.basicInfo.representativeSellingPrice ||
        formData.basicInfo.pricing?.sellingPrice ||
        0,
    );
    const supply = Number(
      formData.basicInfo.representativeSupplyPrice ||
        formData.basicInfo.pricing?.supplyPrice ||
        0,
    );
    const margin = selling - supply;
    if (!Number.isFinite(margin)) return 0;
    return Number(margin.toFixed(2));
  }, [
    formData.basicInfo.representativeSellingPrice,
    formData.basicInfo.pricing?.sellingPrice,
    formData.basicInfo.representativeSupplyPrice,
    formData.basicInfo.pricing?.supplyPrice,
  ]);

  useEffect(() => {
    if (!formData.basicInfo.categoryId) return;
    if (Array.isArray(formData.basicInfo.classificationPath) && formData.basicInfo.classificationPath.length) return;
    const autoPath = categoryPathMap.get(formData.basicInfo.categoryId);
    if (!autoPath || !autoPath.length) return;
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.basicInfo.classificationPath = autoPath;
      copy.basicInfo.productCategory = autoPath[autoPath.length - 1] || '';
      return copy;
    });
  }, [formData.basicInfo.categoryId, formData.basicInfo.classificationPath, categoryPathMap]);

  useEffect(() => {
    setFormData((prev) => {
      if (prev.compliance.marginAmount === productMarginAmount) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      copy.compliance.marginAmount = productMarginAmount;
      return copy;
    });
  }, [productMarginAmount]);

  useEffect(() => {
    setFormData((prev) => {
      const current = Number(prev.basicInfo.pricing?.commissionRate ?? 0);
      if (prev.compliance.brandCommissionRate === current) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      copy.compliance.brandCommissionRate = current;
      return copy;
    });
  }, [formData.basicInfo.pricing?.commissionRate]);

  useEffect(() => {
    setFormData((prev) => {
      const current = !!prev.basicInfo.policies.showProductNameOnInvoice;
      if (prev.compliance.invoiceDisplayName === current) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      copy.compliance.invoiceDisplayName = current;
      return copy;
    });
  }, [formData.basicInfo.policies.showProductNameOnInvoice]);

  // variants / options helpers
  const addOptionGroup = () => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.additionalInfo.options = copy.additionalInfo.options || [];
      copy.additionalInfo.options.push({
        id: `opt-${Date.now()}`,
        name: "",
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
        sku: '',
        barcode1: '',
        barcode2: '',
        barcode3: '',
        cost_price: 0,
        selling_price: 0,
        supply_price: 0,
        width_cm: 0,
        height_cm: 0,
        depth_cm: 0,
        weight_g: 0,
        volume_cc: 0,
        warehouse_location: '',
        is_selling: true,
        is_soldout: false,
        is_stock_linked: true,
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

  // Force-sync selects with in-repo mock data for predictable dev behavior
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await mockSuppliersApi.listSuppliers();
        const suppliers = (res && res.items) ? res.items : [];
        if (!mounted) return;
        setProductFilterOptions((prev: any) => ({
          ...(prev || {}),
          brands: mockBrands || [],
          suppliers: suppliers || [],
        }));
      } catch (e) {
        if (!mounted) return;
        setProductFilterOptions((prev: any) => ({
          ...(prev || {}),
          brands: mockBrands || [],
        }));
      }
    })();
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

  const togglePanel = (panelId: string) => {
    setExpandedPanels((prev) =>
      prev.includes(panelId)
        ? prev.filter((id) => id !== panelId)
        : [...prev, panelId],
    );
  };


  const handleSave = async () => {
    setSaving(true);
    if (
      !formData.basicInfo.productName ||
      !formData.basicInfo.codes.internal ||
      !formData.basicInfo.categoryId ||
      !formData.basicInfo.brandId ||
      !formData.basicInfo.representativeImage ||
      Number(
        formData.basicInfo.representativeSellingPrice ||
          formData.basicInfo.pricing.sellingPrice ||
          0,
      ) <= 0 ||
      Number(
        formData.basicInfo.representativeSupplyPrice ||
          formData.basicInfo.pricing.supplyPrice ||
          0,
      ) <= 0
    ) {
      alert("필수 항목을 입력하세요.");
      setSaving(false);
      return;
    }
    try {
      const payload = mapFormToMockProduct(formData);
      const res = await fetch('/api/mock/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('API 응답 실패');
      const body = await res.json();
      setToastMessage('상품이 등록되었습니다.');
      onSave?.(formData);
      onNavigate?.('products-list');
    } catch (err: any) {
      console.error('상품 등록 실패', err);
      alert('상품 등록 실패: ' + (err?.message || String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      // basic validation
      if (
        !formData.basicInfo.productName ||
        !formData.basicInfo.codes.internal ||
        !formData.basicInfo.representativeImage ||
        Number(
          formData.basicInfo.representativeSellingPrice ||
            formData.basicInfo.pricing.sellingPrice ||
            0,
        ) <= 0 ||
        Number(
          formData.basicInfo.representativeSupplyPrice ||
            formData.basicInfo.pricing.supplyPrice ||
            0,
        ) <= 0
      ) {
        setToastMessage("필수 항목을 입력하세요.");
        setSaving(false);
        return;
      }
      // persist to mockProducts API so the demo list picks it up
      const payload = mapFormToMockProduct(formData);
      const res = await fetch('/api/mock/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('API 응답 실패');
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
        // barcodeSettings moved to central settings page; nothing to preserve here
        return preserved;
      });
    } finally {
      setSaving(false);
    }
  };

  // Map the form data shape to the demo `mockProducts` product shape
  const mapFormToMockProduct = (fd: any) => {
    const now = new Date().toISOString();
    const brandObj = (productFilterOptions.brands || []).find(
      (b: any) => String(b.id) === String(fd.basicInfo.brandId),
    );

    const descriptionImages = Array.isArray(fd.basicInfo.descriptionImages)
      ? fd.basicInfo.descriptionImages.filter(Boolean).slice(0, 4)
      : [];
    const images: string[] = [];
    if (fd.basicInfo.representativeImage)
      images.push(fd.basicInfo.representativeImage);
    if (Array.isArray(fd.basicInfo.images))
      images.push(...fd.basicInfo.images.filter(Boolean));
    if (descriptionImages.length) images.push(...descriptionImages);

    const logistics = fd.basicInfo.logistics || {};
    const classificationPath = Array.isArray(fd.basicInfo.classificationPath)
      ? fd.basicInfo.classificationPath
      : fd.basicInfo.productCategory
        ? [fd.basicInfo.productCategory]
        : [];
    const primaryClassification =
      classificationPath[classificationPath.length - 1] ||
      fd.basicInfo.productCategory ||
      '기타';

    const tags = (fd.basicInfo.tags || [])
      .map((tag: ProductTag | string) =>
        typeof tag === 'string' ? tag : tag?.name,
      )
      .filter(Boolean);

    const memos = (fd.additionalInfo?.memos || [])
      .map((memo: string) => (memo || '').trim())
      .filter(Boolean);

    const packagingQuantity =
      fd.basicInfo.boxQuantity ??
      fd.basicInfo.logistics?.packagingQuantity ??
      1;

    const toIsoDateTime = (value?: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return undefined;
      return date.toISOString();
    };

    const dateOnly = (value?: string) => {
      if (!value) return undefined;
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return undefined;
      return date.toISOString().split('T')[0];
    };

    const externalMallPlatform =
      fd.additionalInfo?.externalMallPlatform ||
      (fd.basicInfo.externalUrl ? 'manual' : undefined);
    const externalMallName =
      fd.additionalInfo?.externalMallName ||
      fd.basicInfo.externalUrl ||
      undefined;
    const externalMallSku =
      fd.additionalInfo?.externalMallSku ||
      fd.basicInfo.externalProductId ||
      undefined;

    const timestamp = Date.now();
    const variants = Array.isArray(fd.additionalInfo?.options)
      ? fd.additionalInfo.options.flatMap((group: any, gi: number) =>
          (group.values || []).map((value: any, vi: number) => {
            const baseCode = fd.basicInfo.codes?.internal || 'VAR';
            const fallbackVolume =
              (logistics.width || 0) *
              (logistics.height || 0) *
              (logistics.depth || 0);
            const optionSupply = Number(
              value.option_supply_price ??
                value.supply_price ??
                value.cost_price ??
                0,
            );
            const optionMargin = Number(value.selling_price || 0) - optionSupply;
            const optionMemos = Array.isArray(value.option_memos)
              ? value.option_memos.filter(Boolean)
              : [];
            return {
              id: undefined,
              product_id: undefined,
              variant_name: `${group.name || '옵션'}:${value.value}`,
              stock: value.stock ?? 0,
              cost_price: value.cost_price ?? value.costPrice ?? 0,
              selling_price:
                value.selling_price ??
                value.sellingPrice ??
                value.price ??
                value.additionalPrice ??
                0,
              supply_price: optionSupply,
              margin_amount: Number(
                Number.isFinite(optionMargin)
                  ? optionMargin.toFixed(2)
                  : '0',
              ),
              code:
                value.sku ||
                value.code ||
                `${baseCode}-${timestamp}-${gi}-${vi}`,
              barcode1: value.barcode1 || value.barcode || undefined,
              barcode2: value.barcode2 || undefined,
              barcode3: value.barcode3 || undefined,
              barcode_new: value.barcode_new || undefined,
              is_selling:
                typeof value.is_selling !== 'undefined'
                  ? value.is_selling
                  : typeof value.isSelling !== 'undefined'
                    ? value.isSelling
                    : true,
              is_soldout: value.is_soldout ?? value.isSoldout ?? false,
              is_stock_linked:
                typeof value.is_stock_linked !== 'undefined'
                  ? value.is_stock_linked
                  : typeof value.isStockLinked !== 'undefined'
                    ? value.isStockLinked
                    : true,
              width_cm: value.width_cm ?? value.width ?? logistics.width ?? 0,
              height_cm: value.height_cm ?? value.height ?? logistics.height ?? 0,
              depth_cm: value.depth_cm ?? value.depth ?? logistics.depth ?? 0,
              weight_g: value.weight_g ?? value.weight ?? logistics.weight ?? 0,
              volume_cc:
                value.volume_cc ??
                value.volume ??
                fallbackVolume,
              warehouse_location:
                value.warehouse_location ||
                value.warehouse ||
                `W-${(vi % 3) + 1}`,
              extra_fields: {
                supplier_name: value.supplier_name || undefined,
                purchase_option_name: value.purchase_option_name || undefined,
                safe_stock: value.safe_stock ?? undefined,
                option_supply_price: optionSupply,
                management_grade: value.management_grade || undefined,
                automation_flag: value.automation_flag ?? undefined,
                non_display_shipping: value.non_display_shipping ?? undefined,
                channel_option_code: value.channel_option_code || undefined,
                per_channel_option_code: value.per_channel_option_code || undefined,
                manufacturer: value.manufacturer || undefined,
                manufacturer_country: value.manufacturer_country || undefined,
                product_material: value.product_material || undefined,
                product_type: value.product_type || undefined,
                caution: value.caution || undefined,
                usage_standard: value.usage_standard || undefined,
                color: value.color || undefined,
                size: value.size || undefined,
                overseas_price: value.overseas_price ?? undefined,
                box_quantity: value.box_quantity ?? undefined,
                option_memos: optionMemos.length ? optionMemos : undefined,
                note: value.note || undefined,
              },
              created_at: now,
              updated_at: now,
            };
          }),
        )
      : [];

    const representativeSelling = Number(
      fd.basicInfo.representativeSellingPrice ||
        fd.basicInfo.pricing?.sellingPrice ||
        0,
    );
    const representativeSupply = Number(
      fd.basicInfo.representativeSupplyPrice ||
        fd.basicInfo.pricing?.supplyPrice ||
        0,
    );
    const productMargin = Number(
      Number.isFinite(representativeSelling - representativeSupply)
        ? (representativeSelling - representativeSupply).toFixed(2)
        : '0',
    );

    const complianceExtras = {
      product_serial_number: fd.compliance.productSerialNumber || undefined,
      purchase_product_name: fd.compliance.purchaseProductName || undefined,
      include_in_incoming_list: fd.compliance.includeInIncomingList ?? undefined,
      sales_channel_product_code: fd.compliance.salesChannelProductCode || undefined,
      sales_channel_codes: fd.compliance.salesChannelCodes || undefined,
      knitting_info: fd.compliance.knittingInfo || undefined,
      english_category_name: fd.compliance.englishCategoryName || undefined,
      english_product_category_name:
        fd.compliance.englishProductCategoryName || undefined,
      washing_method: fd.compliance.washingMethod || undefined,
      brand_commission_rate: fd.compliance.brandCommissionRate ?? undefined,
      duty_code: fd.compliance.dutyCode || undefined,
      expected_inbound_flag: fd.compliance.expectedInboundFlag ?? undefined,
      description_images: descriptionImages,
    };

    return {
      code:
        fd.basicInfo.codes?.internal ||
        fd.basicInfo.productCode ||
        fd.basicInfo.productName,
      name: fd.basicInfo.productName,
      english_name: fd.basicInfo.englishProductName || undefined,
      brand: brandObj ? brandObj.name : fd.basicInfo.brandId || undefined,
      brand_id: fd.basicInfo.brandId || undefined,
      classificationPath:
        classificationPath.length > 0 ? classificationPath : ['기타'],
      classification: primaryClassification,
      classificationId: fd.basicInfo.categoryId || undefined,
      selling_price: fd.basicInfo.pricing?.sellingPrice || 0,
      supply_price: fd.basicInfo.pricing?.supplyPrice || 0,
      representative_selling_price: representativeSelling,
      representative_supply_price: representativeSupply,
      margin_amount: productMargin,
      cost_price:
        fd.basicInfo.pricing?.supplyPrice || fd.basicInfo.originalCost || 0,
      hs_code: fd.basicInfo.hsCode || '',
      origin_country:
        fd.basicInfo.origin ||
        fd.additionalInfo?.detailedLogistics?.countryOfOrigin ||
        'KR',
      images,
      description_images: descriptionImages,
      invoice_display_name:
        fd.basicInfo.policies?.showProductNameOnInvoice ?? true,
      retail_price:
        fd.basicInfo.representativeSellingPrice ||
        fd.basicInfo.pricing?.marketPrice ||
        0,
      tags,
      memos,
      box_qty: packagingQuantity,
      composition: fd.basicInfo.composition || '',
      season:
        fd.additionalInfo?.productSeason || fd.basicInfo.productSeason || undefined,
      supplier_id: fd.basicInfo.supplierId || undefined,
      category_id: fd.basicInfo.categoryId || undefined,
      description: fd.basicInfo.description || '',
      width_cm: logistics.width ?? fd.basicInfo.width ?? 0,
      height_cm: logistics.height ?? fd.basicInfo.height ?? 0,
      depth_cm: logistics.depth ?? fd.basicInfo.depth ?? 0,
      weight_g: logistics.weight ?? fd.basicInfo.weight ?? 0,
      volume_cc: logistics.volume ?? fd.basicInfo.volume ?? 0,
      externalMall: {
        platform: externalMallPlatform,
        platformName: externalMallName,
        external_sku: externalMallSku,
      },
      compliance: {
        productSerialNumber: fd.compliance.productSerialNumber || '',
        purchaseProductName: fd.compliance.purchaseProductName || '',
        marginAmount: productMargin,
        includeInIncomingList: !!fd.compliance.includeInIncomingList,
        salesChannelProductCode: fd.compliance.salesChannelProductCode || '',
        salesChannelCodes: fd.compliance.salesChannelCodes || '',
        knittingInfo: fd.compliance.knittingInfo || '',
        englishCategoryName: fd.compliance.englishCategoryName || '',
        washingMethod: fd.compliance.washingMethod || '',
        brandCommissionRate: fd.compliance.brandCommissionRate ?? 0,
        englishProductCategoryName:
          fd.compliance.englishProductCategoryName || '',
        dutyCode: fd.compliance.dutyCode || '',
        expectedInboundFlag: !!fd.compliance.expectedInboundFlag,
        invoiceDisplayName: !!fd.basicInfo.policies?.showProductNameOnInvoice,
      },
      is_dutyfree: fd.basicInfo.isTaxExempt || false,
      created_at: now,
      updated_at: now,
      made_date:
        dateOnly(fd.additionalInfo?.madeDate) ||
        dateOnly(fd.additionalInfo?.manufacture_date) ||
        dateOnly(now),
      expr_date:
        dateOnly(fd.additionalInfo?.exprDate) ||
        dateOnly(fd.additionalInfo?.expiry_date) ||
        dateOnly(now),
      publication_date:
        toIsoDateTime(
          fd.additionalInfo?.publicationDate ||
            (typeof fd.additionalInfo?.publishDate === 'string'
              ? fd.additionalInfo.publishDate
              : undefined),
        ) || now,
      first_sale_date:
        toIsoDateTime(fd.additionalInfo?.firstSaleDate) || now,
      extra_fields: complianceExtras,
      variants,
    };
  };

  const advancedSections: {
    id: string;
    title: string;
    description?: string;
    render: () => React.ReactNode;
  }[] = [
    {
      id: "pricing-advanced",
      title: "추가 가격 설정",
      description: "원가, 시장가, 소비자가 등의 선택 입력값",
      render: () => (
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
      ),
    },
    {
      id: "inventory-advanced",
      title: "재고 · 판매 상태",
      description: "안전재고와 판매 여부를 세부 설정합니다.",
      render: () => (
        <GridRow gutter={24}>
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
                updateField(
                  "basicInfo.isOutOfStock",
                  e.target.checked,
                )
              }
            />
          </GridCol>
          <GridCol span={6}>
            <Input
              label="판매중"
              type="checkbox"
              checked={formData.basicInfo.isSelling || false}
              onChange={(e) =>
                updateField(
                  "basicInfo.isSelling",
                  e.target.checked,
                )
              }
            />
          </GridCol>
          <GridCol span={6}>
            <Input
              label="판매종료"
              type="checkbox"
              checked={formData.basicInfo.isSoldout || false}
              onChange={(e) =>
                updateField(
                  "basicInfo.isSoldout",
                  e.target.checked,
                )
              }
            />
          </GridCol>
        </GridRow>
      ),
    },
    {
      id: "detail-info",
      title: "상세 정보",
      description: "영문명, 이미지, 설명 등 추가 정보를 입력하세요.",
      render: () => (
        <GridRow gutter={24}>
          <GridCol span={12}>
            <Input
              label="영문 상품명"
              placeholder="예: Premium T-shirt"
              value={formData.basicInfo.englishProductName || ""}
              onChange={(e) =>
                updateField("basicInfo.englishProductName", e.target.value)
              }
              fullWidth
            />
          </GridCol>
          <GridCol span={12}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명 이미지 (최대 4개)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {descriptionImageValues.map((img, idx) => (
                <Input
                  key={`desc-img-${idx}`}
                  label={`설명 이미지 ${idx + 1}`}
                  placeholder={`설명 이미지 ${idx + 1} URL`}
                  value={img}
                  onChange={(e) => updateDescriptionImage(idx, e.target.value)}
                  fullWidth
                />
              ))}
            </div>
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
      ),
    },
    {
      id: "physical-info",
      title: "물리적 정보",
      description: "상품의 크기와 무게 정보를 입력하세요.",
      render: () => (
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
      ),
    },
    {
      id: "packaging-info",
      title: "포장 및 구성",
      description: "박스 수량과 포장 정보를 입력하세요.",
      render: () => (
        <GridRow gutter={24}>
          <GridCol span={6}>
            <Input
              label="박스 수량"
              type="number"
              min={0}
              placeholder="포장 단위 수량"
              value={formData.basicInfo.boxQuantity ?? 0}
              onChange={(e) =>
                updateField(
                  "basicInfo.boxQuantity",
                  Number(e.target.value) || 0,
                )
              }
              fullWidth
            />
          </GridCol>
          <GridCol span={6}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              포장 단위
            </label>
            <select
              value={formData.basicInfo.logistics.packagingUnit || 'ea'}
              onChange={(e) =>
                updateField("basicInfo.logistics.packagingUnit", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ea">개당</option>
              <option value="box">박스</option>
              <option value="set">세트</option>
            </select>
          </GridCol>
          <GridCol span={6}>
            <Input
              label="포장 수량"
              type="number"
              min={0}
              placeholder="포장 단위당 수량"
              value={formData.basicInfo.logistics.packagingQuantity || 0}
              onChange={(e) =>
                updateField(
                  "basicInfo.logistics.packagingQuantity",
                  Number(e.target.value) || 0,
                )
              }
              fullWidth
            />
          </GridCol>
          <GridCol span={12}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              혼용률
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[96px]"
              placeholder="예: Cotton 80%, Polyester 20%"
              value={formData.basicInfo.composition || ''}
              onChange={(e) => updateField("basicInfo.composition", e.target.value)}
            />
          </GridCol>
        </GridRow>
      ),
    },
    {
      id: "tags-memos",
      title: "태그 및 메모",
      description: "상품 태그와 메모를 관리하세요.",
      render: () => (
        <div className="space-y-4">
          <div>
            <div className="flex flex-col md:flex-row gap-2">
              <Input
                label="태그 추가"
                placeholder="예: 베스트셀러"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                fullWidth
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTagName.trim()}
              >
                태그 추가
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(formData.basicInfo.tags || []).length === 0 && (
                <span className="text-sm text-gray-400">
                  등록된 태그가 없습니다.
                </span>
              )}
              {(formData.basicInfo.tags || []).map((tag: ProductTag | string) => {
                const tagId = typeof tag === 'string' ? tag : tag.id;
                const tagName = typeof tag === 'string' ? tag : tag.name;
                const key = tagId || tagName;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs text-gray-700"
                  >
                    {tagName}
                    <button
                      type="button"
                      className="ml-2 text-gray-400 hover:text-red-500"
                      onClick={() => handleRemoveTag(tagId || tagName)}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-gray-700">메모</span>
              <button
                type="button"
                className="text-xs text-blue-600"
                onClick={handleAddMemo}
              >
                + 메모 추가
              </button>
            </div>
            <div className="space-y-3">
              {(formData.additionalInfo.memos || []).map((memo: string, index: number) => (
                <div key={`memo-${index}`} className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">
                    메모 {index + 1}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[72px]"
                    placeholder="추가 정보를 입력하세요."
                    value={memo || ''}
                    onChange={(e) => handleMemoChange(index, e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs text-red-600"
                      onClick={() => handleRemoveMemo(index)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "manufacturing-info",
      title: "제조 · 유통 기간",
      description: "제조일, 유통기한 등 상품 일자를 입력하세요.",
      render: () => (
        <GridRow gutter={24}>
          <GridCol span={6}>
            <Input
              label="제조일"
              type="date"
              value={formData.additionalInfo.madeDate || ''}
              onChange={(e) =>
                updateField("additionalInfo.madeDate", e.target.value)
              }
              fullWidth
            />
          </GridCol>
          <GridCol span={6}>
            <Input
              label="유통기한"
              type="date"
              value={formData.additionalInfo.exprDate || ''}
              onChange={(e) =>
                updateField("additionalInfo.exprDate", e.target.value)
              }
              fullWidth
            />
          </GridCol>
          <GridCol span={6}>
            <Input
              label="출시일"
              type="datetime-local"
              value={formData.additionalInfo.publicationDate || ''}
              onChange={(e) =>
                updateField("additionalInfo.publicationDate", e.target.value)
              }
              fullWidth
            />
          </GridCol>
          <GridCol span={6}>
            <Input
              label="첫 판매일"
              type="datetime-local"
              value={formData.additionalInfo.firstSaleDate || ''}
              onChange={(e) =>
                updateField("additionalInfo.firstSaleDate", e.target.value)
              }
              fullWidth
            />
          </GridCol>
        </GridRow>
      ),
    },
    {
      id: "metadata-info",
      title: "기타 정보",
      description: "원산지, HS코드 등 기타 속성을 관리합니다.",
      render: () => (
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
                updateField(
                  "basicInfo.isTaxExempt",
                  e.target.checked,
                )
              }
            />
          </GridCol>
          <GridCol span={6}>
            <Input
              label="송장에 상품명 표시"
              type="checkbox"
              checked={
                formData.basicInfo.policies.showProductNameOnInvoice || false
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
              label="상품 게시일"
              type="date"
              value={formData.additionalInfo.publishDate ? String(formData.additionalInfo.publishDate).slice(0, 10) : ''}
              onChange={(e) => updateField('additionalInfo.publishDate', e.target.value)}
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
      ),
    },
    {
      id: "external-info",
      title: "외부 연동 정보",
      description: "외부 시스템과 연결되는 정보를 입력하세요.",
      render: () => (
        <GridRow gutter={24}>
          <GridCol span={6}>
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
          <GridCol span={6}>
            <Input
              label="외부 SKU"
              placeholder="연동된 외부 SKU"
              value={formData.additionalInfo.externalMallSku || ""}
              onChange={(e) =>
                updateField(
                  "additionalInfo.externalMallSku",
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
          <GridCol span={6}>
            <Input
              label="외부 플랫폼"
              placeholder="예: Cafe24"
              value={formData.additionalInfo.externalMallPlatform || ""}
              onChange={(e) =>
                updateField(
                  "additionalInfo.externalMallPlatform",
                  e.target.value,
                )
              }
              fullWidth
            />
          </GridCol>
          <GridCol span={6}>
            <Input
              label="외부몰 식별값"
              placeholder="예: cafe24_store"
              value={formData.additionalInfo.externalMallName || ""}
              onChange={(e) =>
                updateField(
                  "additionalInfo.externalMallName",
                  e.target.value,
                )
              }
              fullWidth
            />
          </GridCol>
        </GridRow>
      ),
    },
  ];

  return (
    <>
      {/* Help modal/section (opens when isHelpOpen === true) */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="w-full max-w-4xl bg-white border rounded shadow-lg overflow-auto max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">상품 등록 도움말</h3>
              <button
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setIsHelpOpen(false)}
              >
                닫기
              </button>
            </div>
            <div className="p-4 text-sm leading-relaxed">
              <table className="w-full border-collapse">
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
                    <td className="border px-2 py-1 align-top">상품명</td>
                    <td className="border px-2 py-1">- 필수값(미입력 시 업로드 불가)<br/>- 기존 등록 상품과 중복 시 업로드 불가</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">옵션명</td>
                    <td className="border px-2 py-1">- 필수값(미입력 시 업로드 불가)<br/>- 옵션이 없으면 “단일옵션” 입력<br/>- 작성 시 제공된 예시 형식 참고</td>
                  </tr>

                  <tr>
                    <td className="border px-2 py-1 align-top">옵션값</td>
                    <td className="border px-2 py-1">상품코드</td>
                    <td className="border px-2 py-1">- 기존 등록 상품과 중복 시 업로드 불가<br/>- 미입력 시 중복체크 안 함</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">옵션코드</td>
                    <td className="border px-2 py-1">- 기존 등록 옵션과 중복 시 업로드 불가<br/>- 미입력 시 중복체크 안 함</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">바코드번호</td>
                    <td className="border px-2 py-1">- 중복 불가<br/>- 미입력 시 FULGO가 자동 부여</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">사입상품명</td>
                    <td className="border px-2 py-1">- 실제 매입 상품명 입력</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">사입옵션명</td>
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
                    <td className="border px-2 py-1">- 옵션 색상/사이즈 입력 가능<br/>- 미입력 시 공란 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">상품설명</td>
                    <td className="border px-2 py-1">- 상품 설명 입력 가능<br/>- 동일 상품의 옵션별 설명이 다를 경우 최상위 설명이 적용됨</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">영문상품명 / 영문옵션명</td>
                    <td className="border px-2 py-1">- 영어 상품명/옵션명 입력 가능<br/>- 미입력 시 공란 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">HS코드</td>
                    <td className="border px-2 py-1">- 상품 HS Code 입력<br/>- 미입력 시 공란 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">가로 / 세로 / 높이</td>
                    <td className="border px-2 py-1">- cm 단위 숫자 입력<br/>- 옵션 일괄 등록 시 사용</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">무게 / 부피</td>
                    <td className="border px-2 py-1">- g 단위 무게 입력<br/>- 부피 = (가로×세로×높이)/6000<br/>- 소수점 첫째 자리까지 입력 가능</td>
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
                    <td className="border px-2 py-1">- 상품 세탁 방법 입력 가능<br/>- 미입력 시 공란 처리</td>
                  </tr>

                  <tr>
                    <td className="border px-2 py-1 align-top">관리정보</td>
                    <td className="border px-2 py-1">상품 분류</td>
                    <td className="border px-2 py-1">- FULGO 상품분류 관리에 등록된 값 입력<br/>- 미입력 시 기본 분류 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">공급처</td>
                    <td className="border px-2 py-1">- FULGO 공급처 관리 등록명 입력<br/>- 미입력 시 기본 공급처<br/>- 미등록 공급처 입력 시 자동 등록</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">공급처 전화번호 / 위치</td>
                    <td className="border px-2 py-1">- 신규 공급처 등록 시 함께 입력 가능<br/>- 기존 공급처 수정은 공급처 관리에서</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">브랜드</td>
                    <td className="border px-2 py-1">- FULGO 브랜드 관리 등록명 입력<br/>- 미입력 시 “선택안함” 처리<br/>- 미등록 브랜드 입력 시 자동 등록</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">상품연도 / 시즌</td>
                    <td className="border px-2 py-1">- FULGO 상품 연도·시즌 관리 등록 값 입력<br/>- 미입력 시 “선택안함” 처리<br/>- 미등록 값 입력 시 자동 등록</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">상품디자이너 / 상품등록자</td>
                    <td className="border px-2 py-1">- 해당 사용자 아이디 입력<br/>- 미입력 또는 불일치 시 “미선택” 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">관리등급</td>
                    <td className="border px-2 py-1">- 일반 / 우수 / 특별 중 입력<br/>- 미입력 시 “일반” 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">상품위치</td>
                    <td className="border px-2 py-1">- 상품 보관 위치 입력<br/>- 미입력 시 공란 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">입고예정목록반영여부</td>
                    <td className="border px-2 py-1">- “반영” 또는 “미반영” 입력<br/>- 발주 시 입고 예정 목록 반영 여부</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">판매여부</td>
                    <td className="border px-2 py-1">- 판매 중: “판매”<br/>- 판매 중지: “미판매”<br/>- 미입력 시 “판매” 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">품절여부</td>
                    <td className="border px-2 py-1">- 품절: “품절”<br/>- 정상: “미품절”<br/>- 미입력 시 “미품절” 처리</td>
                  </tr>

                  <tr>
                    <td className="border px-2 py-1 align-top">부가정보</td>
                    <td className="border px-2 py-1">원가 / 공급가 / 대표판매가 / 시중가 / 마진금액</td>
                    <td className="border px-2 py-1">- 미입력 시 0 처리<br/>- 숫자가 아닌 경우 자동으로 0 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">현재재고 / 안정재고</td>
                    <td className="border px-2 py-1">- 미입력 시 0 처리<br/>- 숫자가 아닌 경우 자동으로 0 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">상품메모</td>
                    <td className="border px-2 py-1">- 최대 15개 입력 가능 (1~15)<br/>- 미입력 시 공란 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">옵션메모</td>
                    <td className="border px-2 py-1">- 최대 5개 입력 가능 (1~5)<br/>- 미입력 시 공란 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">바코드번호2 / 바코드번호3</td>
                    <td className="border px-2 py-1">- 추가 바코드 입력 가능(중복 불가)<br/>- 미입력 시 공란 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">해외통화상품가 / 해외통화옵션가</td>
                    <td className="border px-2 py-1">- 다중 입력 가능</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">편직정보</td>
                    <td className="border px-2 py-1">- 선택안함 / woven / knit 중 입력<br/>- 미입력 시 “선택안함” 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">상품태그</td>
                    <td className="border px-2 py-1">- 다중 입력 가능, 콤마(,) 구분<br/>- 공백 자동 제거<br/>- 미입력 시 공란 처리</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1" />
                    <td className="border px-2 py-1">소비자가 / 브랜드수수료율</td>
                    <td className="border px-2 py-1">- 미입력 시 0 처리<br/>- 숫자가 아닌 경우 자동 0 처리</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <Container maxWidth="full" className="py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">상품 등록</h1>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                onClick={handleSaveAndContinue}
              >
                저장 후 계속
              </button>
              <button
                aria-label="도움말"
                className="px-3 py-1 border rounded text-sm"
                onClick={() => setIsHelpOpen(true)}
              >
                도움말
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
                    <div className="mb-1">
                      <div className="text-sm font-medium text-gray-700">대표 이미지</div>
                      <p className="text-xs text-gray-500 mt-1">
                        대표 이미지를 추가하려면 URL을 입력하고 Enter 키를 눌러주세요.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="이미지 URL 붙여넣기 후 Enter"
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const v = (e.target as HTMLInputElement).value.trim();
                              handleAddImageUrl(v);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                      <div className="flex gap-2 overflow-x-auto py-2 items-start">
                        {(formData.basicInfo.images || []).map((img, idx) => (
                          <div key={idx} className="relative w-28 h-20 flex-shrink-0">
                            <img src={img} alt={`img-${idx}`} className="w-full h-full object-cover rounded" />
                            <div className="absolute left-1 top-1">
                              <Button size="small" variant={formData.basicInfo.representativeImage === img ? 'primary' : 'outline'} onClick={() => handleSetRepresentative(idx)}>대표</Button>
                            </div>
                            <div className="absolute right-1 top-1">
                              <Button size="small" variant="outline" onClick={() => handleRemoveImage(idx)}>삭제</Button>
                            </div>
                          </div>
                        ))}
                        {(!(formData.basicInfo.images || []).length) && (
                          <div className="text-sm text-gray-400">이미지 없음</div>
                        )}
                      </div>
                    </div>
                  </GridCol>
                  <GridCol span={12}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품 카테고리
                    </label>
                    {categoryTree.length ? (
                      <div className="space-y-2">
                        <HierarchicalSelect
                          data={categoryTree}
                          value={selectedCategoryPathValue || undefined}
                          placeholder="카테고리 선택 (최대 3뎁스)"
                          maxDepth={3}
                          onChange={(node, path) => handleCategorySelect(node, path || [])}
                        />
                        <p className="text-xs text-gray-500">
                          최대 3단계까지 선택할 수 있으며, 경로는 자동으로 저장됩니다.
                        </p>
                      </div>
                    ) : (
                      <select
                        value={formData.basicInfo.categoryId}
                        onChange={(e) => {
                          const value = e.target.value;
                          const list = productFilterOptions.categories || [];
                          const found = list.find((cat: any) => String(cat.id) === String(value));
                          setFormData((prev) => {
                            const copy = JSON.parse(JSON.stringify(prev));
                            copy.basicInfo.categoryId = value;
                            const name = found?.name || '';
                            copy.basicInfo.productCategory = name;
                            copy.basicInfo.classificationPath = name ? [name] : [];
                            return copy;
                          });
                        }}
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
                  <GridCol span={12}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      브랜드
                    </label>
                    <select
                      value={formData.basicInfo.brandId}
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
                  <GridCol span={12}>
                    <Input
                      label="상품 분류"
                      placeholder="예: 의류 > 남성 > 셔츠"
                      helperText="구분자는 '>', ',', '/'를 사용할 수 있습니다."
                      value={(formData.basicInfo.classificationPath || []).join(' > ')}
                      onChange={(e) => handleClassificationPathChange(e.target.value)}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="상품 일련번호"
                      placeholder="예: 1000001"
                      value={formData.compliance.productSerialNumber || ''}
                      onChange={(e) => updateField('compliance.productSerialNumber', e.target.value)}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="사입상품명"
                      placeholder="사입 등록용 이름"
                      value={formData.compliance.purchaseProductName || ''}
                      onChange={(e) => updateField('compliance.purchaseProductName', e.target.value)}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="대표 판매가"
                      type="number"
                      placeholder="대표 판매가"
                      value={formData.basicInfo.representativeSellingPrice || 0}
                      onChange={(e) =>
                        updateField(
                          'basicInfo.representativeSellingPrice',
                          Number(e.target.value || 0),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="대표 공급가"
                      type="number"
                      placeholder="대표 공급가"
                      value={formData.basicInfo.representativeSupplyPrice || 0}
                      onChange={(e) =>
                        updateField(
                          'basicInfo.representativeSupplyPrice',
                          Number(e.target.value || 0),
                        )
                      }
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="마진 금액"
                      type="number"
                      value={productMarginAmount}
                      readOnly
                      disabled
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="판매처 상품코드"
                      placeholder="판매처 공용 코드"
                      value={formData.compliance.salesChannelProductCode || ''}
                      onChange={(e) => updateField('compliance.salesChannelProductCode', e.target.value)}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      판매처별 상품코드
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[72px]"
                      placeholder="채널별 코드를 줄바꿈으로 구분해 입력하세요"
                      value={formData.compliance.salesChannelCodes || ''}
                      onChange={(e) => updateField('compliance.salesChannelCodes', e.target.value)}
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="편직 정보"
                      placeholder="편직/제조 정보"
                      value={formData.compliance.knittingInfo || ''}
                      onChange={(e) => updateField('compliance.knittingInfo', e.target.value)}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="영문 카테고리명"
                      placeholder="예: Outer > Coat"
                      value={formData.compliance.englishCategoryName || ''}
                      onChange={(e) => updateField('compliance.englishCategoryName', e.target.value)}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="세탁방법"
                      placeholder="예: 드라이클리닝 권장"
                      value={formData.compliance.washingMethod || ''}
                      onChange={(e) => updateField('compliance.washingMethod', e.target.value)}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="영문 상품 카테고리명"
                      placeholder="예: Apparel > Tops"
                      value={formData.compliance.englishProductCategoryName || ''}
                      onChange={(e) => updateField('compliance.englishProductCategoryName', e.target.value)}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="면세 코드"
                      placeholder="면세 코드"
                      value={formData.compliance.dutyCode || ''}
                      onChange={(e) => updateField('compliance.dutyCode', e.target.value)}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="브랜드 수수료율 (%)"
                      type="number"
                      value={formData.compliance.brandCommissionRate ?? 0}
                      onChange={(e) => updateField('compliance.brandCommissionRate', Number(e.target.value || 0))}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6} className="flex items-center">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!formData.compliance.includeInIncomingList}
                        onChange={(e) => updateField('compliance.includeInIncomingList', e.target.checked)}
                      />
                      입고예정 목록 반영
                    </label>
                  </GridCol>
                  <GridCol span={6} className="flex items-center">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!formData.compliance.expectedInboundFlag}
                        onChange={(e) => updateField('compliance.expectedInboundFlag', e.target.checked)}
                      />
                      입고예정 자동 반영
                    </label>
                  </GridCol>
                </GridRow>
              </Card>
              <Card>
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
                      {formData.additionalInfo.options.map((opt: any) => {
                        return (
                          <div
                            key={opt.id}
                            className="border rounded p-2 bg-gray-50"
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-semibold">
                                {opt.name && String(opt.name).trim() ? opt.name : '옵션'} ({(opt.values || []).length})
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
                              {(opt.values || []).map((v: any) => {
                                const memoValues = Array.isArray(v.option_memos)
                                  ? [...v.option_memos, '', '', '', '', ''].slice(0, 5)
                                  : ['', '', '', '', ''];
                                const optionMargin = Number(v.selling_price || 0) - Number(v.option_supply_price ?? v.supply_price ?? v.cost_price ?? 0);
                                return (
                                  <div
                                    key={v.id}
                                    className="p-1 bg-white rounded flex gap-2 items-center"
                                  >
                                    <button
                                      type="button"
                                      className="text-xs text-gray-500 mr-2"
                                      onClick={() =>
                                        setExpandedOptionValueIds((s) => ({
                                          ...s,
                                          [v.id]: !s[v.id],
                                        }))
                                      }
                                    >
                                      {expandedOptionValueIds[v.id] ? '접기' : '상세'}
                                    </button>
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
                                          additionalPrice: Number(e.target.value || 0),
                                        })
                                      }
                                    />
                                    <input
                                      className="px-2 py-1 border rounded w-20"
                                      type="number"
                                      value={v.stock ?? 0}
                                      onChange={(e) =>
                                        updateOptionValue(opt.id, v.id, {
                                          stock: Number(e.target.value || 0),
                                        })
                                      }
                                    />
                                    <button
                                      className="text-sm text-red-600"
                                      onClick={() => removeOptionValue(opt.id, v.id)}
                                    >
                                      삭제
                                    </button>
                                    {expandedOptionValueIds[v.id] && (
                                      <div className="mt-2 w-full border-t pt-2">
                                        <div className="text-xs text-gray-500 mb-1">상세 정보</div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                          <div>
                                            <div className="text-xs text-gray-400">SKU (옵션코드)</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="SKU" value={v.sku || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { sku: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">바코드1</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="바코드1" value={v.barcode1 || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { barcode1: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">바코드2</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="바코드2" value={v.barcode2 || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { barcode2: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">바코드3</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="바코드3" value={v.barcode3 || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { barcode3: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">새 바코드</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="새로운 바코드" value={v.barcode_new || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { barcode_new: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">옵션 공급처명</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="옵션 공급처명" value={v.supplier_name || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { supplier_name: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">사입 옵션명</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="사입 옵션명" value={v.purchase_option_name || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { purchase_option_name: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">안정재고</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="안정재고" type="number" value={v.safe_stock || 0} onChange={(e) => updateOptionValue(opt.id, v.id, { safe_stock: Number(e.target.value || 0) })} />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mt-3">
                                          <div>
                                            <div className="text-xs text-gray-400">원가</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="원가" type="number" value={v.cost_price || 0} onChange={(e) => updateOptionValue(opt.id, v.id, { cost_price: Number(e.target.value || 0) })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">판매가</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="판매가" type="number" value={v.selling_price || 0} onChange={(e) => updateOptionValue(opt.id, v.id, { selling_price: Number(e.target.value || 0) })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">옵션 공급가</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="옵션 공급가" type="number" value={v.option_supply_price || v.supply_price || 0} onChange={(e) => updateOptionValue(opt.id, v.id, { option_supply_price: Number(e.target.value || 0), supply_price: Number(e.target.value || 0) })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">마진 금액</div>
                                            <input className="px-2 py-1 border rounded w-full" readOnly disabled value={Number.isFinite(optionMargin) ? optionMargin.toFixed(2) : '0.00'} />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mt-3">
                                          <div>
                                            <div className="text-xs text-gray-400">판매처 옵션코드</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="판매처 옵션코드" value={v.channel_option_code || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { channel_option_code: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">판매처별 옵션코드</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="판매처별 옵션코드" value={v.per_channel_option_code || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { per_channel_option_code: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">제조원</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="제조원" value={v.manufacturer || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { manufacturer: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">제조국</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="제조국" value={v.manufacturer_country || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { manufacturer_country: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">제품 소재</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="제품 소재" value={v.product_material || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { product_material: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">제품 유형</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="제품 유형" value={v.product_type || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { product_type: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">주의사항</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="주의사항" value={v.caution || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { caution: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">사용기준</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="사용기준" value={v.usage_standard || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { usage_standard: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">색상</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="색상" value={v.color || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { color: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">사이즈</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="사이즈" value={v.size || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { size: e.target.value })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">해외통화 옵션가</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="해외통화 옵션가" type="number" value={v.overseas_price || 0} onChange={(e) => updateOptionValue(opt.id, v.id, { overseas_price: Number(e.target.value || 0) })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">박스당 수량</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="박스당 수량" type="number" value={v.box_quantity || 0} onChange={(e) => updateOptionValue(opt.id, v.id, { box_quantity: Number(e.target.value || 0) })} />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mt-3">
                                          <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={!!v.is_selling} onChange={(e) => updateOptionValue(opt.id, v.id, { is_selling: e.target.checked })} />
                                            <span>판매여부</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={!!v.is_soldout} onChange={(e) => updateOptionValue(opt.id, v.id, { is_soldout: e.target.checked })} />
                                            <span>품절여부</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={!!v.is_stock_linked} onChange={(e) => updateOptionValue(opt.id, v.id, { is_stock_linked: e.target.checked })} />
                                            <span>재고연동</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={!!v.automation_flag} onChange={(e) => updateOptionValue(opt.id, v.id, { automation_flag: e.target.checked })} />
                                            <span>발송/출고 자동화</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={!!v.non_display_shipping} onChange={(e) => updateOptionValue(opt.id, v.id, { non_display_shipping: e.target.checked })} />
                                            <span>미진열 출고</span>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm mt-3">
                                          <div>
                                            <div className="text-xs text-gray-400">가로(cm)</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="가로(cm)" type="number" value={v.width_cm || 0} onChange={(e) => updateOptionValue(opt.id, v.id, { width_cm: Number(e.target.value || 0) })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">세로(cm)</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="세로(cm)" type="number" value={v.height_cm || 0} onChange={(e) => updateOptionValue(opt.id, v.id, { height_cm: Number(e.target.value || 0) })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">높이(cm)</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="높이(cm)" type="number" value={v.depth_cm || 0} onChange={(e) => updateOptionValue(opt.id, v.id, { depth_cm: Number(e.target.value || 0) })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">무게(g)</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="무게(g)" type="number" value={v.weight_g || 0} onChange={(e) => updateOptionValue(opt.id, v.id, { weight_g: Number(e.target.value || 0) })} />
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-400">부피(cc)</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="부피(cc)" type="number" value={v.volume_cc || 0} onChange={(e) => updateOptionValue(opt.id, v.id, { volume_cc: Number(e.target.value || 0) })} />
                                          </div>
                                          <div className="col-span-3">
                                            <div className="text-xs text-gray-400">창고 위치</div>
                                            <input className="px-2 py-1 border rounded w-full" placeholder="창고 위치" value={v.warehouse_location || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { warehouse_location: e.target.value })} />
                                          </div>
                                        </div>
                                        <div className="mt-3">
                                          <div className="text-xs text-gray-400 mb-1">비고</div>
                                          <textarea className="w-full px-2 py-1 border rounded" placeholder="옵션 비고" value={v.note || ''} onChange={(e) => updateOptionValue(opt.id, v.id, { note: e.target.value })} />
                                        </div>
                                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                          {memoValues.map((memoValue, memoIdx) => {
                                            const nextMemos = [...memoValues];
                                            return (
                                              <div key={`option-memo-${v.id}-${memoIdx}`}>
                                                <div className="text-xs text-gray-400 mb-1">옵션 메모 {memoIdx + 1}</div>
                                                <textarea
                                                  className="w-full px-2 py-1 border rounded"
                                                  placeholder={`옵션 메모 ${memoIdx + 1}`}
                                                  value={memoValue || ''}
                                                  onChange={(e) => {
                                                    nextMemos[memoIdx] = e.target.value;
                                                    updateOptionValue(opt.id, v.id, { option_memos: nextMemos });
                                                  }}
                                                />
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-500">Variants 없음</div>
                  )}
                </div>
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
              {/* Barcode print settings moved to Barcode Management > Barcode Settings */}
              <Card>
                <div className="mb-4">
                  <h2 className="text-lg font-bold">고급 설정</h2>
                  <p className="text-sm text-gray-500">
                    필요할 때만 펼쳐 추가 정보를 입력하세요.
                  </p>
                </div>
                <div className="space-y-3">
                  {advancedSections.map((section) => {
                    const isOpen = expandedPanels.includes(section.id);
                    const panelId = `${section.id}-content`;
                    return (
                      <div
                        key={section.id}
                        className="border border-gray-200 rounded-md overflow-hidden"
                      >
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none"
                          onClick={() => togglePanel(section.id)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                        >
                          <div>
                            <div className="font-medium text-sm md:text-base">
                              {section.title}
                            </div>
                            {section.description ? (
                              <p className="text-xs md:text-sm text-gray-500 mt-1">
                                {section.description}
                              </p>
                            ) : null}
                          </div>
                          <span className="text-xl leading-none font-semibold">
                            {isOpen ? "-" : "+"}
                          </span>
                        </button>
                        {isOpen && (
                          <div id={panelId} className="px-4 pb-5 pt-4 bg-white">
                            {section.render()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                      alt="대표 이미지"
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
      <SideGuide open={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="상품 등록 도움말">
        <div className="space-y-3 text-sm text-gray-700">
          <p>이 페이지에서는 상품 기본 정보, 가격, 재고, 옵션 등을 등록할 수 있습니다.</p>
          <ul className="list-disc pl-5">
            <li>상품명과 코드는 필수 입력 항목입니다.</li>
            <li>이미지는 대표 이미지와 상세 이미지로 구분됩니다.</li>
            <li>옵션을 추가하면 재고는 옵션 단위로 관리됩니다.</li>
          </ul>
        </div>
      </SideGuide>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
};

export default ProductsAddPage;
