import React from 'react';

interface MenuItem {
  id: string;
  label: string;
  children?: MenuItem[];
}

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems: MenuItem[] = [
  {
    id: 'products',
    label: '상품 관리',
    children: [
      { id: 'products-list', label: '상품 목록' },
      { id: 'products-csv', label: 'CSV 상품 등록' },
      { id: 'products-import', label: '외부 쇼핑몰 상품 가져오기' }
    ]
  },
  {
    id: 'orders',
    label: '주문 관리',
    children: [
      { id: 'orders-list', label: '주문 목록' },
      { id: 'orders-analytics', label: '주문 분석' },
      { id: 'orders-settings', label: '주문 설정' }
    ]
  },
  {
    id: 'shopping-mall',
    label: '쇼핑몰 관리',
    children: [
      { id: 'malls', label: '쇼핑몰 목록' },
      { id: 'malls-products', label: '쇼핑몰별 상품 관리' },
      { id: 'malls-info', label: '쇼핑몰별 부가 정보 관리' },
      { id: 'malls-category-mapping', label: '카테고리 매핑' }
    ]
  },
  {
    id: 'basic',
    label: '기초 관리',
    children: [
      { id: 'basic-brands', label: '브랜드 관리' },
      { id: 'basic-categories', label: '카테고리 관리' }
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['products']);

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

    return (
      <div key={item.id}>
        <div
          className={`
            flex items-center justify-between px-4 py-2 text-sm cursor-pointer
            ${level === 0 ? 'mx-2 rounded-lg' : level === 1 ? 'ml-4 mr-2 rounded-md' : 'ml-8 mr-2 rounded-md'}
            ${active ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}
            ${level === 1 ? 'text-xs' : level === 2 ? 'text-xs' : ''}
          `}
          onClick={() => handleItemClick(item)}
        >
          <div className="flex items-center justify-between w-full">
            <span>{item.label}</span>
            {hasChildren && (
              <span className="ml-auto text-xs">
                {isExpanded ? '−' : '+'}
              </span>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className={level === 0 ? 'ml-2' : 'ml-2'}>
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
