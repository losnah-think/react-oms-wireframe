import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Container,
  Card,
  Button,
  Stack,
  GridRow,
  GridCol,
} from "../../design-system";
import TableExportButton from "../../components/common/TableExportButton";
import HierarchicalSelect from "../../components/common/HierarchicalSelect";
import { mockBrands } from '../../data/mockBrands';
import * as mockSuppliersApi from '../../lib/mockSuppliers';
import { formatPrice } from "../../utils/productUtils";
import { normalizeProductGroup } from "../../utils/groupUtils";
import SideGuide from "../../components/SideGuide";

interface ProductsListPageProps {
  onNavigate?: (page: string, productId?: string) => void;
}

const safeJson = async (res: Response | undefined, fallback: any) => {
  if (!res || !res.ok) return fallback;
  try {
    const j = await res.json();
    if (!j) return fallback;
    if (Array.isArray(j)) return { products: j };
    if (j.products && Array.isArray(j.products))
      return { products: j.products };
    return fallback;
  } catch {
    return fallback;
  }
};

const normalizeProducts = (list: any[]): any[] =>
  (Array.isArray(list) ? list : []).map((p: any) => {
    const base = {
      ...p,
      code: p.code || p.sku || "",
      selling_price: p.selling_price ?? p.price ?? 0,
      variants: Array.isArray(p.variants) ? p.variants : [],
    };
    return normalizeProductGroup(base);
  });

