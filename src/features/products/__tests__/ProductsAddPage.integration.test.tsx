import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductsAddPage from '../ProductsAddPage';

describe('ProductsAddPage integration', () => {
  const metaResponse = {
    brands: [
      { id: 'brand-1', name: '브랜드A' },
      { id: 'brand-2', name: '브랜드B' },
    ],
    categories: [
      { id: 'cat-1', name: '카테고리A' },
      { id: 'cat-2', name: '카테고리B' },
    ],
    suppliers: [
      { id: 'sup-1', name: '공급사A' },
    ],
    status: [],
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('submits a payload containing extended mockProducts fields', async () => {
    const postedBodies: any[] = [];

    const fetchMock = jest.fn(async (input: any, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url.includes('/api/meta/product-filters')) {
        return {
          ok: true,
          status: 200,
          json: async () => metaResponse,
        } as Response;
      }
      if (url.includes('/api/mock/products')) {
        if (init?.body) {
          postedBodies.push(JSON.parse(String(init.body)));
        }
        return {
          ok: true,
          status: 201,
          json: async () => ({ id: 'p-added' }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      } as Response;
    });

    (globalThis as any).fetch = fetchMock;

    render(<ProductsAddPage onNavigate={jest.fn()} onSave={jest.fn()} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/meta/product-filters')));

    const productNameInput = screen.getByPlaceholderText('예: 프리미엄 티셔츠');
    fireEvent.change(productNameInput, { target: { value: '테스트 상품' } });

    const productCodeInput = screen.getByPlaceholderText('내부 상품코드');
    fireEvent.change(productCodeInput, { target: { value: 'PRD-TEST-001' } });

    const classificationInput = screen.getByPlaceholderText('예: 의류 > 남성 > 셔츠');
    fireEvent.change(classificationInput, { target: { value: '의류 > 아우터 > 코트' } });

    const categoryButton = screen.getByRole('button', {
      name: /카테고리 선택/i,
    });
    fireEvent.click(categoryButton);
    const categoryOption = await screen.findByText('카테고리A');
    fireEvent.click(categoryOption);

    const [brandSelect, supplierSelect] = screen.getAllByRole('combobox');
    fireEvent.change(brandSelect, { target: { value: 'brand-1' } });
    fireEvent.change(supplierSelect, { target: { value: 'sup-1' } });

    fireEvent.click(screen.getByRole('button', { name: /포장 및 구성/ }));
    await screen.findByPlaceholderText('포장 단위 수량');
    fireEvent.change(screen.getByPlaceholderText('포장 단위 수량'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('포장 단위당 수량'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('예: Cotton 80%, Polyester 20%'), { target: { value: 'Cotton 100%' } });
    const packagingSelect = screen
      .getAllByRole('combobox')
      .find((element) =>
        element instanceof HTMLSelectElement &&
        Array.from(element.options).some((opt) => opt.value === 'box'),
      ) as HTMLSelectElement;
    if (!packagingSelect) {
      throw new Error('Packaging unit select not found');
    }
    fireEvent.change(packagingSelect, { target: { value: 'box' } });

    fireEvent.click(screen.getByRole('button', { name: /태그 및 메모/ }));
    await waitFor(() => screen.getByPlaceholderText('예: 베스트셀러'));
    const tagInput = screen.getByPlaceholderText('예: 베스트셀러');
    fireEvent.change(tagInput, { target: { value: '추천' } });
    fireEvent.click(screen.getByRole('button', { name: '태그 추가' }));

    const memoTextarea = screen.getAllByPlaceholderText('추가 정보를 입력하세요.')[0];
    fireEvent.change(memoTextarea, { target: { value: '추가 노트' } });

    fireEvent.click(screen.getByRole('button', { name: /제조 · 유통 기간/ }));
    await waitFor(() => document.querySelector('input[type="date"]'));
    const dateInputs = Array.from(document.querySelectorAll('input[type="date"]'));
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-12-31' } });
    const datetimeInputs = Array.from(document.querySelectorAll('input[type="datetime-local"]'));
    expect(datetimeInputs.length).toBeGreaterThanOrEqual(2);
    fireEvent.change(datetimeInputs[0], { target: { value: '2025-01-10T09:00' } });
    fireEvent.change(datetimeInputs[1], { target: { value: '2025-01-15T10:30' } });

    fireEvent.click(screen.getByRole('button', { name: /외부 연동 정보/ }));
    await waitFor(() => screen.getByPlaceholderText('외부 상품ID'));
    fireEvent.change(screen.getByPlaceholderText('외부 상품ID'), { target: { value: 'EXT-001' } });
    fireEvent.change(screen.getByPlaceholderText('연동된 외부 SKU'), { target: { value: 'EXT-SKU-001' } });
    fireEvent.change(screen.getByPlaceholderText('외부 상품URL'), { target: { value: 'https://example.com/product' } });
    fireEvent.change(screen.getByPlaceholderText('예: Cafe24'), { target: { value: 'Cafe24' } });
    fireEvent.change(screen.getByPlaceholderText('예: cafe24_store'), { target: { value: 'shop-cafe24' } });

    fireEvent.click(screen.getByText('물품등록'));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/mock/products'), expect.any(Object)));

    expect(postedBodies.length).toBe(1);
    const payload = postedBodies[0];

    expect(payload).toMatchObject({
      code: 'PRD-TEST-001',
      name: '테스트 상품',
      brand_id: 'brand-1',
      supplier_id: 'sup-1',
      category_id: 'cat-1',
      classificationPath: ['카테고리A'],
      classification: '카테고리A',
      box_qty: 10,
      composition: 'Cotton 100%',
      tags: expect.arrayContaining(['추천']),
      memos: expect.arrayContaining(['추가 노트']),
      externalMall: {
        platform: 'Cafe24',
        platformName: 'shop-cafe24',
        external_sku: 'EXT-SKU-001',
      },
    });

    expect(payload.made_date).toBe('2025-01-01');
    expect(payload.expr_date).toBe('2025-12-31');
    expect(payload.publication_date).toContain('2025-01-10');
    expect(payload.first_sale_date).toContain('2025-01-15');
  });
});
