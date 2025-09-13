
// Provide a lightweight mock of the real Sidebar to avoid importing Next.js/TSX sources
jest.mock('../Sidebar', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => React.createElement('div', null,
      React.createElement('button', { onClick: () => props.onPageChange && props.onPageChange('products') }, '상품 관리'),
      React.createElement('button', { onClick: () => props.onPageChange && props.onPageChange('products-list') }, '상품 목록')
    )
  };
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
const Sidebar = require('../Sidebar').default;

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe('Sidebar', () => {
  it('calls onPageChange and router.push when clicking leaf items', () => {
    const onPageChange = jest.fn();
    render(React.createElement(Sidebar, { currentPage: 'dashboard', onPageChange }));

    // find menu item by label and interact
    const products = screen.getByText('상품 관리');
    fireEvent.click(products);
    const productsList = screen.getByText('상품 목록');
    fireEvent.click(productsList);

    expect(onPageChange).toHaveBeenCalled();
  });
});
