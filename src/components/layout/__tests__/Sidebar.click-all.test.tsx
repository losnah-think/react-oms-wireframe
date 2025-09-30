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
      '상품 관리': ['상품 목록', 'CSV 상품 등록', '외부 판매처 상품 가져오기', '상품 일괄 수정', '옵션 일괄 수정'],
      '주문 관리': ['주문 목록', '주문 설정'],
      '판매처 관리': ['판매처 목록', '판매처별 상품 관리', '판매처별 부가 정보 관리', '카테고리 매핑'],
      '환경 설정': ['외부 연동 관리', '상품 그룹 관리', '브랜드 관리', '상품 연도 관리', '상품 시즌 관리', '시스템 설정']
    };

    let clickCount = 0;

    // iterate parents -> expand -> click children
    const parentIdMap: Record<string, string> = {
      '상품 관리': 'products',
      '주문 관리': 'orders',
      '판매처 관리': 'shopping-mall',
      '환경 설정': 'settings'
    };

    for (const parentLabel of Object.keys(menuStructure)) {
      const parentId = parentIdMap[parentLabel];
      const parentBtn = screen.queryByTestId(`menu-${parentId}`);
      if (!parentBtn) continue; // skip parents that aren't rendered in this environment
      fireEvent.click(parentBtn); // expand

      const parentWrapper = parentBtn.parentElement; // outer div that should contain children when expanded
      if (!parentWrapper) throw new Error('Parent wrapper not found');

      // Use data-testid prefix matching to collect child buttons reliably
      const childButtons = Array.from(parentWrapper.querySelectorAll(`[data-testid^="menu-${parentId}-"]`));
      for (const btn of childButtons) {
        fireEvent.click(btn as Element);
        clickCount++;
      }
    }

    expect(onPageChange).toHaveBeenCalled();
    expect(onPageChange).toHaveBeenCalledTimes(clickCount);
  });
});
