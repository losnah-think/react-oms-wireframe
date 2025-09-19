"use client";
import React from 'react';
// No direct Next router navigation — SPA uses onPageChange
import Icon from '../../design-system/components/Icon';

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

const menuItems: MenuItem[] = [
  {
    id: 'products',
    label: '상품 관리',
    icon: 'box',
    children: [
      { id: 'products-list', label: '상품 목록', icon: 'list' },
      { id: 'products-add', label: '개별 상품 등록', icon: 'plus' },
      { id: 'products-csv', label: 'CSV 상품 등록', icon: 'upload' },
      { id: 'products-import', label: '외부 쇼핑몰 상품 가져오기', icon: 'external-link' },
      { id: 'products-registration-history', label: '차수별 상품등록내역', icon: 'clock' }, 
      { id: 'products-individual-registration', label: '개별 상품 등록', icon: 'plus' },
      { id: 'products-bulk-edit', label: '상품/옵션 일괄 수정', icon: 'file' },
      { id: 'products-trash', label: '휴지통', icon: 'trash' },
    ]
  },
  {
    id: 'orders',
    label: '주문 관리',
    icon: 'archive',
    children: [
      { id: 'orders-list', label: '주문 목록', icon: 'list' },
    ]
  },
  {
    id: 'shopping-mall',
    label: '쇼핑몰 관리',
    icon: 'home',
    children: [
      { id: 'malls', label: '쇼핑몰 목록', icon: 'list' },
      { id: 'malls-products', label: '쇼핑몰별 상품 관리', icon: 'box' },
      { id: 'malls-info', label: '쇼핑몰별 부가 정보 관리', icon: 'info' },
      { id: 'category-mapping', label: '카테고리 매핑', icon: 'copy' }
    ]
  },
  {
    id: 'settings',
    label: '기초 관리',
    icon: 'settings',
    children: [
      { id: 'settings-integrations', label: '외부 연동', icon: 'external-link' },
      { id: 'settings-barcodes', label: '바코드', icon: 'barcode' },
      { id: 'settings-product-groups', label: '상품 분류', icon: 'copy' },
      { id: 'settings-product-classifications', label: '상품 카테고리', icon: 'copy' },
      { id: 'settings-basic-metadata', label: '브랜드·연도·시즌', icon: 'layers' },
      { id: 'orders-settings', label: '주문 설정', icon: 'settings' }
    ]
  }

  ,
  {
    id: 'barcodes',
    label: '바코드 관리',
    icon: 'barcode',
    children: [
      { id: 'barcodes-products', label: '상품 바코드 관리', icon: 'list' },
      { id: 'barcodes-options', label: '옵션 바코드 관리', icon: 'list' }
    ]
  }

  // Promote vendors to top-level menu (moved out of settings)
  ,
  {
    id: 'vendors',
    label: '거래처 관리',
    icon: 'users',
    children: [
      { id: 'vendors-sales', label: '판매처 관리', icon: 'user-plus' },
      { id: 'vendors-delivery', label: '택배사 관리', icon: 'truck' },
      { id: 'vendors-fixed-addresses', label: '판매처 고정주소 관리', icon: 'map-pin' },
      { id: 'vendors-automation', label: '거래처 자동화', icon: 'settings' },
      { id: 'vendors-suppliers', label: '공급처 관리', icon: 'truck' },
      { id: 'vendors-supplier-orders', label: '공급처 발주 관리', icon: 'shopping-cart' },
      { id: 'vendors-payments', label: '지불 관리', icon: 'credit-card' }
    ]
  }
];

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onPageChange, 
  isCollapsed = false, 
  onToggleCollapse,
  initialExpanded
  , forceExpandAll = false
}) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(() => initialExpanded ?? ['products']);
  const sessObj: any = (useSession && (useSession() as any)) || {}
  const session = sessObj.data

  // filter menu items by role: clients see only products
  const role = (session as any)?.user?.role || 'operator'
  const visibleMenuItems = React.useMemo(() => {
    if (role === 'client') return menuItems.filter(m => m.id === 'products')
    return menuItems
  }, [role])

  // 아이콘 매핑 함수 — 우선 design-system의 Icon 사용, 없으면 기존 SVG 파일로 폴백
  const getIconComponent = (iconName: string, size: number = 16, isActive: boolean = false) => {
    const mapToIconKey: Record<string, string> = {
  box: 'package',
  list: 'menu',
      file: 'document',
      download: 'download',
      upload: 'upload',
  'external-link': 'externalLink',
      archive: 'package',
      home: 'home',
      settings: 'settings',
      users: 'user-plus',
  'user-plus': 'user',
      search: 'search',
      edit: 'edit',
      copy: 'copy',
      clock: 'clock',
      info: 'info',
      image: 'document'
    };

    const iconKey = (mapToIconKey[iconName] ?? iconName) as any;
    return <Icon name={iconKey} size={size} color={isActive ? undefined : 'currentColor'} className="flex-shrink-0" />;
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const [trashedCount, setTrashedCount] = React.useState<number>(() => {
    try {
      const prodRaw = typeof window !== 'undefined' ? localStorage.getItem('trashed_products_v1') : null
      const prodArr = prodRaw ? JSON.parse(prodRaw) : []
      const supRaw = typeof window !== 'undefined' ? localStorage.getItem('trashed_suppliers_v1') : null
      const supArr = supRaw ? JSON.parse(supRaw) : []
      const total = (Array.isArray(prodArr) ? prodArr.length : 0) + (Array.isArray(supArr) ? supArr.length : 0)
      return total
    } catch (e) { return 0 }
  })

  // update trashed count when trash changes
  React.useEffect(() => {
    const onTrashed = () => {
      try {
        const prodRaw = localStorage.getItem('trashed_products_v1')
        const prodArr = prodRaw ? JSON.parse(prodRaw) : []
        const supRaw = localStorage.getItem('trashed_suppliers_v1')
        const supArr = supRaw ? JSON.parse(supRaw) : []
        const total = (Array.isArray(prodArr) ? prodArr.length : 0) + (Array.isArray(supArr) ? supArr.length : 0)
        setTrashedCount(total)
      } catch (e) { setTrashedCount(0) }
    }
    window.addEventListener('trashed:updated', onTrashed)
    // also listen to storage events (other tabs)
    const onStorage = (ev: StorageEvent) => { if (ev.key === 'trashed_products_v1' || ev.key === 'trashed_suppliers_v1') onTrashed() }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('trashed:updated', onTrashed)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const router = useRouter();

  // Map internal menu ids to canonical URL paths
  const idToPath: Record<string, string> = {
  'products-list': '/products',
  'products-add': '/products/add',
  'products-trash': '/products/trash',
    'trash': '/trash',
    'products-csv': '/products/csv',
  'products-import': '/products/import',
  'products-bulk-edit': '/products/bulk-edit',
  'products-registration-history': '/products/registration-history',
  'products-individual-registration': '/products/individual-registration',
    'orders-list': '/orders',
    'orders-settings': '/orders/settings',
    'malls': '/malls',
    'malls-products': '/malls/products',
    'malls-info': '/malls/info',
    'category-mapping': '/categories/mapping',
    'settings-integrations': '/settings/integrations',
    'settings-barcodes': '/settings/barcodes',
    'settings-product-classifications': '/settings/product-classifications',
    'settings-product-groups': '/settings/product-groups',
    'settings-basic-metadata': '/settings/basic-metadata',
    'settings-brands': '/settings/brands',
    'settings-product-years': '/settings/years',
    'settings-product-seasons': '/settings/seasons'
  };

  // Additional legacy or alternate mappings (helpful after wrapper cleanup)
  Object.assign(idToPath, {
    'settings-integration': '/settings/integration',
    'settings-users': '/settings/users',
    'settings-categories': '/settings/categories',
    'settings-bc': '/settings/bc',
    'settings-orders': '/settings/orders',
  })

  // vendor related mappings
  Object.assign(idToPath, {
    'vendors': '/vendors',
    'vendors-sales': '/vendors/sales',
    'vendors-delivery': '/vendors/delivery-companies',
    'vendors-fixed-addresses': '/vendors/fixed-addresses',
    'vendors-automation': '/vendors/automation',
    'vendors-suppliers': '/vendors/suppliers',
    'vendors-supplier-orders': '/vendors/supplier-orders',
    'vendors-payments': '/vendors/payments'
  })

  // barcodes mappings
  Object.assign(idToPath, {
    'barcodes': '/barcodes',
    'barcodes-products': '/barcodes/product',
    'barcodes-options': '/barcodes/option'
  })

  const isActive = (id: string) => {
    // 정확한 페이지 매칭
    if (currentPage === id) return true;
    
    // 상위 메뉴 활성화 (하위 메뉴가 선택된 경우)
    if (id === 'products' && currentPage.startsWith('products-')) return true;
    if (id === 'orders' && currentPage.startsWith('orders-')) return true;
    if (id === 'shopping-mall' && currentPage.startsWith('malls-')) return true;
    if (id === 'basic' && currentPage.startsWith('basic-')) return true;
    if (id === 'settings' && currentPage.startsWith('settings-')) return true;
    return false;
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
      return;
    }

    // For leaf items, navigate to canonical path so browser URL updates
    // Build fallback target path from id when no explicit mapping exists.
    // Handle patterns like 'settings-product-classifications' -> '/settings/product-classifications'
    const fallbackFromId = () => {
      if (item.id.includes('-')) {
        const parts = item.id.split('-')
        // If first part is a known top-level key like 'settings' or 'products', join accordingly
        if (['settings','products','orders','vendors','malls','categories'].includes(parts[0])) {
          return '/' + parts.join('/')
        }
        return '/' + parts.join('-')
      }
      return '/' + item.id
    }
    const targetPath = idToPath[item.id] ?? fallbackFromId();
    // Use history API first so the browser address and history stack update immediately
    try {
      if (typeof window !== 'undefined' && window.history && window.history.pushState) {
        window.history.pushState({}, '', targetPath);
      }
    } catch (err) {
      // ignore
    }

    // Prefer Next router navigation; fallback to full navigation if router fails
    try {
      if (router && typeof router.push === 'function') {
        router.push(targetPath).catch(() => {
          try { window.location.assign(targetPath) } catch (_) { /* ignore */ }
        })
      } else {
        try { window.location.assign(targetPath) } catch (_) { /* ignore */ }
      }
    } catch (e) {
      try { window.location.assign(targetPath) } catch (_) { /* ignore */ }
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
        <div key={item.id} className="mb-2 flex justify-center">
          <div
            className={`
              flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer relative
              ${active ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}
              touch-target
            `}
            onClick={() => handleItemClick(item)}
            title={item.label}
          >
            {getIconComponent(item.icon ?? 'document', 16, active)}
          </div>
        </div>
      )
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
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleItemClick(item); }}
          className={`
            flex items-center justify-between px-4 py-2 text-sm touch-target
            ${level === 0 ? 'mx-2 rounded-lg' : level === 1 ? 'ml-4 mr-2 rounded-md' : 'ml-8 mr-2 rounded-md'}
            ${active ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}
            ${level === 1 ? 'text-xs' : level === 2 ? 'text-xs' : ''}
            cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-200
          `}
        >
          <div className="flex items-center">
            <div className={`flex items-center justify-center ${isCollapsed ? 'w-8 h-8 mx-auto' : (level === 0 ? 'w-4 h-4 mr-2' : 'w-3 h-3 mr-2')}`}>
              {getIconComponent(item.icon ?? 'document', level === 0 ? 14 : 10, active)}
            </div>
            {!isCollapsed && (
              <span className="flex items-center gap-2">
                {item.label}
                {/* Show combined trashed count on the parent 'products' menu */}
                {level === 0 && item.id === 'products' && trashedCount > 0 && (
                  <span className="inline-flex items-center justify-center text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-100">{trashedCount}</span>
                )}
                {/* Keep product-only badge on the specific 'products-trash' child */}
                {item.id === 'products-trash' && (() => {
                  try {
                    const raw = typeof window !== 'undefined' ? localStorage.getItem('trashed_products_v1') : null
                    const arr = raw ? JSON.parse(raw) : []
                    const count = Array.isArray(arr) ? arr.length : 0
                    return count > 0 ? <span className="inline-flex items-center justify-center text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-100">{count}</span> : null
                  } catch (e) { return null }
                })()}
              </span>
            )}
          </div>
          {hasChildren && !isCollapsed && (
            <span className="ml-auto text-xs">
              {isExpanded ? '−' : '+'}
            </span>
          )}
        </div>

        {hasChildren && (isExpanded || forceExpandAll) && !isCollapsed && (
          <div className={level === 0 ? 'ml-2' : 'ml-2'}>
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // No direct URL mapping — navigation is handled via SPA state (onPageChange)

  return (
    <aside aria-label="Main sidebar" className={`${isCollapsed ? 'w-16 p-2' : 'w-64 p-4'} bg-white border-r border-gray-200 h-screen overflow-y-auto transition-all duration-300 ease-in-out flex flex-col sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* 접기/펼치기 버튼 */}
      {onToggleCollapse && (
        <div className="p-2 border-b border-gray-200">
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:ring-2 focus:ring-primary-500 touch-target"
            title={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
      )}

      <div className="flex-1 p-4">
        <nav className="space-y-1" role="navigation" aria-label="Main navigation">
          {visibleMenuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
