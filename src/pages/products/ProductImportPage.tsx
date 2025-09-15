
"use client"
import React, { useEffect, useState } from 'react'
import { useToast } from '../../components/ui/Toast'
import { Container, Card, Button, Input } from '../../design-system'
type Platform = 'cafe24' | 'makeshop' | 'smartstore' | 'wisa' | 'godomall'
type ConnectedShop = { id: string; name: string; platform: Platform }
type ExternalProduct = { id: string; externalName: string; externalCode: string; price: number; stockQty: number }

// 카페24 우선 필터 형식 정의
type Cafe24Filters = {
  productNameSearch?: string
  dateFrom?: string
  dateTo?: string
  datePreset?: '1d' | '7d' | '30d' | '90d' | ''
  optionNameApply?: boolean
}

type UploadHistory = {
  id: number
  batchNumber: string
  platform: Platform
  platformName: string
  fileName: string
  uploadDate: string
  totalCount: number
  successCount: number
  errorCount: number
  status: 'processing' | 'completed' | 'failed'
}

export default function ProductImportPage(): JSX.Element {
  const toast = useToast()
  const [connectedShops, setConnectedShops] = useState<ConnectedShop[]>([])
  const [selectedMall, setSelectedMall] = useState<string>('')
  const [activeTab, setActiveTab] = useState<Platform>('cafe24')
  // 필터: 상품명, 등록일자(프리셋/범위), 옵션명 적용 토글
  const [filters, setFilters] = useState<Cafe24Filters>({ productNameSearch: '', dateFrom: '', dateTo: '', datePreset: '', optionNameApply: false })
  const [isLoading, setIsLoading] = useState(false)
  const [externalProducts, setExternalProducts] = useState<ExternalProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  // 등록 이력
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const platforms: { id: Platform; name: string }[] = [
    { id: 'cafe24', name: 'Cafe24' },
    { id: 'wisa', name: 'Wisa' },
    { id: 'smartstore', name: 'SmartStore' },
    { id: 'makeshop', name: 'MakeShop' },
    { id: 'godomall', name: 'GodoMall' },
  ]

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/integrations/connected-shops')
        if (res.ok) {
          const body = await res.json()
          const shops: ConnectedShop[] = body.shops || body || []
          setConnectedShops(shops)
          if (shops.length) { setSelectedMall(shops[0].id); setActiveTab(shops[0].platform) }
          return
        }
      } catch (e) {
        toast?.push('연결된 판매처 로드 실패 — 네트워크 오류', 'error')
        // ignore network errors and fall back to mock
      }
      setConnectedShops([
        { id: 'mock_cafe24_1', name: 'Cafe24 - demo', platform: 'cafe24' },
        { id: 'mock_wisa_1', name: 'Wisa - demo', platform: 'wisa' },
        { id: 'mock_smart_1', name: 'SmartStore - demo', platform: 'smartstore' },
      ])
      setSelectedMall('mock_cafe24_1')
    }
    // 업로드 이력(목업) 로드
    const loadHistory = () => {
      const mockHistory: UploadHistory[] = [
        { id: 1, batchNumber: 'BATCH_2024_001', platform: 'cafe24', platformName: 'Cafe24', fileName: 'cafe24_products_20240301.csv', uploadDate: '2024-03-01 14:30:22', totalCount: 150, successCount: 148, errorCount: 2, status: 'completed' },
        { id: 2, batchNumber: 'BATCH_2024_002', platform: 'makeshop', platformName: 'MakeShop', fileName: 'makeshop_products_20240305.csv', uploadDate: '2024-03-05 11:20:10', totalCount: 80, successCount: 80, errorCount: 0, status: 'completed' },
      ]
      setUploadHistory(mockHistory)
    }
    load()
    loadHistory()
  }, [])

  const handleFetchProducts = async () => {
    if (!selectedMall) return alert('판매처를 선택해주세요')
    setIsLoading(true)
    try {
      const res = await fetch(`/api/integrations/shops/${selectedMall}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filters }) })
      if (res.ok) {
        const body = await res.json()
        setExternalProducts(body.products || body || [])
        setSelectedProducts([])
      } else setExternalProducts([])
    } catch (e) {
      setExternalProducts([])
      toast?.push('상품 조회 중 오류가 발생했습니다. 관리자에게 문의하세요.', 'error')
    } finally { setIsLoading(false) }
  }

  const toggleSelect = (id: string) => setSelectedProducts(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  // datePreset 선택 시 자동으로 dateFrom/dateTo 계산
  useEffect(() => {
    if (!filters.datePreset) return
    const to = new Date()
    let from = new Date()
    switch (filters.datePreset) {
      case '1d':
        // 오늘
        from = new Date(to.getFullYear(), to.getMonth(), to.getDate())
        break
      case '7d':
        from.setDate(to.getDate() - 7)
        break
      case '30d':
        from.setDate(to.getDate() - 30)
        break
      case '90d':
        from.setDate(to.getDate() - 90)
        break
      default:
        return
    }
    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    setFilters(f => ({ ...f, dateFrom: fmt(from), dateTo: fmt(to) }))
  }, [filters.datePreset])

  // 선택 등록 / 전체 등록
  const handleImport = async (mode: 'partial' | 'all') => {
    if (!selectedMall) return alert('판매처를 선택해주세요')
    const productIds = mode === 'partial' ? selectedProducts : externalProducts.map(p => p.id)
    if (productIds.length === 0) return alert('등록할 상품을 선택하세요')
    setIsLoading(true)
    try {
      const res = await fetch(`/api/integrations/shops/${selectedMall}/import`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productIds, mode }) })
      if (res.ok) {
        const body = await res.json()
        // 이력 항목 추가
        setUploadHistory(prev => [{ id: prev.length + 1, batchNumber: body.batchNumber || 'BATCH', platform: activeTab, platformName: activeTab, fileName: `${activeTab}_import`, uploadDate: new Date().toLocaleString('ko-KR'), totalCount: body.total || productIds.length, successCount: body.total || productIds.length, errorCount: 0, status: 'completed' }, ...prev])
        alert(`Import queued: ${body.batchNumber}`)
      } else {
        toast?.push('Import 실패 — 서버 오류', 'error')
      }
    } catch (e) {
      toast?.push('Import 중 네트워크 오류', 'error')
    } finally { setIsLoading(false) }
  }

  return (
    <Container>
      <h1>외부 쇼핑몰 상품 가져오기</h1>

      <Card>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          {platforms.map(p => (
            <Button key={p.id} variant={activeTab === p.id ? 'primary' : 'secondary'} onClick={() => setActiveTab(p.id)}>
              {p.name}
            </Button>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>판매처</label>
          <select value={selectedMall} onChange={e => { setSelectedMall(e.target.value); const shop = connectedShops.find(s => s.id === e.target.value); if (shop) setActiveTab(shop.platform) }}>
            {connectedShops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {activeTab === 'cafe24' && (
          <div>
            <label>상품명</label>
            <Input value={filters.productNameSearch || ''} onChange={(e: any) => setFilters(f => ({ ...f, productNameSearch: e.target.value }))} />

            <div style={{ marginTop: 8 }}>
              <label>등록일자</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input type="date" value={filters.dateFrom || ''} onChange={(e: any) => setFilters(f => ({ ...f, dateFrom: e.target.value, datePreset: '' }))} />
                <span>~</span>
                <Input type="date" value={filters.dateTo || ''} onChange={(e: any) => setFilters(f => ({ ...f, dateTo: e.target.value, datePreset: '' }))} />
                <select value={filters.datePreset || ''} onChange={e => setFilters(f => ({ ...f, datePreset: (e.target.value as any), dateFrom: '', dateTo: '' }))}>
                  <option value="">프리셋</option>
                  <option value="1d">오늘</option>
                  <option value="7d">최근 7일</option>
                  <option value="30d">최근 30일</option>
                  <option value="90d">최근 90일</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <label>옵션명 처리</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <label><input type="checkbox" checked={!!filters.optionNameApply} onChange={e => setFilters(f => ({ ...f, optionNameApply: e.target.checked }))} /> 옵션명 적용</label>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Button onClick={handleFetchProducts}>상품 조회 (Cafe24)</Button>
              <Button variant="secondary" onClick={() => setShowHistory(true)}>등록 이력 보기</Button>
            </div>

            {/*
              핵심 필터 선택 설명 (한국어)
              - 상품명 검색: 사용자가 특정 키워드로 빠르게 필터링할 수 있어 기본적으로 필요합니다.
              - 등록일자(프리셋/범위): 대량 데이터를 좁혀 API 응답량과 속도를 개선합니다.
              - 옵션명 적용 토글: 옵션명이 SKU 매핑에 영향을 주는 경우에만 사용합니다.
            */}
          </div>
        )}

        {/* 다른 플랫폼 필터 블록은 우선 주석 처리했습니다. 필요 시 플랫폼별 API 필드에 맞춰 활성화하세요.
           예시 (주석):
           {activeTab === 'wisa' && (
             <div>위사 필터 (준비 중)</div>
           )}
        */}
      </Card>

      {isLoading && <div>불러오는 중...</div>}

      {!isLoading && externalProducts.length > 0 && (
        <Card>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Button onClick={() => alert('선택 등록')}>선택 등록</Button>
            <Button onClick={() => alert('전체 등록')}>전체 등록</Button>
            <Button variant="secondary" onClick={() => setShowHistory(true)}>등록 이력 보기</Button>
          </div>

          <table>
            <thead>
              <tr>
                <th>선택</th>
                <th>상품명</th>
                <th>상품코드</th>
                <th>판매가</th>
                <th>재고</th>
              </tr>
            </thead>
            <tbody>
              {externalProducts.map(p => (
                <tr key={p.id}>
                  <td><input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                  <td>{p.externalName}</td>
                  <td>{p.externalCode}</td>
                  <td>{p.price}</td>
                  <td>{p.stockQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* 등록 이력 모달 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowHistory(false)} />
            <div style={{ background: 'white', maxWidth: 900, margin: '0 auto', padding: 16, borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>등록 이력</h2>
                <button onClick={() => setShowHistory(false)} className="text-2xl">닫기</button>
              </div>

              {uploadHistory.length > 0 ? (
                <div style={{ overflowX: 'auto', marginTop: 12 }}>
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th>배치번호</th>
                        <th>플랫폼</th>
                        <th>파일명</th>
                        <th>업로드일</th>
                        <th>총건수</th>
                        <th>성공</th>
                        <th>오류</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadHistory.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td>{item.batchNumber}</td>
                          <td>{item.platformName}</td>
                          <td>{item.fileName}</td>
                          <td>{item.uploadDate}</td>
                          <td>{item.totalCount}</td>
                          <td>{item.successCount}</td>
                          <td>{item.errorCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-lg" style={{ marginTop: 12 }}>아직 등록 이력이 없습니다.</div>
              )}

              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <button onClick={() => setShowHistory(false)} className="px-4 py-2 bg-blue-600 text-white rounded">닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

