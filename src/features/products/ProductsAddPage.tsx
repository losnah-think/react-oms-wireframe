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

  const formatMoney = (n?: number) => {
    const num = Number(n ?? 0);
    if (!Number.isFinite(num)) return "—";
    try {
      return new Intl.NumberFormat("ko-KR").format(num);
    } catch {
      return String(num);
    }
  };

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
    // Run this sync only once per browser session to avoid repeated mock initialization
    const sessionFlagKey = "__mock_products_synced_v1";
    const alreadySynced = typeof window !== "undefined" && sessionStorage.getItem(sessionFlagKey);
    if (alreadySynced) return;

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
        try {
          if (typeof window !== "undefined") sessionStorage.setItem(sessionFlagKey, "1");
        } catch (e) {}
      } catch (e) {
        if (!mounted) return;
        setProductFilterOptions((prev: any) => ({
          ...(prev || {}),
          brands: mockBrands || [],
        }));
        try {
          if (typeof window !== "undefined") sessionStorage.setItem(sessionFlagKey, "1");
        } catch (e) {}
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

  // handleSaveAndContinue removed: list-create UI does not support per-item save-and-continue

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
      <Container maxWidth="full" className="py-8">
        <div className="w-full px-4 lg:px-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">상품 등록</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => (typeof window !== "undefined" ? window.history.back() : null)}
              >
                목록으로
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsHelpOpen(true)}
              >
                도움말
              </Button>
            </div>
          </div>
          <GridRow gutter={24}>
            <GridCol span={3}><div></div></GridCol>
            <GridCol span={12}>
              {/* 메인 폼 영역 */}
              <form className="space-y-6">
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
                      label="상품 그룹"
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
              {/* 옵션 / Variants */}
              <Card className="mt-6">
  <div className="mb-4">
    <h2 className="text-lg font-bold">옵션 / Variants</h2>
    <p className="text-sm text-gray-500">
      옵션값과 바코드/코드 등 상세 속성을 입력하세요. (재고/위치/입고 관련 항목은 비활성화)
    </p>
  </div>

  <div className="mb-3 flex items-center gap-2">
    <Button type="button" variant="outline" onClick={addOptionGroup}>옵션 그룹 추가</Button>
  </div>

  {(formData.additionalInfo.options || []).map((g: any) => (
    <div key={g.id} className="mb-6 border rounded-md">
      {/* 그룹 헤더 */}
      <div className="p-3 flex items-center gap-3 border-b">
        <Input
          label="옵션 그룹명"
          placeholder="예: 색상, 사이즈 등"
          value={g.name || ""}
          onChange={(e) =>
            setFormData((prev) => {
              const copy = JSON.parse(JSON.stringify(prev));
              const gg = (copy.additionalInfo.options || []).find((x: any) => x.id === g.id);
              if (gg) gg.name = e.target.value;
              return copy;
            })
          }
          fullWidth
        />
        <label className="text-sm text-gray-700 inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!g.isRequired}
            onChange={(e) =>
              setFormData((prev) => {
                const copy = JSON.parse(JSON.stringify(prev));
                const gg = (copy.additionalInfo.options || []).find((x: any) => x.id === g.id);
                if (gg) gg.isRequired = e.target.checked;
                return copy;
              })
            }
          />
          필수 그룹
        </label>
        <div className="flex-1" />
        <Button type="button" variant="outline" onClick={() => addOptionValue(g.id)}>값 추가</Button>
        <Button type="button" variant="ghost" onClick={() => removeOptionGroup(g.id)}>그룹 삭제</Button>
      </div>

      {/* 값 리스트 */}
      {(g.values || []).map((v: any) => {
        const key = `${g.id}-${v.id}`;
        const open = !!expandedOptionValueIds[key];
        const selling = Number(v.selling_price || v.sellingPrice || v.price || v.additionalPrice || 0);
        const optionSupply = Number(v.option_supply_price ?? v.supply_price ?? v.cost_price ?? 0);
        const margin = Number.isFinite(selling - optionSupply) ? Number((selling - optionSupply).toFixed(2)) : 0;

        return (
          <div key={v.id} className="p-3 border-t">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">
                {(g.name || "옵션")} : {v.value || "(값 없음)"} · 코드: {v.sku || v.code || "-"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="small"
                  variant="ghost"
                  onClick={() =>
                    setExpandedOptionValueIds((prev) => ({ ...prev, [key]: !open }))
                  }
                >
                  {open ? "접기" : "펼치기"}
                </Button>
                <Button
                  type="button"
                  size="small"
                  variant="ghost"
                  onClick={() => removeOptionValue(g.id, v.id)}
                >
                  삭제
                </Button>
              </div>
            </div>

            {open && (
              <div className="mt-3">
                {/* 1행: 옵션 기본 (필수) */}
                <GridRow gutter={24}>
                  <GridCol span={12}>
                    <Input
                      label="옵션명 (필수)"
                      required
                      placeholder="예: 블랙, L"
                      value={v.value || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { value: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <Input
                      label="옵션코드 (필수)"
                      required
                      placeholder="내부 옵션코드"
                      value={v.sku || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { sku: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                </GridRow>

                {/* 2행: 바코드 */}
                <GridRow gutter={24}>
                  <GridCol span={12}>
                    <Input
                      label="바코드번호 (필수)"
                      required
                      placeholder="EAN-13/CODE128"
                      value={v.barcode1 || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { barcode1: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <Input
                      label="새로운바코드"
                      placeholder="신규 바코드"
                      value={v.barcode_new || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { barcode_new: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <Input
                      label="바코드번호2"
                      placeholder="서브 바코드 2"
                      value={v.barcode2 || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { barcode2: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <Input
                      label="바코드번호3"
                      placeholder="서브 바코드 3"
                      value={v.barcode3 || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { barcode3: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                </GridRow>

                {/* 3행: 공급처/명칭 */}
                <GridRow gutter={24}>
                  <GridCol span={12}>
                    <Input
                      label="옵션공급처명"
                      placeholder="공급처명"
                      value={v.supplier_name || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { supplier_name: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <Input
                      label="사입옵션명"
                      placeholder="실제 매입 옵션명"
                      value={v.purchase_option_name || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { purchase_option_name: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                </GridRow>

                {/* 4행: 가격/마진 */}
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <Input
                      label="원가"
                      type="number"
                      placeholder="원가"
                      value={v.cost_price ?? 0}
                      onChange={(e) => updateOptionValue(g.id, v.id, { cost_price: Number(e.target.value || 0) })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="옵션공급가"
                      type="number"
                      placeholder="옵션공급가"
                      value={v.option_supply_price ?? v.supply_price ?? 0}
                      onChange={(e) => updateOptionValue(g.id, v.id, { option_supply_price: Number(e.target.value || 0) })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="판매단가 (필수)"
                      required
                      type="number"
                      placeholder="판매단가"
                      value={v.selling_price ?? 0}
                      onChange={(e) => updateOptionValue(g.id, v.id, { selling_price: Number(e.target.value || 0) })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="마진금액"
                      type="number"
                      value={margin}
                      onChange={() => {}}
                      fullWidth
                      disabled
                    />
                  </GridCol>
                </GridRow>

                {/* 5행: 상태/연동 */}
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">판매여부 (필수)</label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!v.is_selling}
                          onChange={(e) => updateOptionValue(g.id, v.id, { is_selling: e.target.checked })}
                        />
                        판매중
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!v.is_soldout}
                          onChange={(e) => updateOptionValue(g.id, v.id, { is_soldout: e.target.checked })}
                        />
                        품절
                      </label>
                    </div>
                  </GridCol>
                  <GridCol span={6}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">재고연동여부 (필수)</label>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={`stock-linked-${key}`}
                          checked={!!v.is_stock_linked}
                          onChange={() => updateOptionValue(g.id, v.id, { is_stock_linked: true })}
                        />
                        연동
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={`stock-linked-${key}`}
                          checked={!v.is_stock_linked}
                          onChange={() => updateOptionValue(g.id, v.id, { is_stock_linked: false })}
                        />
                        미연동
                      </label>
                    </div>
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="관리등급"
                      placeholder="일반 / 우수 / 특별"
                      value={v.management_grade || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { management_grade: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="비고"
                      placeholder="비고"
                      value={v.note || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { note: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                </GridRow>

                {/* 6행: 물리/규격 */}
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <Input
                      label="가로(cm)"
                      type="number"
                      placeholder="가로"
                      value={v.width_cm ?? 0}
                      onChange={(e) => updateOptionValue(g.id, v.id, { width_cm: Number(e.target.value || 0) })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="세로(cm)"
                      type="number"
                      placeholder="세로"
                      value={v.height_cm ?? 0}
                      onChange={(e) => updateOptionValue(g.id, v.id, { height_cm: Number(e.target.value || 0) })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="높이(cm)"
                      type="number"
                      placeholder="높이"
                      value={v.depth_cm ?? 0}
                      onChange={(e) => updateOptionValue(g.id, v.id, { depth_cm: Number(e.target.value || 0) })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="무게(g)"
                      type="number"
                      placeholder="무게"
                      value={v.weight_g ?? 0}
                      onChange={(e) => updateOptionValue(g.id, v.id, { weight_g: Number(e.target.value || 0) })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="부피(cm³)"
                      type="number"
                      placeholder="부피"
                      value={v.volume_cc ?? 0}
                      onChange={(e) => updateOptionValue(g.id, v.id, { volume_cc: Number(e.target.value || 0) })}
                      fullWidth
                    />
                  </GridCol>
                </GridRow>

                {/* 7행: 색상/사이즈/박스 */}
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <Input
                      label="색상"
                      placeholder="예: 블랙"
                      value={v.color || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { color: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="사이즈"
                      placeholder="예: L"
                      value={v.size || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { size: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="박스당수량"
                      type="number"
                      placeholder="박스당수량"
                      value={v.box_quantity ?? 0}
                      onChange={(e) => updateOptionValue(g.id, v.id, { box_quantity: Number(e.target.value || 0) })}
                      fullWidth
                    />
                  </GridCol>
                </GridRow>

                {/* 8행: 제조/소재/유형 등 */}
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <Input
                      label="제조원"
                      placeholder="제조원"
                      value={v.manufacturer || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { manufacturer: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="제조국"
                      placeholder="제조국"
                      value={v.manufacturer_country || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { manufacturer_country: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="제품소재"
                      placeholder="제품소재"
                      value={v.product_material || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { product_material: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="제품유형"
                      placeholder="제품유형"
                      value={v.product_type || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { product_type: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="주의사항"
                      placeholder="주의사항"
                      value={v.caution || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { caution: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="사용기준"
                      placeholder="사용기준"
                      value={v.usage_standard || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { usage_standard: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                </GridRow>

                {/* 9행: 판매처 코드 / 해외통화옵션가 */}
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <Input
                      label="판매처옵션코드"
                      placeholder="판매처 옵션코드"
                      value={v.channel_option_code || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { channel_option_code: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="판매처별 옵션코드"
                      placeholder="판매처별 옵션코드"
                      value={v.per_channel_option_code || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { per_channel_option_code: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="해외통화옵션가"
                      placeholder="예: JPY/1000"
                      value={v.overseas_price || ""}
                      onChange={(e) => updateOptionValue(g.id, v.id, { overseas_price: e.target.value })}
                      fullWidth
                    />
                  </GridCol>
                </GridRow>

                {/* 10행: 재고/위치 (비활성화) */}
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <Input
                      label="현재재고 (비활성화)"
                      type="number"
                      value={v.stock ?? 0}
                      onChange={() => {}}
                      fullWidth
                      disabled
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <Input
                      label="안전재고 (비활성화)"
                      type="number"
                      value={v.safe_stock ?? 0}
                      onChange={() => {}}
                      fullWidth
                      disabled
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <Input
                      label="상품위치 (비활성화)"
                      placeholder="준비중"
                      value={v.warehouse_location || ""}
                      onChange={() => {}}
                      fullWidth
                      disabled
                    />
                  </GridCol>
                </GridRow>

                {/* 11행: 자동화/미진열출고 */}
                <GridRow gutter={24}>
                  <GridCol span={6}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">발송및출고자동화여부 (비활성화)</label>
                    <div className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={!!v.automation_flag} disabled onChange={() => {}} />
                      <span className="text-xs text-gray-500">준비중</span>
                    </div>
                  </GridCol>
                  <GridCol span={6}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">미진열출고여부</label>
                    <div className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!v.non_display_shipping}
                        onChange={(e) => updateOptionValue(g.id, v.id, { non_display_shipping: e.target.checked })}
                      />
                      <span className="text-xs text-gray-600">진열 없이 출고 가능</span>
                    </div>
                  </GridCol>
                </GridRow>

                {/* 12행: 옵션 메모 1~5 */}
                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">옵션 메모 (1~5)</div>
                  <GridRow gutter={24}>
                    {(() => {
                      const memos = Array.isArray(v.option_memos) ? [...v.option_memos] : ["", "", "", "", ""];
                      while (memos.length < 5) memos.push("");
                      return memos.slice(0, 5).map((mv: string, mi: number) => (
                        <GridCol key={`memo-${mi}`} span={12}>
                          <Input
                            label={`옵션메모 ${mi + 1}`}
                            placeholder="메모 입력"
                            value={mv || ""}
                            onChange={(e) => {
                              const next = [...memos];
                              next[mi] = e.target.value;
                              updateOptionValue(g.id, v.id, { option_memos: next });
                            }}
                            fullWidth
                          />
                        </GridCol>
                      ));
                    })()}
                  </GridRow>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  ))}
</Card>
              <Card id="pricing-section">
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
              <Card id="inventory-section">
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
              <Card id="activation-section">
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
              <Card id="advanced-section">
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
                <Button
                  variant="outline"
                  onClick={() => onNavigate?.("products-list")}
                >
                  취소
                </Button>
              </div>
            </form>
            </GridCol>
            <GridCol span={5}>
              <Card padding="md" className="sticky top-20">
                <div className="mb-3">
                  <h3 className="text-base font-bold text-gray-900">상품 정보 미리보기</h3>
                  <p className="text-xs text-gray-500">왼쪽 입력값이 실시간으로 반영됩니다.</p>
                </div>

                {/* 대표 이미지 */}
                <div className="w-full aspect-[4/3] bg-gray-100 rounded overflow-hidden mb-3">
                  <img
                    src={
                      formData.basicInfo.representativeImage ||
                      (Array.isArray(formData.basicInfo.images) && formData.basicInfo.images[0]) ||
                      `https://picsum.photos/seed/${formData.basicInfo.productCode || 'placeholder'}/800/600`
                    }
                    alt={formData.basicInfo.productName || "상품 이미지"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://picsum.photos/seed/${formData.basicInfo.productCode || 'placeholder'}/800/600`;
                    }}
                  />
                </div>

                {/* 이름 + 가격 */}
                <div className="mb-2">
                  <div className="text-sm text-gray-600">상품명</div>
                  <div className="text-lg font-semibold text-gray-900 truncate" title={formData.basicInfo.productName || ""}>
                    {formData.basicInfo.productName || "(이름 없음)"}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">대표 판매가</div>
                  <div className="text-xl font-bold">
                    {formatMoney(
                      Number(
                        formData.basicInfo.representativeSellingPrice ||
                        formData.basicInfo.pricing?.sellingPrice ||
                        0
                      )
                    )}
                  </div>
                </div>

                {/* 상태 뱃지 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.basicInfo.isSelling ? (
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">판매중</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">판매중지</span>
                  )}
                  {formData.basicInfo.isOutOfStock ? (
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs">품절</span>
                  ) : null}
                  {formData.basicInfo.isTaxExempt ? (
                    <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs">면세</span>
                  ) : null}
                </div>

                {/* 핵심 정보 요약 */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <div className="text-gray-500">내부코드</div>
                  <div className="text-gray-900 break-all">{formData.basicInfo.codes?.internal || "-"}</div>

                  <div className="text-gray-500">브랜드</div>
                  <div className="text-gray-900 break-all">{formData.basicInfo.brandId || "-"}</div>

                  <div className="text-gray-500">공급사</div>
                  <div className="text-gray-900 break-all">{formData.basicInfo.supplierId || "-"}</div>

                  <div className="text-gray-500">카테고리</div>
                  <div className="text-gray-900 break-all">
                    {(formData.basicInfo.classificationPath || []).join(" > ") || formData.basicInfo.productCategory || "-"}
                  </div>

                  <div className="text-gray-500">대표 공급가</div>
                  <div className="text-gray-900">
                    {formatMoney(
                      Number(
                        formData.basicInfo.representativeSupplyPrice ||
                        formData.basicInfo.pricing?.supplyPrice ||
                        0
                      )
                    )}
                  </div>

                  <div className="text-gray-500">마진금액</div>
                  <div className="text-gray-900">{formatMoney(Number(productMarginAmount || 0))}</div>
                </div>

                {/* 첫 번째 옵션 스냅샷 */}
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gray-900 mb-1">첫 번째 옵션</div>
                  {Array.isArray(formData.additionalInfo.options) &&
                  formData.additionalInfo.options[0] &&
                  Array.isArray(formData.additionalInfo.options[0].values) &&
                  formData.additionalInfo.options[0].values[0] ? (
                    (() => {
                      const firstVal = formData.additionalInfo.options[0].values[0] as any;
                      const sell =
                        Number(firstVal.selling_price ?? firstVal.sellingPrice ?? firstVal.price ?? firstVal.additionalPrice ?? 0);
                      return (
                        <div className="text-sm text-gray-700 space-y-1">
                          <div>옵션명: <strong>{firstVal.value || '-'}</strong></div>
                          <div>옵션코드: {firstVal.sku || firstVal.code || '-'}</div>
                          <div>바코드: {firstVal.barcode1 || '-'}</div>
                          <div>판매가: {formatMoney(sell)}</div>
                          <div>재고: {Number(firstVal.stock || 0).toLocaleString()}개</div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-sm text-gray-500">옵션이 없습니다.</div>
                  )}
                </div>
              </Card>
            </GridCol>
            <GridCol span={1}>
              <div></div>
            </GridCol>
            {/* 사이드 패널 영역 */}
            <GridCol span={5} className="sticky top-20">
              <div className="space-y-4">
                {/* 상품 미리보기 */}
                <Card>
                  <h2 className="text-lg font-bold mb-4">상품 미리보기</h2>
                  <div className="flex flex-col items-center gap-4">
                    {formData.basicInfo.representativeImage ? (
                      <img
                        src={formData.basicInfo.representativeImage}
                        alt="대표 이미지"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-lg border text-gray-400 text-sm">
                        이미지 없음
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-base font-semibold text-gray-900">
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
                  </div>
                </Card>

                {/* 섹션 앵커 버튼 (목록 생성용) */}
                <Card>
                  <div className="text-sm font-semibold mb-2">빠른 이동</div>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li><a href="#list-table" className="hover:underline">목록 테이블로 이동</a></li>
                  </ul>
                </Card>
              </div>
            </GridCol>
            <GridCol span={3}><div></div></GridCol>
          </GridRow>
        </div>
      </Container>
      {/* Fixed bottom action bar for Add page */}
      <div className="fixed left-0 right-0 bottom-0 bg-white border-t py-3 px-4 z-40">
        <div className="max-w-6xl mx-auto flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            생성
          </Button>
        </div>
      </div>

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
