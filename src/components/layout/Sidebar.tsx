"use client";
import React from "react";
// No direct Next router navigation — SPA uses onPageChange
import Icon from "../../design-system/components/Icon";

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
}

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  // optional prop for tests to set initially expanded menu ids
  initialExpanded?: string[];
  // optional test helper to force render all child menus
  forceExpandAll?: boolean;
}

const SETTINGS_DESCRIPTION =
  "시스템 전반의 환경설정(연동, 상품 분류, 브랜드/연도/시즌 등)을 관리합니다.";

const menuItems: MenuItem[] = [
  {
    id: "products",
    label: "상품 관리",
    icon: "package",
    children: [
      { id: "products-list", label: "상품 목록", icon: "menu" },
      { id: "products-add", label: "개별 상품 등록", icon: "plus" },
      { id: "products-csv", label: "CSV 상품 등록", icon: "upload" },
      {
        id: "products-import",
        label: "외부 판매처 상품 가져오기",
        icon: "externalLink",
      },
      {
        id: "products-registration-history",
        label: "차수별 상품등록내역",
        icon: "clock",
      },
      // { id: "products-bulk-edit", label: "상품/옵션 일괄 수정", icon: "document" },
      { id: "products-trash", label: "휴지통", icon: "delete" },
    ],
  },
  {
    id: "barcodes",
    label: "바코드 관리",
    icon: "tag",
    children: [
      { id: "barcodes-products", label: "상품 바코드 관리", icon: "menu" },
      { id: "barcodes-location", label: "위치 바코드 관리", icon: "menu" },
      {
        id: "barcodes-settings",
        label: "바코드 환경 설정",
        icon: "settings",
      },
    ],
  },
  {
    id: "users",
    label: "사용자 관리",
    icon: "users",
    children: [
      { id: "users-list", label: "사용자 목록", icon: "menu" },
      { id: "users-roles", label: "권한 관리", icon: "shield" },
      { id: "users-groups", label: "사용자 그룹", icon: "users" },
      { id: "users-activity", label: "활동 로그", icon: "clock" },
    ],
  },
  // 주문 관리 - 현재 숨김 처리
  // {
  //   id: "orders",
  //   label: "주문 관리",
  //   icon: "archive",
  //   children: [{ id: "orders-list", label: "주문 목록", icon: "list" }, { id: "orders-settings", label: "주문 설정", icon: "settings" }],
  // },
  {
    id: "shopping-mall",
    label: "거래처 관리",
    icon: "package",
    children: [
      { id: "vendors-sales", label: "판매처 관리", icon: "user" },
      {
        id: "vendors-fixed-addresses",
        label: "판매처 고정주소 관리",
        icon: "tag",
      },
      { id: "vendors-products", label: "판매처별 상품 관리", icon: "package" },
      { id: "vendors-info", label: "판매처별 부가 정보", icon: "info" },
      { id: "vendors-category-mapping", label: "판매처별 카테고리 매핑", icon: "copy" },
      // 숨김 처리된 메뉴들
      // { id: "vendors-delivery", label: "택배사 관리", icon: "truck" },
      // { id: "vendors-suppliers", label: "공급처 관리", icon: "truck" },
      // {
      //   id: "vendors-supplier-orders",
      //   label: "공급처 발주 관리",
      //   icon: "shoppingCart",
      // },
      // { id: "vendors-payments", label: "지불 관리", icon: "document" },
    ],
  },
  {
    id: "settings",
    label: "환경설정",
    icon: "settings",
    children: [
      {
        id: "settings-integrations",
        label: "외부 연동",
        icon: "externalLink",
      },
      { id: "settings-product-groups", label: "상품 분류", icon: "copy" },
      {
        id: "settings-product-classifications",
        label: "상품 카테고리",
        icon: "copy",
      },
      {
        id: "settings-basic-metadata",
        label: "브랜드·연도·시즌",
        icon: "tag",
      }
    ],
  },
  // vendors moved into shopping-mall section above
];

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  getTrashedCounts,
  getFirstExistingArray,
} from "../../lib/localStorageUtils";

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  isCollapsed = false,
  onToggleCollapse,
  initialExpanded,
  forceExpandAll = false,
}) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(
    () => initialExpanded ?? ["products"],
  );
  const { data: session } = useSession();

  // filter menu items by role: clients see only products
  const role = (session as any)?.user?.role || "operator";
  const visibleMenuItems = React.useMemo(() => {
    if (role === "client") return menuItems.filter((m) => m.id === "products");
    return menuItems;
  }, [role]);

  // 아이콘 매핑 함수 — 우선 design-system의 Icon 사용, 없으면 기존 SVG 파일로 폴백
  const getIconComponent = (
    iconName: string,
    size: number = 16,
    isActive: boolean = false,
  ) => {
    const mapToIconKey: Record<string, string> = {
      box: "package",
      list: "menu",
      file: "document",
      download: "download",
      upload: "upload",
      "external-link": "externalLink",
      externalLink: "externalLink",
      archive: "package",
      home: "home",
      settings: "settings",
      "user-plus": "user",
      users: "user",
      search: "search",
      edit: "edit",
      copy: "copy",
      clock: "clock",
      info: "info",
      image: "document",
      trash: "delete",
      barcode: "tag",
      "shopping-cart": "shoppingCart",
      truck: "truck",
      plus: "plus",
      tag: "tag",
      menu: "menu",
    };

    const iconKey = (mapToIconKey[iconName] ?? iconName) as any;
    return (
      <Icon
        name={iconKey}
        size={size}
        color={isActive ? undefined : "currentColor"}
        className="flex-shrink-0"
      />
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const [trashedCount, setTrashedCount] = React.useState<number>(() => {
    try {
      const counts = getTrashedCounts();
      return (counts.products || 0) + (counts.suppliers || 0);
    } catch (e) {
      return 0;
    }
  });

  // update trashed count when trash changes
  React.useEffect(() => {
    const onTrashed = () => {
      try {
        const counts = getTrashedCounts();
        setTrashedCount((counts.products || 0) + (counts.suppliers || 0));
      } catch (e) {
        setTrashedCount(0);
      }
    };
    window.addEventListener("trashed:updated", onTrashed);
    // also listen to storage events (other tabs)
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "trashed_products_v1" || ev.key === "trashed_suppliers_v1")
        onTrashed();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("trashed:updated", onTrashed);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const router = useRouter();

  // Map internal menu ids to canonical URL paths
  const idToPath: Record<string, string> = {
    // top-level fallbacks so LNB icons and external callers have canonical targets
    products: "/products",
    orders: "/orders",
    "shopping-mall": "/malls",
    settings: "/settings",
    "products-list": "/products",
    "products-add": "/products/add",
    "products-trash": "/products/trash",
    "products-csv": "/products/csv",
  "products-import": "/products/import",
    "products-registration-history": "/products/registration-history",
    "products-individual-registration": "/products/individual-registration",
    malls: "/malls",
  "malls-products": "/malls/products",
  "malls-info": "/malls/info",
  "vendors-products": "/vendors/products",
  "vendors-info": "/vendors/info",
  "vendors-category-mapping": "/vendors/category-mapping",
    "settings-integrations": "/settings/integration",
    "settings-product-classifications": "/settings/product-classifications",
    "settings-product-groups": "/settings/product-groups",
    "settings-basic-metadata": "/settings/basic-metadata",
    "settings-brands": "/settings/brands",
    "settings-product-years": "/settings/years",
    "settings-product-seasons": "/settings/seasons",
  };

  // Additional legacy or alternate mappings (helpful after wrapper cleanup)
  Object.assign(idToPath, {
    "settings-integration": "/settings/integration",
    "settings-users": "/settings/users",
    "settings-categories": "/settings/categories",
    "settings-bc": "/settings/bc",
    "settings-orders": "/settings/orders",
  });

  // vendor related mappings
  Object.assign(idToPath, {
    vendors: "/vendors",
    "vendors-sales": "/vendors/sales",
    "vendors-delivery": "/vendors/delivery-companies",
    "vendors-fixed-addresses": "/vendors/fixed-addresses",
    "vendors-automation": "/vendors/automation",
    "vendors-suppliers": "/vendors/suppliers",
    "vendors-supplier-orders": "/vendors/supplier-orders",
    "vendors-payments": "/vendors/payments",
  });

  // orders related mappings
  Object.assign(idToPath, {
    "orders-list": "/orders",
    "orders-settings": "/orders/settings",
  });

  // barcodes mappings
  Object.assign(idToPath, {
    barcodes: "/products/barcode",
    "barcodes-products": "/products/barcode",
    "barcodes-location": "/barcodes/location",
    "barcodes-settings": "/barcodes/settings",
  });

  // users mappings
  Object.assign(idToPath, {
    users: "/users",
    "users-list": "/users/list",
    "users-roles": "/users/roles",
    "users-groups": "/users/groups",
    "users-activity": "/users/activity",
    "users-settings": "/users/settings",
  });

  // malls mappings
  Object.assign(idToPath, {
    malls: "/malls",
    "malls-products": "/malls/products",
    "malls-info": "/malls/info",
  });

  const isActive = (id: string) => {
    // 정확한 페이지 매칭
    if (currentPage === id) return true;

    // 상위 메뉴 활성화 (하위 메뉴가 선택된 경우)
    if (id === "products" && currentPage.startsWith("products-")) return true;
    if (id === "orders" && currentPage.startsWith("orders-")) return true;
    if (id === "shopping-mall" && (currentPage.startsWith("malls-") || currentPage.startsWith("vendors-"))) return true;
    if (id === "barcodes" && currentPage.startsWith("barcodes-")) return true;
    if (id === "users" && currentPage.startsWith("users-")) return true;
    if (id === "basic" && currentPage.startsWith("basic-")) return true;
    if (id === "settings" && (currentPage.startsWith("settings-") || currentPage === "category-mapping")) return true;
    return false;
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
      return;
    }

    // Convert item.id to proper Next.js path
    const fallbackFromId = () => {
      if (item.id.includes("-")) {
        const parts = item.id.split("-");
        if (
          [
            "settings",
            "products",
            "orders",
            "vendors",
            "malls",
            "categories",
            "users",
          ].includes(parts[0])
        ) {
          return "/" + parts.join("/");
        }
        return "/" + parts.join("-");
      }
      return "/" + item.id;
    };
    const targetPath = idToPath[item.id] ?? fallbackFromId();

    // Use Next.js router for navigation
    try {
      if (router && typeof router.push === "function") {
        router.push(targetPath, undefined, { scroll: false }).catch(() => {
          try {
            window.location.assign(targetPath);
          } catch (_) {
            /* ignore */
          }
        });
      } else {
        try {
          window.location.assign(targetPath);
        } catch (_) {
          /* ignore */
        }
      }
    } catch (e) {
      try {
        window.location.assign(targetPath);
      } catch (_) {
        /* ignore */
      }
    }

    // Also notify parent app state for backward compatibility
    onPageChange(item.id);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.id);

    if (isCollapsed && level === 0) {
      return (
        <div key={item.id} className="mb-2 flex flex-col items-center">
          <div className="group relative flex flex-col items-center">
            {/* 1Depth 아이콘 */}
            <div
              role="button"
              tabIndex={0}
              aria-haspopup={hasChildren ? "menu" : undefined}
              aria-expanded={hasChildren ? isExpanded : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleItemClick(item);
                if (e.key === "ArrowRight" && hasChildren) toggleExpanded(item.id);
                if (e.key === "Escape" && hasChildren && isExpanded) toggleExpanded(item.id);
              }}
              className={`
                flex items-center justify-center w-12 h-12 rounded-lg cursor-pointer relative
                ${active ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-100"}
                touch-target
              `}
              onClick={() => handleItemClick(item)}
              title={item.id === "settings" ? SETTINGS_DESCRIPTION : item.label}
              aria-label={item.id === "settings" ? SETTINGS_DESCRIPTION : item.label}
            >
              {getIconComponent(item.icon ?? "document", 18, active)}
            </div>

            {/* 2Depth 인라인 아이콘 스택: 확장/활성/forceExpandAll이면 항상 보임 */}
            {hasChildren && (isExpanded || forceExpandAll || active) && (
              <div className="mt-2 flex flex-col items-center gap-1">
                {item.children?.map((child) => {
                  const activeChild = isActive(child.id);
                  return (
                    <button
                      key={child.id}
                      type="button"
                      aria-label={child.label}
                      title={child.label}
                      className={`
                        w-8 h-8 rounded-md flex items-center justify-center
                        ${activeChild ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-100"}
                        focus:outline-none focus:ring-2 focus:ring-primary-200
                      `}
                      onClick={() => handleItemClick(child)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleItemClick(child);
                      }}
                    >
                      {getIconComponent(child.icon ?? "document", 14, activeChild)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 라벨 툴팁(접힘 상태 설명) */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none">
              {item.id === "settings" ? SETTINGS_DESCRIPTION : item.label}
            </div>

            {/* 호버 플라이아웃: 인라인이 안 보일 때만 보조로 사용 */}
            {hasChildren && !(isExpanded || forceExpandAll || active) && (
              <div
                role="menu"
                aria-label={`${item.label} 하위 메뉴`}
                className={`
                  absolute left-full top-0 ml-3 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50
                  opacity-0 pointer-events-none
                  group-hover:opacity-100 group-hover:pointer-events-auto
                  group-focus-within:opacity-100 group-focus-within:pointer-events-auto
                `}
              >
                {item.children?.map((child) => {
                  const activeChild = isActive(child.id);
                  return (
                    <div
                      key={child.id}
                      role="menuitem"
                      tabIndex={0}
                      className={`
                        flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md
                        ${activeChild ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-50"}
                      `}
                      onClick={() => handleItemClick(child)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleItemClick(child);
                      }}
                      title={child.label}
                      aria-label={child.label}
                    >
                      <span className="w-5 h-5 flex items-center justify-center">
                        {getIconComponent(child.icon ?? "document", 16, activeChild)}
                      </span>
                      <span className="truncate">{child.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    // special-case removed: use onPageChange for SPA navigation
    // ...기존 코드...
    return (
      <div key={item.id}>
        <div
          role="button"
          tabIndex={0}
          data-testid={`menu-${item.id}`}
          onClick={() => handleItemClick(item)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleItemClick(item);
          }}
          className={`
            flex items-center justify-between px-4 py-2 text-sm touch-target
            ${level === 0 ? "mx-2 rounded-lg" : level === 1 ? "ml-4 mr-2 rounded-md" : "ml-8 mr-2 rounded-md"}
            ${active ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-100"}
            ${level === 1 ? "text-xs" : level === 2 ? "text-xs" : ""}
            cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-200
          `}
          title={item.id === "settings" ? SETTINGS_DESCRIPTION : item.label}
        >
          <div className="flex items-center">
            <div className={`flex items-center justify-center ${isCollapsed ? "w-10 h-10 mx-auto" : level === 0 ? "w-6 h-6 mr-3" : "w-5 h-5 mr-2"}`}> 
              {getIconComponent(item.icon ?? "document", level === 0 ? 18 : level === 1 ? 14 : 12, active)}
            </div>
            {!isCollapsed && (
              <span className="flex items-center gap-2 truncate">
                <span className="truncate">{item.label}</span>
                {/* Show combined trashed count on the parent 'products' menu */}
                {level === 0 && item.id === "products" && trashedCount > 0 && (
                  <span className="inline-flex items-center justify-center text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-100 ml-2">
                    {trashedCount}
                  </span>
                )}
                {/* Keep product-only badge on the specific 'products-trash' child */}
                {item.id === "products-trash" && (
                  <ProductsTrashCount />
                )}
              </span>
            )}
          </div>
          {hasChildren && !isCollapsed && (
            <span className="ml-auto text-xs">{isExpanded ? "−" : "+"}</span>
          )}
        </div>

        {hasChildren && (isExpanded || forceExpandAll) && !isCollapsed && (
          <div className={level === 0 ? "ml-2" : "ml-2"}>
            {item.children?.map((child, idx) => (
              <React.Fragment key={child.id}>
                { /* removed vendor subtitle divider '거래처' per request */ }
                {renderMenuItem(child, level + 1)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  // No direct URL mapping — navigation is handled via SPA state (onPageChange)

  return (
    <aside
      aria-label="Main sidebar"
      className={`${
        isCollapsed
          ? "w-16 min-w-[64px] max-w-[64px] p-2"
          : "w-[240px] min-w-[240px] max-w-[240px] p-4"
      } bg-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto transition-all duration-300 ease-in-out flex flex-col flex-shrink-0 sidebar ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      {/* 접기/펼치기 버튼 */}
      {onToggleCollapse && (
        <div className="p-2 border-b border-gray-200">
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:ring-2 focus:ring-primary-500 touch-target"
            title={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isCollapsed ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              )}
            </svg>
          </button>
        </div>
      )}

      <div className="flex-1 p-4">
        <nav
          className="space-y-1"
          role="navigation"
          aria-label="Main navigation"
        >
          {visibleMenuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

function ProductsTrashCount() {
  const [count, setCount] = React.useState<number>(0);

  React.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("trashed_products_v1") : null;
      const arr = raw ? JSON.parse(raw) : [];
      setCount(Array.isArray(arr) ? arr.length : 0);
    } catch (e) {
      setCount(0);
    }
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "trashed_products_v1") {
        try {
          const raw = localStorage.getItem("trashed_products_v1");
          const arr = raw ? JSON.parse(raw) : [];
          setCount(Array.isArray(arr) ? arr.length : 0);
        } catch (e) {
          setCount(0);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (count === 0) return null;
  return (
    <span className="inline-flex items-center justify-center text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-100">
      {count}
    </span>
  );
}
