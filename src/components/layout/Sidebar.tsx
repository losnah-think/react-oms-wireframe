import React from 'react';
import Link from 'next/link';

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
}

const menuItems: MenuItem[] = [
  {
    id: 'products',
    label: '상품 관리',
    icon: 'box',
    children: [
      { id: 'products-list', label: '상품 목록', icon: 'list' },
      { id: 'products-csv', label: 'CSV 상품 등록', icon: 'upload' },
      { id: 'products-import', label: '외부 쇼핑몰 상품 가져오기', icon: 'external-link' }
    ]
  },
  {
    id: 'orders',
    label: '주문 관리',
    icon: 'archive',
    children: [
      { id: 'orders-list', label: '주문 목록', icon: 'list' },
      { id: 'orders-settings', label: '주문 설정', icon: 'settings' }
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
      { id: 'malls-category-mapping', label: '카테고리 매핑', icon: 'copy' }
    ]
  },
  {
    id: 'settings',
    label: '환경 설정',
    icon: 'settings',
    children: [
      { id: 'settings-integrations', label: '외부 연동 관리', icon: 'external-link' },
      { id: 'settings-product-classifications', label: '상품 분류 관리', icon: 'copy' },
      { id: 'settings-brands', label: '브랜드 관리', icon: 'image' },
      { id: 'settings-product-years', label: '상품 연도 관리', icon: 'clock' },
      { id: 'settings-product-seasons', label: '상품 시즌 관리', icon: 'clock' },
      { id: 'settings-system', label: '시스템 설정', icon: 'settings' },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onPageChange, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['products']);

  // 아이콘 매핑 함수
  const getIconComponent = (iconName: string, size: number = 16, isActive: boolean = false) => {
    const iconMap: Record<string, string> = {
      'box': '/icons/Box.svg',
      'list': '/icons/List.svg',
      'file': '/icons/File.svg',
      'download': '/icons/Download.svg',
      'upload': '/icons/Upload.svg',
      'external-link': '/icons/External link.svg',
      'archive': '/icons/Archive.svg',
      'home': '/icons/Home.svg',
      'settings': '/icons/Settings.svg',
      'users': '/icons/Users.svg',
      'user-plus': '/icons/User plus.svg',
      'search': '/icons/Search.svg',
      'edit': '/icons/Edit 4.svg',
      'copy': '/icons/Copy.svg',
      'clock': '/icons/Clock.svg',
      'info': '/icons/Info.svg',
      'image': '/icons/Image.svg'
    };

    const iconSrc = iconMap[iconName];
    if (!iconSrc) return null;

    return (
      <img 
        src={iconSrc} 
        alt={iconName}
        width={size}
        height={size}
        className="flex-shrink-0"
        style={{ 
          filter: isActive 
            ? 'brightness(0) saturate(100%) invert(40%) sepia(91%) saturate(1098%) hue-rotate(202deg) brightness(97%) contrast(86%)' // 파란색
            : 'brightness(0) saturate(100%) invert(45%) sepia(0%) saturate(5%) hue-rotate(345deg) brightness(98%) contrast(89%)' // 회색
        }}
      />
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

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
    } else {
      onPageChange(item.id);
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.id);

    if (isCollapsed && level === 0) {
      return (
        <div key={item.id} className="mb-2">
          <div
            className={`
              flex items-center justify-center w-12 h-12 mx-2 rounded-lg cursor-pointer relative
              ${active ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}
            `}
            onClick={() => handleItemClick(item)}
            title={item.label}
          >
            {item.icon ? getIconComponent(item.icon, 16, active) : (
              <span className="text-lg">{item.label.charAt(0)}</span>
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
          className={`
            flex items-center justify-between px-4 py-2 text-sm cursor-pointer
            ${level === 0 ? 'mx-2 rounded-lg' : level === 1 ? 'ml-4 mr-2 rounded-md' : 'ml-8 mr-2 rounded-md'}
            ${active ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}
            ${level === 1 ? 'text-xs' : level === 2 ? 'text-xs' : ''}
          `}
        >
          <div className="flex items-center space-x-2">
            {item.icon && (
              <div className={`${level === 0 ? 'w-4 h-4' : 'w-3 h-3'} flex items-center justify-center`}>
                {getIconComponent(item.icon, level === 0 ? 14 : 10, active)}
              </div>
            )}
            {hasChildren ? (
              <button onClick={() => handleItemClick(item)} className="text-left w-full">
                <span>{item.label}</span>
              </button>
            ) : (
              // Leaf: special-case settings-integrations to use onPageChange (SPA) so LNB stays visible
              item.id === 'settings-integrations' ? (
                <button onClick={() => onPageChange(item.id)} className="text-left w-full">
                  <span>{item.label}</span>
                </button>
              ) : (
                // Default: use Link to pages route and call onPageChange for state
                <Link href={getLinkForId(item.id)} onClick={() => onPageChange(item.id)}>
                  <span>{item.label}</span>
                </Link>
              )
            )}
          </div>
          {hasChildren && !isCollapsed && (
            <span className="ml-auto text-xs">
              {isExpanded ? '−' : '+'}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && !isCollapsed && (
          <div className={level === 0 ? 'ml-2' : 'ml-2'}>
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // map menu id -> pages route
  function getLinkForId(id: string) {
    switch (id) {
      case 'settings-integrations':
        return '/settings/integration';
      case 'settings-product-classifications':
        return '/settings/product-classifications';
      case 'settings-brands':
        return '/settings/brands';
      case 'settings-product-years':
        return '/settings/product-years';
      case 'settings-product-seasons':
        return '/settings/product-seasons';
      case 'settings-system':
        return '/settings/system';
      case 'products-list':
        return '/products';
      case 'orders-list':
        return '/orders';
      default:
        return '/';
    }
  }

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 h-screen overflow-y-auto transition-all duration-300 ease-in-out flex flex-col`}>
      {/* 접기/펼치기 버튼 */}
      {onToggleCollapse && (
        <div className="p-2 border-b border-gray-200">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
        <nav className="space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
