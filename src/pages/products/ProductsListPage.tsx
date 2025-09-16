import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Container, Card, Button, Stack, GridRow, GridCol } from '../../design-system'
import TableExportButton from '../../components/common/TableExportButton'
import HierarchicalSelect from '../../components/common/HierarchicalSelect'
import { formatPrice } from '../../utils/productUtils'
import { normalizeProductGroup } from '../../utils/groupUtils'

interface ProductsListPageProps {
  onNavigate?: (page: string, productId?: string) => void
}

const safeJson = async (res: Response | undefined, fallback: any) => {
  if (!res || !res.ok) return fallback
  try {
    const j = await res.json()
    if (!j) return fallback
    if (Array.isArray(j)) return { products: j }
    if (j.products && Array.isArray(j.products)) return { products: j.products }
    return fallback
  } catch {
    return fallback
  }
}

const normalizeProducts = (list: any[]): any[] =>
  (Array.isArray(list) ? list : []).map((p: any) => {
    const base = {
      ...p,
      code: p.code || p.sku || '',
      selling_price: p.selling_price ?? p.price ?? 0,
      variants: Array.isArray(p.variants) ? p.variants : [],
    }
    return normalizeProductGroup(base)
  })

const ProductsListPage: React.FC<ProductsListPageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<any[]>([])
  const [productFilterOptions, setProductFilterOptions] = useState<any>({ brands: [], status: [] })
  const [classificationsData, setClassificationsData] = useState<any[]>([])
  const [groupsData, setGroupsData] = useState<any[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})

  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [debounced, setDebounced] = useState(searchTerm)
  const debounceRef = useRef<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedBrand, setSelectedBrand] = useState('전체')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})
  const [selectAll, setSelectAll] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [isOptionBatchModalOpen, setIsOptionBatchModalOpen] = useState(false)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/products?limit=1000')
      .then((r) => safeJson(r, { products: [] }))
      .then((data) => {
        if (!mounted) return
        setProducts(normalizeProducts(Array.isArray(data.products) ? data.products : []))
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    fetch('/api/meta/product-filters')
      .then((r) => safeJson(r, { brands: [], status: [] }))
      .then((data) => {
        if (!mounted) return
        setProductFilterOptions(data || { brands: [], status: [] })
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    fetch('/api/meta/classifications')
      .then((r) => safeJson(r, []))
      .then((data) => {
        if (!mounted) return
        setClassificationsData(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    fetch('/api/meta/groups')
      .then((r) => safeJson(r, { groups: [] }))
      .then((data) => {
        if (!mounted) return
        const groups = (data && data.groups) ? data.groups : []
        setGroupsData(Array.isArray(groups) ? groups : [])
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    fetch('/api/meta/filters')
      .then((r) => safeJson(r, { categories: [] }))
      .then((data) => {
        if (!mounted) return
        const map: Record<string, string> = {}
        ;(data && data.categories ? data.categories : []).forEach((c: any) => {
          if (c && c.id) map[c.id] = c.name
        })
        setCategoryNames(map)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const list = products || []
    const q = (debounced || '').trim().toLowerCase()
    return list
      .filter((p: any) => {
        if (q) {
          if (!String(p.name || '').toLowerCase().includes(q) && !String(p.code || p.sku || '').toLowerCase().includes(q)) return false
        }
        if (selectedCategory !== '전체') {
          const prodGroup = p.group || p.classification || categoryNames[p.category_id]
          if (prodGroup !== selectedCategory) return false
        }
        if (selectedBrand !== '전체' && p.brand !== selectedBrand) return false
        return true
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        return 0
      })
  }, [products, searchTerm, selectedCategory, selectedBrand, sortBy, categoryNames])

  // debounce searchTerm -> debounced
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    // @ts-ignore
    debounceRef.current = window.setTimeout(() => setDebounced(searchTerm), 300)
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current) }
  }, [searchTerm])

  const exportData = filteredProducts.map((p: any) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    price: p.selling_price,
    stock: Array.isArray(p.variants) ? p.variants.reduce((s: number, v: any) => s + (v.stock || 0), 0) : p.stock || 0,
    brand: p.brand,
    createdAt: p.created_at,
  }))

  const selectedCount = Object.values(selectedIds).filter(Boolean).length

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      return next
    })
  }

  const toggleSelectAll = () => {
    const willSelect = !selectAll
    setSelectAll(willSelect)
    if (willSelect) {
      const selMap = {} as Record<string, boolean>
      ;(filteredProducts || []).forEach((p: any) => { selMap[p.id] = true })
      setSelectedIds(selMap)
    } else {
      setSelectedIds({})
    }
  }

  const handleDeleteSelected = async () => {
    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k])
    if (ids.length === 0) { setToastMessage('삭제할 상품을 선택하세요.'); return }
    // For mock/demo: remove locally and show toast
    setProducts((prev) => prev.filter((p: any) => !ids.includes(String(p.id))))
    setSelectedIds({})
    setSelectAll(false)
    setToastMessage(`${ids.length}개 상품을 삭제했습니다. (모의삭제)`)
  }

  const openBatchEdit = () => { setIsBatchModalOpen(true) }
  const openOptionBatchEdit = () => { setIsOptionBatchModalOpen(true) }

  return (
    <Container maxWidth="full" padding="md" className="bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Stack direction="row" justify="between" align="center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">상품 목록</h1>
            <p className="text-gray-600 mt-1 text-lg">
              총 <span className="font-bold text-blue-600">{filteredProducts.length}</span>개 상품 <span className="text-gray-400 ml-2">(전체 {products.length}개)</span>
            </p>
          </div>
          <Stack direction="row" gap={3}>
            <Button variant="outline" onClick={() => onNavigate?.('products-import')} className="border-gray-300">
              상품 가져오기
            </Button>
            <Button variant="primary" onClick={() => onNavigate?.('products-add')} className="px-6">
              신규 상품 등록
            </Button>
            <TableExportButton data={exportData} fileName={`products-list.xlsx`} />
          </Stack>
        </Stack>
      </div>

  <Card padding="lg" className="mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <strong>필터</strong>
            <div className="text-sm text-gray-500">필터를 접어 보기와 탐색을 단순화할 수 있습니다.</div>
          </div>
          <div>
            <button className="px-2 py-1 border rounded text-sm" onClick={() => setShowFilters((s) => !s)}>{showFilters ? '필터 접기' : '필터 펼치기'}</button>
          </div>
        </div>
        {showFilters && (
          <GridRow gutter={16}>
            <GridCol span={12}>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="w-28 text-sm text-gray-700">카테고리</label>
                  <HierarchicalSelect data={classificationsData.length ? classificationsData : groupsData} value={selectedCategory === '전체' ? undefined : selectedCategory} placeholder="카테고리 선택" onChange={(node) => setSelectedCategory(node ? node.name : '전체')} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-28 text-sm text-gray-700">브랜드</label>
                  <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-lg">
                    <option value="전체">전체 브랜드</option>
                    {(productFilterOptions.brands || []).map((b: any) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-28 text-sm text-gray-700">검색어</label>
                  <input type="text" placeholder="상품명, 상품코드로 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-28 text-sm text-gray-700">정렬</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-lg">
                    <option value="newest">최신순</option>
                    <option value="oldest">오래된순</option>
                  </select>
                </div>
              </div>
            </GridCol>
          </GridRow>
        )}
        <div className="mt-4">
          <GridRow gutter={12}>
            <GridCol span={6}>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">상품등록일자</label>
                <select className="px-2 py-1 border rounded bg-white text-sm">
                  <option>전체</option>
                  <option>오늘</option>
                  <option>일주일</option>
                  <option>한달</option>
                  <option>임의기간</option>
                </select>
                <input type="date" className="ml-2 px-2 py-1 border rounded text-sm" />
                <span className="text-sm text-gray-400">~</span>
                <input type="date" className="px-2 py-1 border rounded text-sm" />
              </div>
            </GridCol>
            <GridCol span={6}>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 border rounded text-sm">전체공급처추가</button>
                <button className="px-2 py-1 border rounded text-sm">전체공급처삭제</button>
                <select className="px-2 py-1 border rounded text-sm">
                  <option>공급처선택</option>
                </select>
              </div>
            </GridCol>
          </GridRow>

          <GridRow gutter={12} className="mt-3">
            <GridCol span={6}>
                <div className="flex items-center gap-3">
                <label className="text-sm">분류</label>
                <select className="px-2 py-1 border rounded text-sm">
                  <option>전체상품분류</option>
                </select>
                <label className="text-sm">재고관리여부</label>
                <select className="px-2 py-1 border rounded text-sm">
                  <option>전체</option>
                  <option>재고관리</option>
                </select>
                <button className="px-2 py-1 border rounded text-sm" onClick={() => setIsCategoryManagerOpen(true)}>상품분류 관리</button>
              </div>
            </GridCol>
            <GridCol span={6}>
              <div className="flex items-center gap-3">
                <select className="px-2 py-1 border rounded text-sm">
                  <option>전체상품디자이너</option>
                </select>
                <select className="px-2 py-1 border rounded text-sm">
                  <option>전체상품등록자</option>
                </select>
                <label className="text-sm"><input type="checkbox" className="mr-1"/> 배송비정책있는것만표시</label>
                <label className="text-sm"><input type="checkbox" className="mr-1"/> 간단하게보기</label>
              </div>
            </GridCol>
          </GridRow>

          <GridRow className="mt-3">
            <GridCol span={8}>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">키워드</label>
                <input type="text" placeholder="통합검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-1/2 pl-3 pr-4 py-2 border border-gray-300 rounded-lg" />
                <div className="text-sm text-gray-400">Tip</div>
                <Button variant="primary" onClick={() => {}} className="px-4">검색</Button>
              </div>
            </GridCol>
          </GridRow>
        </div>
      </Card>

      {/* Action toolbar (Excel, batch edit, option batch edit, delete, sort) */}
      <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">총 <span className="font-bold text-blue-600">{filteredProducts.length}</span> 건</div>
          <div className="text-sm text-gray-400">(전체 {products.length}개)</div>
          <div className="ml-2">
            <TableExportButton data={exportData} fileName={`products-list.xlsx`} />
          </div>
          <button className="px-3 py-1 bg-white border rounded text-sm" onClick={openBatchEdit}>상품 일괄수정</button>
          <button className="px-3 py-1 bg-white border rounded text-sm" onClick={openOptionBatchEdit}>옵션 일괄수정</button>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3 py-1 bg-red-50 border border-red-300 text-red-700 rounded text-sm" onClick={handleDeleteSelected}>선택삭제</button>
          <select className="px-2 py-1 border rounded text-sm">
            <option>정렬방법</option>
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="price-asc">가격↑</option>
            <option value="price-desc">가격↓</option>
          </select>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden shadow-sm">
        <div className="overflow-auto">
          {loading && (
            <div className="p-6 text-center">로딩 중... 잠시만 기다려주세요.</div>
          )}
          {!loading && filteredProducts.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-lg font-bold mb-2">조건에 맞는 상품이 없습니다.</div>
              <div className="text-gray-600 mb-4">새 상품을 등록하거나 가져오기를 통해 데이터를 추가하세요.</div>
              <div className="flex justify-center gap-3">
                <Button variant="primary" onClick={() => onNavigate?.('products-add')}>신규 상품 등록</Button>
                <Button variant="outline" onClick={() => onNavigate?.('products-import')}>상품 가져오기</Button>
              </div>
            </div>
          )}
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-6 py-4"><input type="checkbox" checked={selectAll} onChange={toggleSelectAll} /></th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">상품정보</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">카테고리/브랜드</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">재고</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">가격</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">등록일</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((p, idx) => (
                <tr key={p.id} className="hover:bg-gray-50" onClick={() => onNavigate?.('products-detail', p.id)} style={{ cursor: 'pointer' }}>
                  <td className="px-4 py-6" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={!!selectedIds[p.id]} onChange={() => toggleRow(String(p.id))} />
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={Array.isArray(p.images) && p.images[0] ? p.images[0] : 'https://via.placeholder.com/160x120?text=No+Image'}
                          alt={p.name || 'thumbnail'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-400">#{String(p.id || '').padStart(3, '0')}</div>
                            <div className="font-bold">{p.name || '-'}</div>
                            <div className="text-sm text-gray-600">{p.code || '-'}</div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {(p.is_stock_managed || (Array.isArray(p.variants) && p.variants.length > 0)) && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">재고관리</span>}
                            {p.is_selling === false ? <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">판매중지</span> : <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">판매중</span>}
                            {p.is_soldout && <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs">품절</span>}
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                          <div>사입상품명 | {p.purchase_name || '미입력'}</div>
                          <div className="mt-1">판매 | {formatPrice(p.selling_price ?? p.price ?? 0)} &nbsp; 원가 | {formatPrice(p.cost_price ?? 0)}</div>
                          <div className="mt-1">공급처 | {p.supplier_name || '자사'} &nbsp; | &nbsp; (--)</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-sm">{p.classification || p.group || categoryNames[p.category_id] || '미입력'}</div>
                    {p.brand ? <div className="text-sm text-gray-600 mt-1">{p.brand}</div> : null}
                    <div className="text-sm text-gray-600 mt-2">상품코드 | {p.code || '미입력'}</div>
                    <div className="text-sm text-gray-600 mt-1">배송비정책 | {p.shipping_policy || '미지정'}</div>
                  </td>
                  <td className="px-6 py-6">{Array.isArray(p.variants) ? p.variants.reduce((s: number, v: any) => s + (v.stock || 0), 0) : p.stock || 0}</td>
                  <td className="px-6 py-6">{formatPrice(p.selling_price ?? p.price ?? 0)}</td>
                  <td className="px-6 py-6">{p.created_at ? `${new Date(p.created_at).toLocaleDateString('ko-KR')} ${new Date(p.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` : '-'}</td>
                  <td className="px-6 py-6">
                    <div className="flex gap-2">
                      <Button variant="outline" size="small" onClick={(e) => { e.stopPropagation(); onNavigate?.('products-detail', p.id); }}>상세</Button>
                      <Button variant="primary" size="small" onClick={(e) => { e.stopPropagation(); onNavigate?.('products-edit', p.id); }}>수정</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Batch edit modal (mock) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h3 className="text-lg font-bold mb-4">상품 일괄수정 (목업)</h3>
            <p className="text-sm text-gray-600 mb-4">선택된 상품 수: {selectedCount}</p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={() => setIsBatchModalOpen(false)}>취소</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => { setIsBatchModalOpen(false); setToastMessage('일괄수정(목업)이 완료되었습니다.'); }}>적용</button>
            </div>
          </div>
        </div>
      )}

      {/* Option batch edit modal (mock) */}
      {isOptionBatchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h3 className="text-lg font-bold mb-4">옵션 일괄수정 (목업)</h3>
            <p className="text-sm text-gray-600 mb-4">선택된 상품 수: {selectedCount}</p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={() => setIsOptionBatchModalOpen(false)}>취소</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => { setIsOptionBatchModalOpen(false); setToastMessage('옵션 일괄수정(목업)이 완료되었습니다.'); }}>적용</button>
            </div>
          </div>
        </div>
      )}

      {/* Category manager modal (opened from filter area) */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h3 className="text-lg font-bold mb-4">상품분류 관리 (목업)</h3>
            <p className="text-sm text-gray-600 mb-4">분류 추가/삭제를 시뮬레이션합니다.</p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={() => setIsCategoryManagerOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <div className="fixed right-6 bottom-6 z-50"><div className="bg-black text-white px-4 py-2 rounded shadow-lg text-sm">{toastMessage}</div></div>}
    </Container>
  )
}

export default ProductsListPage
