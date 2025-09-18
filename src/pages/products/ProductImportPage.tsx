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
  const [platform, setPlatform] = useState<string>('cafe24')
  // Platform-specific state
  const [sellerSelect, setSellerSelect] = useState<string>('')
  const [priceEditMode, setPriceEditMode] = useState<string>('수정일')
  const [autoRegisterCategory, setAutoRegisterCategory] = useState<boolean>(false)
  const [productName, setProductName] = useState<string>('')
  const [mallId, setMallId] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  // MakeShop-specific controls
  const [applyOptionName, setApplyOptionName] = useState<boolean>(false)
  const [productVisibility, setProductVisibility] = useState<string>('전체')
  const [searchBy, setSearchBy] = useState<string>('등록일')
  const [productCodeMode, setProductCodeMode] = useState<string>('상품코드')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Cafe24Product[]>([])

  // Minimal: call backend proxy which should call Cafe24 API.
  // Expect body: { mallId, q, dateFrom, dateTo } -> returns Cafe24ListResponse
  const fetchCafe24Products = async () => {
    if (!mallId) return toast?.push('판매처(mall) ID를 선택하세요', 'error')
    setIsLoading(true)
    try {
      const res = await fetch(`/api/integrations/cafe24/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, mallId, q: query, dateFrom, dateTo }),
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

  const resetFilters = () => {
    setDateFrom('')
    setDateTo('')
    setQuery('')
    setApplyOptionName(false)
    setProductVisibility('전체')
    setSearchBy('등록일')
    setProductCodeMode('상품코드')
  }

  const handleImport = async () => {
    if (!mallId) {
      toast?.push('판매처를 선택해주세요', 'error')
      return
    }

    // Mocked import behavior — in real integration call backend endpoint
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setIsLoading(false)
    toast?.push(`${platform} 상품 등록 요청을 전송했습니다. (모의)`, 'success')
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">플랫폼별 상품 등록 / 가져오기</h1>
        <div className="flex gap-2">
          {/* Removed global reset per request; keep page heading only */}
        </div>
      </div>

      {/* Platform tabs */}
      <div className="mb-4">
        <div className="flex gap-2">
          {['cafe24','makeshop','wisa','godomall','smartstore'].map(p => (
            <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-1 border ${platform===p? 'bg-white border-blue-400':'bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

  <Card>
        {/* Top inputs removed per request. Platform-specific rows follow. */}
  <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="text-sm text-gray-700">선택된 플랫폼: <strong>{platform}</strong></div>
          {/* platform-specific helper */}
          {/* Row helper: label column + content column */}
          {(() => {
            const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
              <div className="grid grid-cols-12 gap-4 items-start border-b py-3">
                <div className="col-span-3 text-sm text-gray-700">{label}</div>
                <div className="col-span-9">{children}</div>
              </div>
            )

            if (platform === 'makeshop') {
              return (
                <div>
                  <div className="p-3 bg-red-50 border border-red-100 text-sm text-red-700">메이크샵 전용 주의사항: 카테고리, 판매자 정보가 정확해야 상품 등록이 성공합니다.</div>
                  <div className="mt-4 bg-white border">
                    <Row label="판매처 선택">
                      <Input value={sellerSelect} onChange={(e:any) => setSellerSelect(e.target.value)} placeholder="판매처 선택" />
                    </Row>

                    <Row label="원가/판매가 수정여부">
                      <div className="flex gap-4 items-center">
                        <label className="inline-flex items-center"><input type="radio" name="priceEdit" checked={priceEditMode === '수정함'} onChange={()=>setPriceEditMode('수정함')} /> <span className="ml-2">수정함</span></label>
                        <label className="inline-flex items-center"><input type="radio" name="priceEdit" checked={priceEditMode === '수정안함'} onChange={()=>setPriceEditMode('수정안함')} /> <span className="ml-2">수정안함</span></label>
                      </div>
                    </Row>

                    <Row label="진열여부">
                      <select value={productVisibility} onChange={(e:any)=>setProductVisibility(e.target.value)} className="mt-1">
                        <option>전체</option>
                        <option>진열함</option>
                        <option>진열안함</option>
                      </select>
                    </Row>

                    <Row label="판매여부">
                      <select className="mt-1">
                        <option>판매함</option>
                        <option>판매중지</option>
                      </select>
                    </Row>

                    <Row label="상품명">
                      <Input value={productName} onChange={(e:any)=>setProductName(e.target.value)} placeholder="상품명 입력" />
                    </Row>

                    <Row label="상품분류 등록여부">
                      <div><input type="checkbox" checked={autoRegisterCategory} onChange={e=>setAutoRegisterCategory(e.target.checked)} /> 체크시 상품분류가 자동으로 등록됩니다</div>
                    </Row>

                    <div className="p-3 text-sm text-orange-600">옵션 적용, 카테고리 자동등록 등 MakeShop 업로드 규칙을 확인하세요.</div>
                  </div>
                </div>
              )
            }

            if (platform === 'cafe24') {
              return (
                <div>
                  <div className="p-3 bg-yellow-50 border border-yellow-100 text-sm text-yellow-700">Cafe24 연동: Mall ID 및 인증 필요</div>
                  <div className="mt-4 bg-white border">
                    <Row label="판매처">
                      <Input value={mallId} onChange={(e:any)=>setMallId(e.target.value)} placeholder="Mall ID" />
                    </Row>

                    <Row label="다운로드 상품 조건">
                      <select value={priceEditMode} onChange={(e:any)=>setPriceEditMode(e.target.value)}>
                        <option>등록일</option>
                        <option>수정일</option>
                      </select>
                    </Row>

                    <Row label="상품분류 등록여부">
                      <div><input type="checkbox" checked={autoRegisterCategory} onChange={e=>setAutoRegisterCategory(e.target.checked)} /> 체크시 상품분류가 자동으로 등록됩니다</div>
                    </Row>
                  </div>
                </div>
              )
            }

            if (platform === 'wisa') {
              return (
                <div>
                  <div className="p-3 bg-gray-50 border border-gray-100 text-sm text-gray-700">Wisa 상품 자동등록 설정 및 사용법</div>
                  <div className="mt-4 bg-white border">
                    <Row label="특정 태그내 문자 제거">
                      <Input placeholder="제거할 문자열" />
                    </Row>
                    <Row label="상품코드">
                      <div className="flex gap-2 items-center"><Input placeholder="상품코드 형식" /><div className="text-sm text-gray-500">예: SKU123</div></div>
                    </Row>
                    <div className="p-3 text-sm text-gray-600">아래 표 형식으로 필수 필드를 확인하세요.</div>
                  </div>
                </div>
              )
            }

            if (platform === 'godomall') {
              return (
                <div>
                  <div className="p-3 bg-gray-50 border border-gray-100 text-sm text-gray-700">고도몰 API 상품등록 — 판매가격, 제조사, 대표이미지 등 필수 항목을 확인하세요.</div>
                  <div className="mt-4 bg-white border">
                    <Row label="다운로드 상품 조건">
                      <div className="flex gap-2"><Input type="date" value={dateFrom} onChange={(e:any)=>setDateFrom(e.target.value)} /><Input type="date" value={dateTo} onChange={(e:any)=>setDateTo(e.target.value)} /></div>
                    </Row>
                    <Row label="상품명(필수)">
                      <Input placeholder="상품명" />
                    </Row>
                  </div>
                </div>
              )
            }

            // smartstore
            return (
            <div>
              <div className="p-3 bg-gray-50 border border-gray-100 text-sm text-gray-700">SmartStore 상품 등록 — 전시관리/상품API 설정을 확인하세요.</div>
              <div className="mt-4 bg-white border">
                <Row label="판매처">
                  <Input placeholder="판매처 선택" />
                </Row>
                <Row label="옵션명 적용여부">
                  <div><input type="checkbox" /> 체크시 옵션명이 저장됩니다</div>
                </Row>
                <Row label="다운로드 상품 조건 (등록일)">
                  <div className="flex gap-2"><Input type="date" value={dateFrom} onChange={(e:any)=>setDateFrom(e.target.value)} /><Input type="date" value={dateTo} onChange={(e:any)=>setDateTo(e.target.value)} /></div>
                </Row>
              </div>
            </div>
            )
          })()}
          <div>
            <div className="text-sm font-semibold mb-2">주의사항</div>
            <div className="p-3 bg-red-50 border border-red-100 text-sm text-red-700">
              상품 등록 API 사용을 위해서는 전시관리/스토어 관리에서 상품API가 설정되어 있어야 합니다. 필수 조건: '스마트스토어' 연동 정보가 정확해야 합니다.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">옵션명 적용여부</label>
              <div className="flex items-center gap-2 mt-1">
                <input id="applyOption" type="checkbox" checked={applyOptionName} onChange={e => setApplyOptionName(e.target.checked)} />
                <label htmlFor="applyOption" className="text-sm">체크 시 옵션명이 "색상: 빨강, 사이즈: M" 으로 저장됩니다</label>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">상품 진열여부</label>
              <select value={productVisibility} onChange={(e:any) => setProductVisibility(e.target.value)} className="mt-1">
                <option>전체</option>
                <option>진열함</option>
                <option>진열안함</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">상품 검색 기준</label>
              <select value={searchBy} onChange={(e:any) => setSearchBy(e.target.value)} className="mt-1">
                <option>등록일</option>
                <option>수정일</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-600">상품코드 모드</label>
              <div className="flex gap-4 mt-2">
                <label className="inline-flex items-center"><input type="radio" name="codeMode" checked={productCodeMode === '상품코드'} onChange={() => setProductCodeMode('상품코드')} /> <span className="ml-2">상품코드</span></label>
                <label className="inline-flex items-center"><input type="radio" name="codeMode" checked={productCodeMode === '상품코드+서브코드'} onChange={() => setProductCodeMode('상품코드+서브코드')} /> <span className="ml-2">상품코드+서브코드</span></label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => { setDateFrom(new Date().toISOString().slice(0,10)); setDateTo(new Date().toISOString().slice(0,10)) }} variant="secondary">오늘</Button>
              <Button onClick={() => { const d = new Date(); d.setDate(d.getDate()-7); setDateFrom(d.toISOString().slice(0,10)); setDateTo(new Date().toISOString().slice(0,10)) }} variant="secondary">7일</Button>
              <Button onClick={() => { const d = new Date(); d.setDate(d.getDate()-30); setDateFrom(d.toISOString().slice(0,10)); setDateTo(new Date().toISOString().slice(0,10)) }} variant="secondary">1개월</Button>
            </div>
          </div>

          {/* removed 상품 등록 & reset buttons unrelated to 상품 가져오기 */}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={fetchCafe24Products} disabled={isLoading}>조회하기</Button>
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
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">미리보기 ({products.length})</div>
              <div>
                <Button onClick={() => {
                  // Import previewed products into local store
                  const key = 'products_local_v1'
                  const existing = JSON.parse(localStorage.getItem(key) || '[]')
                  const merged = [...products.map(p => ({...p, imported_at: new Date().toISOString()})), ...existing]
                  localStorage.setItem(key, JSON.stringify(merged))
                  window.dispatchEvent(new CustomEvent('products:updated'))
                  toast?.push('상품을 로컬에 불러왔습니다.', 'success')
                }}>불러오기</Button>
                <Button variant="secondary" onClick={() => setProducts([])} className="ml-2">미리보기 비우기</Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm min-w-0">
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
                  {products.map((p:any) => (
                    <tr key={p.product_no ?? p.id ?? Math.random()} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">{p.product_no ?? p.id}</td>
                      <td className="px-3 py-2">{p.product_name ?? p.name}</td>
                      <td className="px-3 py-2">{p.product_code ?? p.sku}</td>
                      <td className="px-3 py-2">{(p.price||0).toLocaleString()}</td>
                      <td className="px-3 py-2">{p.stock ?? '-'}</td>
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