const ProductsListPage: React.FC<ProductsListPageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [productFilterOptions, setProductFilterOptions] = useState<any>({
    brands: [],
    status: [],
  });
  const [classificationsData, setClassificationsData] = useState<any[]>([]);
  const [groupsData, setGroupsData] = useState<any[]>([]);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>(
    {},
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [debounced, setDebounced] = useState(searchTerm);
  const debounceRef = useRef<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedBrand, setSelectedBrand] = useState("전체");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isOptionBatchModalOpen, setIsOptionBatchModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [localClassifications, setLocalClassifications] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [selectedDesigner, setSelectedDesigner] = useState<string>("");
  const [selectedRegistrant, setSelectedRegistrant] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("전체");
  const [selectedYear, setSelectedYear] = useState<string>("전체");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [malls, setMalls] = useState<any[]>([]);
  const [selectedMall, setSelectedMall] = useState<string>("");
  const [generalSettings, setGeneralSettings] = useState<any>({});
  const [isSupplierManagerOpen, setIsSupplierManagerOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [onlyWithShippingPolicy, setOnlyWithShippingPolicy] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [isBatchHelpOpen, setIsBatchHelpOpen] = useState(false);
  const [isOptionBatchHelpOpen, setIsOptionBatchHelpOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 20;
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // --- Search UX states & helpers ---
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState<number>(-1);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const resetFilters = useCallback(() => {
    setSelectedCategory("전체");
    setSelectedBrand("전체");
    setSelectedSuppliers([]);
    setSelectedGroups([]);
    setOnlyWithShippingPolicy(false);
    setSearchTerm("");
    setDebounced("");
    setSelectedDesigner("");
    setSelectedRegistrant("");
    setSelectedSeason("전체");
    setDateFrom("");
    setDateTo("");
  }, []);

  // compute active filters summary for collapsed view (objects with keys)
  const activeFilters = useMemo(() => {
    const parts: Array<{ key: string; label: string }> = [];
    if (selectedCategory && selectedCategory !== "전체")
      parts.push({ key: "category", label: `카테고리: ${selectedCategory}` });
    if (selectedBrand && selectedBrand !== "전체")
      parts.push({ key: "brand", label: `브랜드: ${selectedBrand}` });
    if (selectedDesigner && selectedDesigner !== "")
      parts.push({ key: "designer", label: `디자이너: ${selectedDesigner}` });
    if (selectedRegistrant && selectedRegistrant !== "")
      parts.push({ key: "registrant", label: `등록자: ${selectedRegistrant}` });
    if (selectedSeason && selectedSeason !== "전체")
      parts.push({ key: "season", label: `시즌: ${selectedSeason}` });
    if (selectedYear && selectedYear !== "전체")
      parts.push({ key: "year", label: `연도: ${selectedYear}` });
    if ((selectedSuppliers || []).length > 0)
      parts.push({ key: "suppliers", label: `공급처: ${selectedSuppliers.length}` });
    if ((selectedGroups || []).length > 0)
      parts.push({ key: "groups", label: `분류: ${selectedGroups.length}` });
    if (onlyWithShippingPolicy)
      parts.push({ key: "shipping", label: "배송비정책 있음" });
    if (compactView) parts.push({ key: "compact", label: "간단하게 보기" });
    if (dateFrom || dateTo)
      parts.push({ key: "period", label: `기간: ${dateFrom || "-"}~${dateTo || "-"}` });
    if (searchTerm) parts.push({ key: "search", label: `검색: ${searchTerm}` });
    return parts;
  }, [
    selectedCategory,
    selectedBrand,
    selectedDesigner,
    selectedRegistrant,
    selectedSeason,
    selectedYear,
    selectedSuppliers,
    selectedGroups,
    onlyWithShippingPolicy,
    compactView,
    dateFrom,
    dateTo,
    searchTerm,
  ]);

  const addRecentQuery = useCallback((q: string) => {
    const value = q.trim();
    if (!value) return;
    setRecentQueries((prev) => {
      const next = [value, ...prev.filter((v) => v !== value)].slice(0, 5);
      try {
        localStorage.setItem("products_recentQueries", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const executeSearch = useCallback(
    (value?: string) => {
      const q = (value ?? searchTerm).trim();
      setSearchTerm(q);
      setDebounced(q);
      // Save the query along with an optional date range to recent queries storage
      const meta =
        q +
        (dateFrom || dateTo ? ` | ${dateFrom || "-"}~${dateTo || "-"}` : "");
      addRecentQuery(meta);
      setIsSuggestionsOpen(false);
    },
    [searchTerm, addRecentQuery],
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebounced("");
  }, []);

  const clearFilter = useCallback(
    (key: string) => {
      switch (key) {
        case "category":
          setSelectedCategory("전체");
          break;
        case "brand":
          setSelectedBrand("전체");
          break;
        case "suppliers":
          setSelectedSuppliers([]);
          break;
        case "groups":
          setSelectedGroups([]);
          break;
        case "shipping":
          setOnlyWithShippingPolicy(false);
          break;
        case "designer":
          setSelectedDesigner("");
          break;
        case "registrant":
          setSelectedRegistrant("");
          break;
        case "season":
          setSelectedSeason("전체");
          break;
        case "year":
          setSelectedYear("전체");
          break;
        case "compact":
          setCompactView(false);
          break;
        case "period":
          setDateFrom("");
          setDateTo("");
          break;
        case "search":
          clearSearch();
          break;
        default:
          break;
      }
    },
    [clearSearch],
  );

  const focusFilterField = useCallback((key: string) => {
    // expand filters first
    setShowFilters(true);
    // focus shortly after expanding
    window.setTimeout(() => {
      let el: HTMLElement | null = null;
      if (key === "category")
        el = document.querySelector(
          '#filter-category input, #filter-category [role="combobox"], #filter-category select',
        ) as HTMLElement | null;
      if (key === "brand")
        el = document.getElementById("filter-brand") as HTMLElement | null;
      if (key === "suppliers")
        el = document.querySelector("#filter-suppliers") as HTMLElement | null;
      if (key === "groups")
        el = document.querySelector("#filter-groups") as HTMLElement | null;
      if (key === "shipping")
        el = document.querySelector(
          '[aria-label="배송비정책 있는 상품만 보기"]',
        ) as HTMLElement | null;
      if (key === "period")
        el = document.querySelector(
          'input[aria-label="검색 시작일"]',
        ) as HTMLElement | null;
      if (key === "designer")
        el = document.getElementById("filter-designer") as HTMLElement | null;
      if (key === "registrant")
        el = document.getElementById("filter-registrant") as HTMLElement | null;
      if (key === "season")
        el = document.getElementById("filter-season") as HTMLElement | null;
      if (key === "search")
        el = document.getElementById(
          "product-search-input",
        ) as HTMLElement | null;
      if (el && typeof el.focus === "function") el.focus();
    }, 120);
  }, []);

  // initialize persisted toggles
  useEffect(() => {
    try {
      const v = localStorage.getItem("products_compactView");
      const s = localStorage.getItem("products_onlyWithShippingPolicy");
      const sg = localStorage.getItem("products_selectedGroups");
      if (v !== null) setCompactView(v === "1");
      if (s !== null) setOnlyWithShippingPolicy(s === "1");
      if (sg) setSelectedGroups(JSON.parse(sg));
    } catch (e) {}
  }, []);

  // load recent queries from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("products_recentQueries");
      if (raw) setRecentQueries(JSON.parse(raw));
    } catch {}
  }, []);

  // keyboard shortcuts: ⌘/Ctrl+K or "/" to focus search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isSlash = e.key === "/";
      if (isCmdK || isSlash) {
        const active = document.activeElement as HTMLElement | null;
        const isTyping =
          !!active && ["INPUT", "TEXTAREA"].includes(active.tagName);
        if (isCmdK || (!isTyping && isSlash)) {
          e.preventDefault();
          const el = document.getElementById(
            "product-search-input",
          ) as HTMLInputElement | null;
          el?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // persist toggles
  useEffect(() => {
    try {
      localStorage.setItem("products_compactView", compactView ? "1" : "0");
    } catch (e) {}
  }, [compactView]);
  useEffect(() => {
    try {
      localStorage.setItem(
        "products_onlyWithShippingPolicy",
        onlyWithShippingPolicy ? "1" : "0",
      );
    } catch (e) {}
  }, [onlyWithShippingPolicy]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/products?limit=1000", { cache: "no-store" })
      .then((r) => safeJson(r, { products: [] }))
      .then((data) => {
        if (!mounted) return;
        try {
          let fetched = normalizeProducts(
            Array.isArray(data.products) ? data.products : [],
          );
          // merge any locally-restored products (products_local_v1)
          try {
            const rawLocal = localStorage.getItem("products_local_v1");
            if (rawLocal) {
              const local = normalizeProducts(JSON.parse(rawLocal));
              const map: Record<string, any> = {};
              fetched.forEach((p: any) => {
                map[String(p.id)] = p;
              });
              local.forEach((p: any) => {
                map[String(p.id)] = p;
              });
              fetched = Object.values(map);
            }
          } catch (err) {}

          // remove any trashed items from the visible list
          try {
            const rawTrashed = localStorage.getItem("trashed_products_v1");
            if (rawTrashed) {
              const trashed = JSON.parse(rawTrashed);
              const tset = new Set(
                (trashed || []).map((t: any) => String(t.id)),
              );
              fetched = fetched.filter((p: any) => !tset.has(String(p.id)));
            }
          } catch (err) {}

          setProducts(fetched);
        } catch (err) {
          setProducts(
            normalizeProducts(
              Array.isArray(data.products) ? data.products : [],
            ),
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // listen for cross-window updates: when trash or products_local change
  useEffect(() => {
    const onProductsUpdated = () => {
      try {
        const raw = localStorage.getItem("products_local_v1");
        if (!raw) return;
        const local = normalizeProducts(JSON.parse(raw));
        setProducts((prev) => {
          const map: Record<string, any> = {};
          (prev || []).forEach((p: any) => {
            map[String(p.id)] = p;
          });
          (local || []).forEach((p: any) => {
            map[String(p.id)] = p;
          });
          // also ensure trashed items are excluded
          try {
            const rawTrashed = localStorage.getItem("trashed_products_v1");
            if (rawTrashed) {
              const trashed = JSON.parse(rawTrashed);
              const tset = new Set(
                (trashed || []).map((t: any) => String(t.id)),
              );
              Object.keys(map).forEach((k) => {
                if (tset.has(String(k))) delete map[k];
              });
            }
          } catch (e) {}
          return Object.values(map);
        });
      } catch (e) {}
    };

    const onTrashedUpdated = () => {
      try {
        const rawTrashed = localStorage.getItem("trashed_products_v1");
        const trashed = rawTrashed ? JSON.parse(rawTrashed) : [];
        const tset = new Set((trashed || []).map((t: any) => String(t.id)));
        setProducts((prev) =>
          (prev || []).filter((p: any) => !tset.has(String(p.id))),
        );
        // clear selections that no longer exist
        setSelectedIds((prev) => {
          const next: Record<string, boolean> = {};
          Object.keys(prev || {}).forEach((k) => {
            if (!tset.has(String(k))) next[k] = prev[k];
          });
          return next;
        });
      } catch (e) {}
    };

    window.addEventListener("products:updated", onProductsUpdated);
    window.addEventListener("trashed:updated", onTrashedUpdated);
    return () => {
      window.removeEventListener("products:updated", onProductsUpdated);
      window.removeEventListener("trashed:updated", onTrashedUpdated);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/meta/product-filters", { cache: "no-store" })
      .then((r) => safeJson(r, { brands: [], status: [] }))
      .then((data) => {
        if (!mounted) return;
        setProductFilterOptions(data || { brands: [], status: [] });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Force-sync brands/suppliers with in-repo mock data for dev
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await mockSuppliersApi.listSuppliers();
        const suppliers = (res && res.items) ? res.items : [];
        if (!mounted) return;
        setProductFilterOptions((prev: any) => ({ ...(prev || {}), brands: mockBrands || [], suppliers: suppliers || [] }));
      } catch (e) {
        if (!mounted) return;
        setProductFilterOptions((prev: any) => ({ ...(prev || {}), brands: mockBrands || [] }));
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/meta/classifications", { cache: "no-store" })
      .then((r) => safeJson(r, []))
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data) ? data : [];
        setClassificationsData(list);
        setLocalClassifications(list);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/meta/groups", { cache: "no-store" })
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

  // fetch malls for external send target selection (mock)
  useEffect(() => {
    let mounted = true;
    fetch("/api/meta/malls", { cache: "no-store" })
      .then((r) => safeJson(r, { malls: [] }))
      .then((data) => {
        if (!mounted) return;
        const list =
          data && data.malls ? data.malls : Array.isArray(data) ? data : [];
        if (Array.isArray(list) && list.length) setMalls(list);
        else
          setMalls([
            { id: "m-1", name: "몰 A" },
            { id: "m-2", name: "몰 B" },
          ]);
      })
      .catch(() => {
        if (mounted)
          setMalls([
            { id: "m-1", name: "몰 A" },
            { id: "m-2", name: "몰 B" },
          ]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // load general settings (allowExternalSend, defaultMall)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("general_settings_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        setGeneralSettings(parsed);
        if (parsed?.defaultMall) setSelectedMall(parsed.defaultMall);
      }
    } catch (e) {}
  }, []);

  // prefer localStorage-managed product_groups (settings page) when available
  useEffect(() => {
    try {
      const raw = localStorage.getItem("product_groups");
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length) setGroupsData(list);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/meta/filters", { cache: "no-store" })
      .then((r) => safeJson(r, { categories: [] }))
      .then((data) => {
        if (!mounted) return;
        const map: Record<string, string> = {};
        (data && data.categories ? data.categories : []).forEach((c: any) => {
          if (c && c.id) map[c.id] = c.name;
        });
        setCategoryNames(map);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // initialize suppliers from products when loaded
  useEffect(() => {
    const list = Array.isArray(products) ? products : [];
    const s = Array.from(
      new Set(list.map((p: any) => p.supplier_name || "자사")),
    );
    if (s.length) setSuppliers(s.map((x, i) => ({ id: `s-${i}`, name: x })));
    // populate designers and registrants from product data (mocked fields)
    const d = Array.from(
      new Set(
        list.map((p: any) => p.designer || p.designer_name).filter(Boolean),
      ),
    );
    const r = Array.from(
      new Set(
        list
          .map((p: any) => p.registered_by || p.created_by || p.creator)
          .filter(Boolean),
      ),
    );
    if (d.length) setDesigners(d.map((x, i) => ({ id: `d-${i}`, name: x })));
    if (r.length) setRegistrants(r.map((x, i) => ({ id: `r-${i}`, name: x })));
  }, [products]);

  // persist selected groups
  useEffect(() => {
    try {
      localStorage.setItem(
        "products_selectedGroups",
        JSON.stringify(selectedGroups),
      );
    } catch {}
  }, [selectedGroups]);

  const filteredProducts = useMemo(() => {
    const list = products || [];
    const q = (debounced || "").trim().toLowerCase();
    return list
      .filter((p: any) => {
        // designer filter
        if (selectedDesigner && selectedDesigner !== "") {
          const pd = (p.designer || p.designer_name || "").toString();
          if (!pd || pd !== selectedDesigner) return false;
        }
        // registrant filter
        if (selectedRegistrant && selectedRegistrant !== "") {
          const pr = (
            p.registered_by ||
            p.created_by ||
            p.creator ||
            ""
          ).toString();
          if (!pr || pr !== selectedRegistrant) return false;
        }
        // season filter
        if (selectedSeason && selectedSeason !== "전체") {
          const ps = (
            p.season ||
            p.collection ||
            p.collection_season ||
            ""
          ).toString();
          if (!ps || ps !== selectedSeason) return false;
        }

        // year filter
        if (selectedYear && selectedYear !== "전체") {
          const createdYear = p.created_at ? new Date(p.created_at).getFullYear().toString() : "";
          const metaYear = (p.year || p.production_year || p.season_year || "").toString();
          if (createdYear !== selectedYear && metaYear !== selectedYear) return false;
        }
        if (q) {
          if (
            !String(p.name || "")
              .toLowerCase()
              .includes(q) &&
            !String(p.code || p.sku || "")
              .toLowerCase()
              .includes(q)
          )
            return false;
        }
        if (selectedCategory !== "전체") {
          const prodGroup =
            p.group || p.classification || categoryNames[p.category_id];
          if (prodGroup !== selectedCategory) return false;
        }
        if (selectedBrand !== "전체" && p.brand !== selectedBrand) return false;
        if (
          (selectedSuppliers || []).length > 0 &&
          !(selectedSuppliers || []).includes(p.supplier_name || "자사")
        )
          return false;
        if ((selectedGroups || []).length > 0) {
          const gid =
            p.group_id ||
            p.groupId ||
            p.classification_id ||
            p.category_id ||
            null;
          const gname =
            p.group ||
            p.group_name ||
            p.classification ||
            p.classification_name ||
            p.category_name ||
            "";
          const matchesId = gid && (selectedGroups || []).includes(String(gid));
          const matchesName =
            gname &&
            (selectedGroups || []).some(
              (x: string) => x === gname || String(x) === String(gname),
            );
          if (!matchesId && !matchesName) return false;
        }
        if (onlyWithShippingPolicy) {
          // consider a product as having a shipping policy when shipping_policy is set and not explicitly '미지정' or empty
          const sp = p.shipping_policy;
          if (!sp || String(sp).trim() === "" || String(sp).trim() === "미지정")
            return false;
        }
        // date-range filter (created_at)
        if (dateFrom || dateTo) {
          const created = p.created_at ? new Date(p.created_at) : null;
          if (!created) return false;
          if (dateFrom) {
            const start = new Date(dateFrom);
            start.setHours(0, 0, 0, 0);
            if (created.getTime() < start.getTime()) return false;
          }
          if (dateTo) {
            const end = new Date(dateTo);
            end.setHours(23, 59, 59, 999);
            if (created.getTime() > end.getTime()) return false;
          }
        }
        return true;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "newest")
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        if (sortBy === "oldest")
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        if (sortBy === "price-asc")
          return (
            (a.selling_price ?? a.price ?? 0) -
            (b.selling_price ?? b.price ?? 0)
          );
        if (sortBy === "price-desc")
          return (
            (b.selling_price ?? b.price ?? 0) -
            (a.selling_price ?? a.price ?? 0)
          );
        return 0;
      });
  }, [
    products,
    debounced,
    selectedCategory,
    selectedBrand,
    sortBy,
    categoryNames,
    selectedSuppliers,
    onlyWithShippingPolicy,
    dateFrom,
    dateTo,
    selectedGroups,
    selectedYear,
  ]);

  // debounce searchTerm -> debounced
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    // @ts-ignore
    debounceRef.current = window.setTimeout(
      () => setDebounced(searchTerm),
      300,
    );
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (isSuggestionsOpen && recentQueries.length > 0) {
      setHighlightedSuggestionIndex(0);
    } else {
      setHighlightedSuggestionIndex(-1);
    }
  }, [isSuggestionsOpen, recentQueries]);

  const exportData = filteredProducts.map((p: any) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    price: p.selling_price,
    stock: Array.isArray(p.variants)
      ? p.variants.reduce((s: number, v: any) => s + (v.stock || 0), 0)
      : p.stock || 0,
    brand: p.brand,
    createdAt: p.created_at,
  }));

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  const totalPages = Math.max(1, Math.ceil((filteredProducts || []).length / PAGE_SIZE));
  const pagedProducts = (filteredProducts || []).slice((currentPage - 1) * PAGE_SIZE, (currentPage - 1) * PAGE_SIZE + PAGE_SIZE);

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      return next;
    });
  };

  const toggleSelectAll = () => {
    const willSelect = !selectAll;
    setSelectAll(willSelect);
    if (willSelect) {
      // select only current page items
      const start = (currentPage - 1) * PAGE_SIZE;
      const pageItems = (filteredProducts || []).slice(start, start + PAGE_SIZE);
      const selMap = {} as Record<string, boolean>;
      pageItems.forEach((p: any) => {
        selMap[p.id] = true;
      });
      setSelectedIds((prev) => ({ ...prev, ...selMap }));
    } else {
      setSelectedIds({});
    }
  };

  // clamp currentPage when filteredProducts length changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((filteredProducts || []).length / PAGE_SIZE));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filteredProducts, currentPage]);

  const handleDeleteSelected = async () => {
    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (ids.length === 0) {
      setToastMessage("삭제할 상품을 선택하세요.");
      return;
    }
    // Soft-delete: move to trashed_products_v1 in localStorage
    try {
      const raw = localStorage.getItem("trashed_products_v1");
      const existing = raw ? JSON.parse(raw) : [];
      const toMove = products.filter((p: any) => ids.includes(String(p.id)));
      const nextTrashed = [...existing, ...toMove];
      localStorage.setItem("trashed_products_v1", JSON.stringify(nextTrashed));
    } catch (e) {}
    setProducts((prev) => prev.filter((p: any) => !ids.includes(String(p.id))));
    setSelectedIds({});
    setSelectAll(false);
    setToastMessage(`${ids.length}개 상품을 휴지통으로 이동했습니다.`);
  };

  const softDeleteOne = (id: string) => {
    const toMove = products.find((p: any) => String(p.id) === String(id));
    if (!toMove) {
      setToastMessage("상품을 찾을 수 없습니다.");
      return;
    }
    try {
      const raw = localStorage.getItem("trashed_products_v1");
      const existing = raw ? JSON.parse(raw) : [];
      existing.push(toMove);
      localStorage.setItem("trashed_products_v1", JSON.stringify(existing));
    } catch (e) {}
    setProducts((prev) => prev.filter((p: any) => String(p.id) !== String(id)));
    setToastMessage("상품이 휴지통으로 이동했습니다.");
  };

  const handleExternalSend = async (ids: string[], mallId?: string) => {
    if (!ids || ids.length === 0) {
      setToastMessage("전송할 상품을 선택하세요.");
      return;
    }
    const targetMall = mallId || selectedMall;
    if (!targetMall) {
      setToastMessage("전송할 쇼핑몰을 선택하세요.");
      return;
    }
    // enforce single mall selection when general setting enabled
    if (generalSettings?.allowExternalSend) {
      // if multiple ids but no single mall selected via dropdown, ensure mallId present
      if (!targetMall) {
        setToastMessage(
          "기초 설정에서 기본 쇼핑몰을 설정하거나, 단일 쇼핑몰을 선택하세요.",
        );
        return;
      }
    }
    try {
      setToastMessage("외부로 전송 중...");
      const resp = await fetch("/api/external/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, mallId: targetMall }),
        cache: "no-store",
      });
      if (!resp.ok) throw new Error(`전송 실패: ${resp.status}`);
      setToastMessage(
        `${ids.length}개 상품을 ${malls.find((m) => m.id === targetMall)?.name || targetMall}으로 외부로 전송했습니다. (목업)`,
      );
    } catch (err: any) {
      setToastMessage(`전송 중 오류: ${err?.message || err}`);
    }
  };

  const openBatchEdit = () => {
    if (onNavigate) onNavigate("products-bulk-edit");
    else window.location.href = "/products/bulk-edit?tab=product";
  };
  const openOptionBatchEdit = () => {
    if (onNavigate) onNavigate("products-bulk-edit");
    else window.location.href = "/products/bulk-edit?tab=option";
  };

  // Batch edit form state
  const [batchForm, setBatchForm] = useState<{
    priceMode: "set" | "inc" | "dec" | "pct" | "none";
    priceValue: string;
    stockMode: "set" | "inc" | "dec" | "none";
    stockValue: string;
    setSelling: "unchanged" | "selling" | "not-selling";
  }>({
    priceMode: "none",
    priceValue: "",
    stockMode: "none",
    stockValue: "",
    setSelling: "unchanged",
  });

  // Option batch form state
  const [optionBatchForm, setOptionBatchForm] = useState<{
    priceDelta: string;
    stockDelta: string;
  }>({ priceDelta: "", stockDelta: "" });

  return (
    <Container maxWidth="full" padding="md" className="bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">상품 목록</h1>
          </div>
          <div className="text-right">
            <div className="text-gray-600 mt-1 text-lg">
              총{" "}
              <span className="font-bold text-blue-600">
                {filteredProducts.length}
              </span>
              개 상품
            </div>
            <div className="text-gray-400 text-base">
              (전체 {products.length}개)
            </div>
          </div>
        </div>
      </div>

      <Card padding="lg" className="mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <strong className="text-lg">정렬</strong>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-medium"
              aria-label="정렬 기준"
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="price-asc">가격 낮은순</option>
              <option value="price-desc">가격 높은순</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              onClick={() => setShowFilters((s) => !s)}
            >
              {showFilters ? "필터 접기" : "필터 펼치기"}
            </button>
          </div>
        </div>

        {/* 선택된 필터 칩들 */}
        {activeFilters.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">적용된 필터:</span>
              {activeFilters.map((f, i) => (
                <span
                  key={f.key}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                >
                  <span className="font-medium">{f.label}</span>
                  <button
                    aria-label={`clear-${f.key}`}
                    onClick={() => clearFilter(f.key)}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold text-lg leading-none w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline hover:no-underline transition-all duration-200 ml-2 px-2 py-1 rounded hover:bg-gray-100"
              >
                전체 해제
              </button>
            </div>
          </div>
        )}

        {/* 추가 필터: 토글로 접고 펼침 */}
        {showFilters && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 상품 등록일자 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품 등록일자
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    aria-label="검색 시작일"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                  <span className="text-gray-500 font-medium">~</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    aria-label="검색 종료일"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <HierarchicalSelect
                  data={
                    classificationsData.length
                      ? classificationsData
                      : groupsData
                  }
                  value={
                    selectedCategory === "전체" ? undefined : selectedCategory
                  }
                  placeholder="카테고리 선택"
                  onChange={(node) =>
                    setSelectedCategory(node ? node.name : "전체")
                  }
                />
              </div>

              {/* 브랜드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  브랜드
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="전체">전체 브랜드</option>
                  {(productFilterOptions.brands || []).map((b: any) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 공급처 (칩 선택) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">공급처</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full border text-sm ${selectedSuppliers.length === 0 ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-white border-gray-300 text-gray-700"}`}
                    onClick={() => setSelectedSuppliers([])}
                  >
                    전체
                  </button>
                  {(suppliers || []).map((s: any) => {
                    const active = (selectedSuppliers || []).includes(s.name);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        aria-pressed={active}
                        className={`px-3 py-1.5 rounded-full border text-sm ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                        onClick={() => {
                          const set = new Set(selectedSuppliers || []);
                          if (active) set.delete(s.name);
                          else set.add(s.name);
                          setSelectedSuppliers(Array.from(set));
                        }}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 디자이너 (드롭다운) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">디자이너</label>
                <select
                  id="filter-designer"
                  value={selectedDesigner}
                  onChange={(e) => setSelectedDesigner(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="">전체</option>
                  {(designers || []).map((d: any) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              
              {/* 시즌 (칩) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시즌</label>
                <div className="flex flex-wrap gap-2">
                  {["전체","SS","FW","AW"].map((s) => {
                    const active = selectedSeason === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={active}
                        className={`px-3 py-1.5 rounded-full border text-sm ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                        onClick={() => setSelectedSeason(s)}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 연도 (칩) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">연도</label>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const now = new Date().getFullYear();
                    const years = ["전체", String(now), String(now - 1), String(now - 2), String(now - 3), String(now - 4)];
                    return years.map((y) => {
                      const active = selectedYear === y;
                      return (
                        <button
                          key={y}
                          type="button"
                          aria-pressed={active}
                          className={`px-3 py-1.5 rounded-full border text-sm ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                          onClick={() => setSelectedYear(y)}
                        >
                          {y}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* 등록자 (드롭다운) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">등록자</label>
                <select
                  id="filter-registrant"
                  value={selectedRegistrant}
                  onChange={(e) => setSelectedRegistrant(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="">전체</option>
                  {(registrants || []).map((r: any) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* 상품 그룹 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품 그룹
                </label>
                <div className="relative">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-haspopup="listbox"
                    aria-expanded={isGroupDropdownOpen}
                    onClick={() => setIsGroupDropdownOpen((s) => !s)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsGroupDropdownOpen((s) => !s);
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer flex items-center justify-between min-h-[38px]"
                  >
                    <span className={selectedGroups.length === 0 ? "text-gray-600" : "text-gray-900"}>
                      {selectedGroups.length === 0 ? "전체" : `${selectedGroups.length}개 선택`}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M6 8l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {isGroupDropdownOpen && (
                    <div className="absolute z-30 mt-1 w-full bg-white border rounded shadow-lg p-2 max-h-48 overflow-y-auto">
                      <div
                        className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 cursor-pointer rounded"
                        onClick={() => {
                          setSelectedGroups([]);
                        }}
                      >
                        <input
                          type="checkbox"
                          readOnly
                          checked={selectedGroups.length === 0}
                          className="rounded"
                        />
                        <div className="text-sm">전체</div>
                      </div>
                      <div className="h-px my-1 border-t" />
                      {(groupsData || []).map((g: any) => (
                        <label
                          key={g.id}
                          className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 cursor-pointer rounded"
                        >
                          <input
                            type="checkbox"
                            checked={(selectedGroups || []).includes(g.id)}
                            onChange={(e) => {
                              const next = new Set(selectedGroups || []);
                              if (e.target.checked) next.add(g.id);
                              else next.delete(g.id);
                              setSelectedGroups(Array.from(next));
                            }}
                            className="rounded"
                          />
                          <div className="text-sm">{g.name}</div>
                        </label>
                      ))}
                      <div className="flex justify-end mt-2 pt-2 border-t">
                        <button
                          className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50"
                          onClick={() => setIsGroupDropdownOpen(false)}
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 배송비정책 (라디오) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">배송비정책</label>
                <div role="radiogroup" aria-label="배송비정책 선택" className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="shippingPolicy"
                      value="all"
                      checked={!onlyWithShippingPolicy}
                      onChange={() => setOnlyWithShippingPolicy(false)}
                    />
                    <span>모든 상품</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="shippingPolicy"
                      value="with"
                      checked={onlyWithShippingPolicy}
                      onChange={() => setOnlyWithShippingPolicy(true)}
                    />
                    <span>배송비정책 있는 상품만</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 검색 섹션: 항상 노출 (moved back under filters) */}
      <Card padding="lg" className="mb-6 shadow-sm">
        <div className="space-y-4 bg-white rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">검색</h2>
              <div className="text-sm text-gray-500">
                <div className="mt-1">상품명, 상품코드로 검색하세요.</div>
              </div>
            </div>
          </div>
          {/* 검색 내부 상단 필드들은 필터로 이동함 */}

          <div className="flex items-center gap-4 w-full">
            <label className="w-40 text-sm text-gray-700">통합검색</label>
            <div className="relative flex-1">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <input
                    id="product-search-input"
                    role="combobox"
                    aria-expanded={isSuggestionsOpen}
                    aria-autocomplete="list"
                    aria-controls="product-search-suggestions"
                    type="text"
                    placeholder="상품명, 상품코드로 검색 (단축키: ⌘/Ctrl+K, /)"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsSuggestionsOpen(true);
                    }}
                    onFocus={() => {
                      setIsSearchFocused(true);
                      setIsSuggestionsOpen(true);
                    }}
                    onBlur={() => {
                      setIsSearchFocused(false);
                      setTimeout(() => setIsSuggestionsOpen(false), 150);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") executeSearch();
                      if (e.key === "Escape") {
                        setIsSuggestionsOpen(false);
                        (e.target as HTMLInputElement).blur();
                      }
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlightedSuggestionIndex((prev) =>
                          Math.min(prev + 1, recentQueries.length - 1),
                        );
                      }
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlightedSuggestionIndex((prev) => Math.max(prev - 1, 0));
                      }
                    }}
                    className={`w-full pl-4 pr-10 py-3 text-lg border rounded-md ${isSearchFocused ? "ring-2 ring-blue-300 border-blue-400" : "border-gray-300"}`}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      aria-label="검색어 지우기"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 px-2"
                    >
                      ×
                    </button>
                  )}
                  {isSuggestionsOpen && recentQueries.length > 0 && (
                    <ul
                      id="product-search-suggestions"
                      role="listbox"
                      className="absolute z-20 mt-1 w-full bg-white border rounded shadow"
                    >
                      {recentQueries.map((q, i) => (
                        <li
                          role="option"
                          aria-selected={i === highlightedSuggestionIndex}
                          key={q}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchTerm(q);
                            executeSearch(q);
                          }}
                        >
                          {q}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  className="ml-3 px-4 py-3 bg-blue-600 text-white rounded"
                  onClick={() => executeSearch()}
                >
                  검색
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action toolbar (Excel, batch edit, option batch edit, delete, sort) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <TableExportButton
              data={exportData}
              fileName={`products-list.xlsx`}
              aria-label="엑셀 다운로드"
            />
          </div>
          <button
            aria-label="도움말"
            className="px-3 py-2 bg-white border rounded text-sm"
            onClick={() => setIsHelpOpen(true)}
          >
            도움말
          </button>
          {/* mall select moved next to '선택 외부 송신' button */}
          <button
            aria-label="상품 일괄수정"
            className="px-3 py-2 bg-white border rounded text-sm"
            onClick={openBatchEdit}
          >
            상품 일괄수정
          </button>
          <button
            aria-label="파일 업로드 일괄수정"
            className="px-3 py-2 bg-white border rounded text-sm"
            onClick={() => {
              if (onNavigate) onNavigate("products-csv");
              else window.location.href = "/products/csv";
            }}
          >
            파일 업로드 일괄수정
          </button>
          <button
            aria-label="옵션 일괄수정"
            className="px-3 py-2 bg-white border rounded text-sm"
            onClick={openOptionBatchEdit}
          >
            옵션 일괄수정
          </button>
          <div className="flex items-center gap-2">
            <label className="sr-only">전송 쇼핑몰 선택</label>
            <select
              value={selectedMall}
              onChange={(e) => setSelectedMall(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              <option value="">쇼핑몰 선택</option>
              {(malls || []).map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <button
              aria-label="선택 외부 송신"
              className="px-3 py-2 bg-white border rounded text-sm"
              onClick={() =>
                handleExternalSend(
                  Object.keys(selectedIds).filter((k) => selectedIds[k]),
                  selectedMall,
                )
              }
            >
              선택 외부 송신
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="선택삭제"
            className="px-3 py-2 bg-red-50 border border-red-300 text-red-700 rounded text-sm"
            onClick={handleDeleteSelected}
          >
            선택삭제
          </button>
          <button
            aria-label={compactView ? "자세히 보기로 전환" : "간략히 보기로 전환"}
            className="px-3 py-2 bg-white border rounded text-sm"
            onClick={() => setCompactView((prev) => !prev)}
          >
            {compactView ? "자세히 보기" : "간략히 보기"}
          </button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden shadow-sm">
        <div className="overflow-auto">
          {loading && (
            <div className="p-6 text-center">
              로딩 중... 잠시만 기다려주세요.
            </div>
          )}
          {!loading && filteredProducts.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-lg font-bold mb-2">
                조건에 맞는 상품이 없습니다.
              </div>
              <div className="text-gray-600 mb-4">
                새 상품을 등록하거나 가져오기를 통해 데이터를 추가하세요.
              </div>
              <div className="flex justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => onNavigate?.("products-add")}
                >
                  신규 상품 등록
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate?.("products-import")}
                >
                  상품 가져오기
                </Button>
              </div>
            </div>
          )}
          <table className="min-w-full min-w-0">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">
                  상품정보
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">
                  카테고리/브랜드
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">
                  재고
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">
                  가격
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">
                  등록일
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagedProducts.map((p, idx) => (
                <tr
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (onNavigate) onNavigate("products-edit", String(p.id));
                    else window.location.href = `/products/${p.id}`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (onNavigate) onNavigate("products-edit", String(p.id));
                      else window.location.href = `/products/${p.id}`;
                    }
                  }}
                  className={`hover:bg-gray-50 cursor-pointer ${compactView ? "text-sm" : ""}`}
                >
                  <td
                    className={`${compactView ? "px-3 py-2" : "px-4 py-6"}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedIds[p.id]}
                      onChange={() => toggleRow(String(p.id))}
                    />
                  </td>
                  <td className={`${compactView ? "px-3 py-2" : "px-6 py-6"}`}>
                    <div
                      className={`flex items-start ${compactView ? "gap-2" : "gap-4"}`}
                    >
                      <div
                        className={`${compactView ? "w-12 h-10" : "w-20 h-16"} bg-gray-100 rounded overflow-hidden flex-shrink-0`}
                      >
                        <img
                          src={
                            Array.isArray(p.images) && p.images[0]
                              ? p.images[0]
                              : "https://via.placeholder.com/160x120?text=No+Image"
                          }
                          alt={p.name || "thumbnail"}
                          className={`w-full h-full object-cover`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div
                              className={`${compactView ? "text-xs text-gray-500" : "text-sm text-gray-400"}`}
                            >
                              #{String(p.id || "").padStart(3, "0")}
                            </div>
                            <div
                              className={`${compactView ? "font-medium" : "font-bold"}`}
                            >
                              {p.name || "-"}
                            </div>
                            {!compactView && (
                              <div className="text-sm text-gray-600">
                                {p.code || "-"}
                              </div>
                            )}
                          </div>
                          <div
                            className={`text-sm ${compactView ? "text-gray-600" : "text-gray-500"}`}
                          >
                            {(p.is_stock_managed ||
                              (Array.isArray(p.variants) &&
                                p.variants.length > 0)) && (
                              <span
                                className={`px-2 py-0.5 rounded ${compactView ? "bg-blue-50 text-blue-700 text-xs" : "bg-blue-100 text-blue-800 text-xs"}`}
                              >
                                재고관리
                              </span>
                            )}
                            {p.is_selling === false ? (
                              <span
                                className={`${compactView ? "ml-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs" : "ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs"}`}
                              >
                                판매중지
                              </span>
                            ) : (
                              <span
                                className={`${compactView ? "ml-1 px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs" : "ml-2 px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs"}`}
                              >
                                판매중
                              </span>
                            )}
                            {p.is_soldout && (
                              <span
                                className={`${compactView ? "ml-1 px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs" : "ml-2 px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs"}`}
                              >
                                품절
                              </span>
                            )}
                          </div>
                        </div>

                        {!compactView && (
                          <div className="mt-2 text-sm text-gray-600">
                            <div>
                              사입상품명 | {p.purchase_name || "미입력"}
                            </div>
                            <div className="mt-1">
                              판매 |{" "}
                              {formatPrice(p.selling_price ?? p.price ?? 0)}{" "}
                              &nbsp; 원가 | {formatPrice(p.cost_price ?? 0)}
                            </div>
                            <div className="mt-1">
                              공급처 | {p.supplier_name || "자사"} &nbsp; |
                              &nbsp; (--)
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`${compactView ? "px-3 py-2" : "px-6 py-6"}`}>
                    <div className={`${compactView ? "text-sm" : "text-sm"}`}>
                      {p.classification ||
                        p.group ||
                        categoryNames[p.category_id] ||
                        "미입력"}
                    </div>
                    {p.brand ? (
                      <div
                        className={`${compactView ? "text-xs text-gray-500 mt-1" : "text-sm text-gray-600 mt-1"}`}
                      >
                        {p.brand}
                      </div>
                    ) : null}
                    {!compactView && (
                      <div className="text-sm text-gray-600 mt-2">
                        상품코드 | {p.code || "미입력"}
                      </div>
                    )}
                    {!compactView && (
                      <div className="text-sm text-gray-600 mt-1">
                        배송비정책 | {p.shipping_policy || "미지정"}
                      </div>
                    )}
                  </td>
                  <td
                    className={`${compactView ? "px-3 py-2 text-center" : "px-6 py-6"}`}
                  >
                    {Array.isArray(p.variants)
                      ? p.variants.reduce(
                          (s: number, v: any) => s + (v.stock || 0),
                          0,
                        )
                      : p.stock || 0}
                  </td>
                  <td
                    className={`${compactView ? "px-3 py-2 text-right font-medium" : "px-6 py-6"}`}
                  >
                    {formatPrice(p.selling_price ?? p.price ?? 0)}
                  </td>
                  <td className={`${compactView ? "px-3 py-2" : "px-6 py-6"}`}>
                    {p.created_at
                      ? `${new Date(p.created_at).toLocaleDateString("ko-KR")} ${new Date(p.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
                      : "-"}
                  </td>
                  <td className={`${compactView ? "px-3 py-2" : "px-6 py-6"}`}>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExternalSend([String(p.id)], selectedMall);
                        }}
                      >
                        외부 송신
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            !confirm(
                              "정말 이 상품을 휴지통으로 이동하시겠습니까?",
                            )
                          )
                            return;
                          softDeleteOne(String(p.id));
                        }}
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
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">총 {filteredProducts.length}개</div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          <div className="px-3 py-1 border rounded">{currentPage}</div>
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage * PAGE_SIZE >= filteredProducts.length}
          >
            다음
          </button>
        </div>
      </div>

      {/* Batch edit modal (functional) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h3 className="text-lg font-bold mb-4">상품 일괄수정 <Button variant="outline" size="small" onClick={() => setIsBatchHelpOpen(true)}>도움말</Button></h3>
            <p className="text-sm text-gray-600 mb-4">
              선택된 상품 수: {selectedCount}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700">가격 변경</label>
                <div className="flex items-center gap-2 mt-2">
                  <select
                    value={batchForm.priceMode}
                    onChange={(e) =>
                      setBatchForm((f) => ({
                        ...f,
                        priceMode: e.target.value as any,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  >
                    <option value="none">변경 없음</option>
                    <option value="set">금액 설정</option>
                    <option value="inc">금액 증가(+)</option>
                    <option value="dec">금액 감소(-)</option>
                    <option value="pct">비율 변경(%)</option>
                  </select>
                  <input
                    className="px-3 py-1 border rounded w-full"
                    value={batchForm.priceValue}
                    onChange={(e) =>
                      setBatchForm((f) => ({
                        ...f,
                        priceValue: e.target.value,
                      }))
                    }
                    placeholder="예: 1000 또는 10(%)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700">재고 변경</label>
                <div className="flex items-center gap-2 mt-2">
                  <select
                    value={batchForm.stockMode}
                    onChange={(e) =>
                      setBatchForm((f) => ({
                        ...f,
                        stockMode: e.target.value as any,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  >
                    <option value="none">변경 없음</option>
                    <option value="set">수량 설정</option>
                    <option value="inc">증가(+)</option>
                    <option value="dec">감소(-)</option>
                  </select>
                  <input
                    className="px-3 py-1 border rounded w-full"
                    value={batchForm.stockValue}
                    onChange={(e) =>
                      setBatchForm((f) => ({
                        ...f,
                        stockValue: e.target.value,
                      }))
                    }
                    placeholder="예: 10"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700">
                판매상태 변경
              </label>
              <select
                value={batchForm.setSelling}
                onChange={(e) =>
                  setBatchForm((f) => ({
                    ...f,
                    setSelling: e.target.value as any,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              >
                <option value="unchanged">변경 없음</option>
                <option value="selling">판매중으로 설정</option>
                <option value="not-selling">판매중지로 설정</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setIsBatchModalOpen(false)}
              >
                취소
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => {
                  // apply batch changes locally
                  const ids = Object.keys(selectedIds).filter(
                    (k) => selectedIds[k],
                  );
                  if (ids.length === 0) {
                    setToastMessage("적용할 상품을 선택하세요");
                    return;
                  }
                  setProducts((prev) => {
                    const next = prev.map((p) => {
                      if (!ids.includes(String(p.id))) return p;
                      const copy = { ...p };
                      // price
                      if (
                        batchForm.priceMode !== "none" &&
                        batchForm.priceValue !== ""
                      ) {
                        const v = Number(batchForm.priceValue);
                        if (!isNaN(v)) {
                          const cur = Number(
                            copy.selling_price ?? copy.price ?? 0,
                          );
                          switch (batchForm.priceMode) {
                            case "set":
                              copy.selling_price = v;
                              break;
                            case "inc":
                              copy.selling_price = cur + v;
                              break;
                            case "dec":
                              copy.selling_price = Math.max(0, cur - v);
                              break;
                            case "pct":
                              copy.selling_price = Math.round(
                                cur * (1 + v / 100),
                              );
                              break;
                          }
                        }
                      }
                      // stock (for products without variants, or adjust each variant)
                      if (
                        batchForm.stockMode !== "none" &&
                        batchForm.stockValue !== ""
                      ) {
                        const sVal = Number(batchForm.stockValue);
                        if (!isNaN(sVal)) {
                          if (
                            Array.isArray(copy.variants) &&
                            copy.variants.length > 0
                          ) {
                            copy.variants = copy.variants.map((nv: any) => {
                              const nvCopy = { ...(nv || {}) };
                              const cur = Number(nvCopy.stock || 0);
                              switch (batchForm.stockMode) {
                                case "set":
                                  nvCopy.stock = sVal;
                                  break;
                                case "inc":
                                  nvCopy.stock = cur + sVal;
                                  break;
                                case "dec":
                                  nvCopy.stock = Math.max(0, cur - sVal);
                                  break;
                              }
                              return nvCopy;
                            });
                          } else {
                            const cur = Number(copy.stock || 0);
                            switch (batchForm.stockMode) {
                              case "set":
                                copy.stock = sVal;
                                break;
                              case "inc":
                                copy.stock = cur + sVal;
                                break;
                              case "dec":
                                copy.stock = Math.max(0, cur - sVal);
                                break;
                            }
                          }
                        }
                      }
                      // selling status
                      if (batchForm.setSelling === "selling")
                        copy.is_selling = true;
                      if (batchForm.setSelling === "not-selling")
                        copy.is_selling = false;
                      return copy;
                    });
                    return next;
                  });
                  setIsBatchModalOpen(false);
                  setToastMessage("상품 일괄수정이 적용되었습니다.");
                }}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}

      <SideGuide open={isBatchHelpOpen} onClose={() => setIsBatchHelpOpen(false)} title="상품 일괄수정 도움말">
        <table className="table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">기능</th>
              <th className="border border-gray-300 px-4 py-2">설명</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">가격 변경</td>
              <td className="border border-gray-300 px-4 py-2">선택된 상품의 가격을 설정, 증가, 감소 또는 비율로 변경합니다.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">재고 변경</td>
              <td className="border border-gray-300 px-4 py-2">선택된 상품의 재고 수량을 설정, 증가 또는 감소합니다.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">판매상태 변경</td>
              <td className="border border-gray-300 px-4 py-2">상품을 판매중 또는 판매중지로 설정합니다.</td>
            </tr>
          </tbody>
        </table>
      </SideGuide>

      {/* Option batch edit modal (functional) */}
      {isOptionBatchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h3 className="text-lg font-bold mb-4">옵션 일괄수정 <Button variant="outline" size="small" onClick={() => setIsOptionBatchHelpOpen(true)}>도움말</Button></h3>
            <p className="text-sm text-gray-600 mb-4">
              선택된 상품 수: {selectedCount}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700">
                  옵션 가격 증감
                </label>
                <input
                  className="px-3 py-1 border rounded w-full mt-2"
                  placeholder="예: +100 또는 -50"
                  value={optionBatchForm.priceDelta}
                  onChange={(e) =>
                    setOptionBatchForm((f) => ({
                      ...f,
                      priceDelta: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">
                  옵션 재고 증감
                </label>
                <input
                  className="px-3 py-1 border rounded w-full mt-2"
                  placeholder="예: +10 또는 -5"
                  value={optionBatchForm.stockDelta}
                  onChange={(e) =>
                    setOptionBatchForm((f) => ({
                      ...f,
                      stockDelta: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setIsOptionBatchModalOpen(false)}
              >
                취소
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => {
                  const ids = Object.keys(selectedIds).filter(
                    (k) => selectedIds[k],
                  );
                  if (ids.length === 0) {
                    setToastMessage("적용할 상품을 선택하세요");
                    return;
                  }
                  setProducts((prev) =>
                    prev.map((p) => {
                      if (!ids.includes(String(p.id))) return p;
                      const copy = { ...p };
                      if (
                        Array.isArray(copy.variants) &&
                        copy.variants.length
                      ) {
                        copy.variants = copy.variants.map((v: any) => {
                          const vcopy = { ...(v || {}) };
                          if (optionBatchForm.priceDelta) {
                            const pd = Number(optionBatchForm.priceDelta);
                            if (!isNaN(pd))
                              vcopy.selling_price =
                                Number(vcopy.selling_price || 0) + pd;
                          }
                          if (optionBatchForm.stockDelta) {
                            const sd = Number(optionBatchForm.stockDelta);
                            if (!isNaN(sd))
                              vcopy.stock = Math.max(
                                0,
                                Number(vcopy.stock || 0) + sd,
                              );
                          }
                          return vcopy;
                        });
                      }
                      return copy;
                    }),
                  );
                  setIsOptionBatchModalOpen(false);
                  setToastMessage("옵션 일괄수정이 적용되었습니다.");
                }}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}

      <SideGuide open={isOptionBatchHelpOpen} onClose={() => setIsOptionBatchHelpOpen(false)} title="옵션 일괄수정 도움말">
        <table className="table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">기능</th>
              <th className="border border-gray-300 px-4 py-2">설명</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">옵션 가격 증감</td>
              <td className="border border-gray-300 px-4 py-2">선택된 상품의 옵션 가격을 증가 또는 감소합니다. 예: +100 또는 -50</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">옵션 재고 증감</td>
              <td className="border border-gray-300 px-4 py-2">선택된 상품의 옵션 재고를 증가 또는 감소합니다. 예: +10 또는 -5</td>
            </tr>
          </tbody>
        </table>
      </SideGuide>

      {/* 제품 목록 도움말 */}
      <SideGuide open={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="상품 목록 도움말">
        <div className="space-y-3">
          <p className="text-sm text-gray-700">- 필터: 상단에서 카테고리, 브랜드, 시즌, 연도, 공급처 등을 설정하세요.</p>
          <p className="text-sm text-gray-700">- 검색: 통합검색에서 상품명 또는 상품코드로 찾을 수 있습니다.</p>
          <p className="text-sm text-gray-700">- 일괄수정: 선택된 상품에 대해 가격/재고/판매상태를 일괄 변경합니다.</p>
          <p className="text-sm text-gray-700">- 페이징: 하단의 페이지 네비게이션으로 결과 페이지를 이동하세요.</p>
        </div>
      </SideGuide>

      {/* Category manager modal (opened from filter area) */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded shadow-lg w-2/3 max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">상품 그룹 관리</h3>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border rounded text-sm"
                  onClick={() => {
                    // export CSV
                    const csv = [
                      "id,name",
                      ...localClassifications.map(
                        (c: any) =>
                          `${c.id},"${(c.name || "").replace(/"/g, '""')}"`,
                      ),
                    ].join("\n");
                    const blob = new Blob([csv], {
                      type: "text/csv;charset=utf-8;",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `classifications-${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  엑셀다운로드
                </button>
                <button
                  className="px-3 py-1 border rounded text-sm"
                  onClick={() => {
                    setIsCategoryManagerOpen(false);
                  }}
                >
                  닫기
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="새 분류명 입력"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => {
                    if (!newCategoryName.trim()) {
                      setToastMessage("분류명을 입력하세요.");
                      return;
                    }
                    const id = `c-${Date.now()}`;
                    const item = { id, name: newCategoryName.trim() };
                    setLocalClassifications((prev) => [...prev, item]);
                    setClassificationsData((prev) => [...prev, item]);
                    setNewCategoryName("");
                    setToastMessage("분류가 추가되었습니다.");
                  }}
                >
                  추가
                </button>
              </div>
            </div>

            <div className="overflow-auto max-h-64 border rounded">
              <table className="w-full min-w-0">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">분류명</th>
                    <th className="px-4 py-2 text-left">수정</th>
                    <th className="px-4 py-2 text-left">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {localClassifications.map((c: any, i: number) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">
                        {editingId === c.id ? (
                          <input
                            className="w-full px-2 py-1 border rounded"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                          />
                        ) : (
                          <span>{c.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === c.id ? (
                          <div className="flex gap-2">
                            <button
                              className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                              onClick={() => {
                                if (!editingName.trim()) {
                                  setToastMessage("분류명을 입력하세요.");
                                  return;
                                }
                                setLocalClassifications((prev) =>
                                  prev.map((x: any) =>
                                    x.id === c.id
                                      ? { ...x, name: editingName.trim() }
                                      : x,
                                  ),
                                );
                                setClassificationsData((prev) =>
                                  prev.map((x: any) =>
                                    x.id === c.id
                                      ? { ...x, name: editingName.trim() }
                                      : x,
                                  ),
                                );
                                setEditingId(null);
                                setEditingName("");
                                setToastMessage("분류명이 수정되었습니다.");
                              }}
                            >
                              저장
                            </button>
                            <button
                              className="px-2 py-1 border rounded text-sm"
                              onClick={() => {
                                setEditingId(null);
                                setEditingName("");
                              }}
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button
                            className="px-2 py-1 border rounded text-sm"
                            onClick={() => {
                              setEditingId(c.id);
                              setEditingName(c.name);
                            }}
                          >
                            수정
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="px-2 py-1 bg-red-50 border border-red-300 text-red-700 rounded text-sm"
                          onClick={() => {
                            if (!confirm("정말 삭제하시겠습니까?")) return;
                            setLocalClassifications((prev) =>
                              prev.filter((x: any) => x.id !== c.id),
                            );
                            setClassificationsData((prev) =>
                              prev.filter((x: any) => x.id !== c.id),
                            );
                            setToastMessage("분류가 삭제되었습니다.");
                          }}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isSupplierManagerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded shadow-lg w-2/3 max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">공급처 관리</h3>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border rounded text-sm"
                  onClick={() => {
                    setIsSupplierManagerOpen(false);
                  }}
                >
                  닫기
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="새 공급처명 입력"
                  id="new-supplier-name"
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => {
                    const el = document.getElementById(
                      "new-supplier-name",
                    ) as HTMLInputElement | null;
                    if (!el || !el.value.trim()) {
                      setToastMessage("공급처명을 입력하세요.");
                      return;
                    }
                    const name = el.value.trim();
                    const id = `s-${Date.now()}`;
                    setSuppliers((prev) => [...prev, { id, name }]);
                    el.value = "";
                    setToastMessage("공급처 추가됨");
                  }}
                >
                  추가
                </button>
              </div>
            </div>

            <div className="overflow-auto max-h-64 border rounded">
              <table className="w-full min-w-0">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">공급처명</th>
                    <th className="px-4 py-2 text-left">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {(suppliers || []).map((s: any, i: number) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">
                        <button
                          className="px-2 py-1 bg-red-50 border border-red-300 text-red-700 rounded text-sm"
                          onClick={() => {
                            if (!confirm("정말 삭제하시겠습니까?")) return;
                            setSuppliers((prev) =>
                              prev.filter((x: any) => x.id !== s.id),
                            );
                            setToastMessage("공급처가 삭제되었습니다.");
                          }}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50">
          <div className="bg-black text-white px-4 py-2 rounded shadow-lg text-sm">
            {toastMessage}
          </div>
        </div>
      )}
    </Container>
  );
};

export default ProductsListPage;
