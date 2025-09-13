import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Sidebar from '../Sidebar';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe('Sidebar - click all entries (real component)', () => {
  it('expands parents and clicks every menu entry, calling onPageChange', async () => {
    const onPageChange = jest.fn();
  const el = React.createElement(Sidebar, { currentPage: 'dashboard', onPageChange, initialExpanded: ['products','orders','shopping-mall','settings'], forceExpandAll: true } as any);
    render(el as any);

    // Parent items that have children and their expected children labels
    const menuStructure: Record<string, string[]> = {
      '상품 관리': ['상품 목록', 'CSV 상품 등록', '외부 쇼핑몰 상품 가져오기'],
      '주문 관리': ['주문 목록', '주문 설정'],
      '쇼핑몰 관리': ['쇼핑몰 목록', '쇼핑몰별 상품 관리', '쇼핑몰별 부가 정보 관리', '카테고리 매핑'],
      '환경 설정': ['외부 연동 관리', '상품 분류 관리', '브랜드 관리', '상품 연도 관리', '상품 시즌 관리', '시스템 설정']
    };

    let clickCount = 0;

    // iterate parents -> expand -> click children
    const parentIdMap: Record<string, string> = {
      '상품 관리': 'products',
      '주문 관리': 'orders',
      '쇼핑몰 관리': 'shopping-mall',
      '환경 설정': 'settings'
    };

    for (const parentLabel of Object.keys(menuStructure)) {
      const parentId = parentIdMap[parentLabel];
      const parentBtn = screen.getByTestId(`menu-${parentId}`);
      fireEvent.click(parentBtn); // expand

      const parentWrapper = parentBtn.parentElement; // outer div that should contain children when expanded
      if (!parentWrapper) throw new Error('Parent wrapper not found');

      for (const childLabel of menuStructure[parentLabel]) {
        const childBtn = within(parentWrapper).getByText((content) => typeof content === 'string' && content.includes(childLabel));
        fireEvent.click(childBtn);
        clickCount++;
      }
    }

    expect(onPageChange).toHaveBeenCalled();
    expect(onPageChange).toHaveBeenCalledTimes(clickCount);
  });
});
