"use client"
import React, { useEffect, useState } from 'react'
import { useToast } from '../../components/ui/Toast'
import { Container, Card, Button, Input } from '../../design-system'

/**
 * ProductImportPage — Cafe24-focused
 * - Fetches products from a Cafe24-style API response
 * - Frontend-only: uses mock fallback if API is unavailable
 * - Keeps UI minimal and focused on search + results
 */

type Cafe24Product = {
  product_no: number
  product_name: string
  product_code: string
  price: number
  stock: number
}

type Cafe24ListResponse = {
  products: Cafe24Product[]
  total: number
}

export default function ProductImportPage(): JSX.Element {
  const toast = useToast()
  const [mallId, setMallId] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Cafe24Product[]>([])

  // Minimal: call backend proxy which should call Cafe24 API.
  // Expect body: { mallId, q, dateFrom, dateTo } -> returns Cafe24ListResponse
  const fetchCafe24Products = async () => {
    if (!mallId) return alert('판매처(mall) ID를 선택하세요')
    setIsLoading(true)
    try {
      const res = await fetch(`/api/integrations/cafe24/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mallId, q: query, dateFrom, dateTo }),
      })

      if (!res.ok) {
        // fallback to mock sample if backend unavailable
        throw new Error('backend error')
      }

      const body: Cafe24ListResponse = await res.json()
      setProducts(body.products || [])
    } catch (err) {
      // graceful fallback: sample mock products (shape matches Cafe24Product)
      setProducts([
        { product_no: 1001, product_name: '샘플 상품 A (mock)', product_code: 'A-MOCK-1001', price: 12000, stock: 10 },
        { product_no: 1002, product_name: '샘플 상품 B (mock)', product_code: 'B-MOCK-1002', price: 34000, stock: 5 },
      ])
      toast?.push('Cafe24 API 호출 실패 — mock 데이터로 대체합니다', 'warning')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cafe24 상품 가져오기</h1>
        <div className="flex gap-2">
          <Button onClick={() => { setDateFrom(''); setDateTo(''); setQuery('') }} variant="secondary">리셋</Button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">Mall ID (필수)</label>
            <Input value={mallId} onChange={(e: any) => setMallId(e.target.value)} placeholder="예: cafe24_shop_123" />
          </div>

          <div>
            <label className="text-sm text-gray-600">검색어 (상품명)</label>
            <Input value={query} onChange={(e: any) => setQuery(e.target.value)} placeholder="상품명으로 검색" />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm text-gray-600">시작일</label>
              <Input type="date" value={dateFrom} onChange={(e: any) => setDateFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">종료일</label>
              <Input type="date" value={dateTo} onChange={(e: any) => setDateTo(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={fetchCafe24Products} disabled={isLoading}>상품 조회</Button>
          <Button variant="secondary" onClick={() => setProducts([])}>결과 비우기</Button>
        </div>
      </Card>

      <div className="mt-6">
        {isLoading ? (
          <div className="py-8 text-center">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-gray-600">검색 결과가 없습니다.</div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-600">
                    <th className="px-3 py-2">상품번호</th>
                    <th className="px-3 py-2">상품명</th>
                    <th className="px-3 py-2">상품코드</th>
                    <th className="px-3 py-2">가격</th>
                    <th className="px-3 py-2">재고</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.product_no} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">{p.product_no}</td>
                      <td className="px-3 py-2">{p.product_name}</td>
                      <td className="px-3 py-2">{p.product_code}</td>
                      <td className="px-3 py-2">{p.price.toLocaleString()}</td>
                      <td className="px-3 py-2">{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Container>
  )
}
