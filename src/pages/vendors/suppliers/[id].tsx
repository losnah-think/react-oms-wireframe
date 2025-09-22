import React from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import { Container, Card, Button } from '@/design-system'
import * as mockSuppliers from '@/lib/mockSuppliers'
import { listProducts } from '@/lib/products'
import MarketplaceSalesPanel from '@/components/marketplace/MarketplaceSalesPanel'

export default function SupplierDetailPage(){
  const router = useRouter()
  const { id } = router.query
  const [supplier, setSupplier] = React.useState<any>(null)
  const [products, setProducts] = React.useState<any[]>([])

  React.useEffect(()=>{
    if (!id) return
    ;(async()=>{
      const s = await mockSuppliers.getSupplier(String(id))
      setSupplier(s)
      const all = await listProducts(1000, 0)
      // filter mock products by supplier name/id if present in product mock
      const filtered = (all || []).filter((p:any)=> {
        const supplierName = (p as any).supplier || (p as any).supplier_name || ''
        return String(s?.name || '').length ? supplierName.indexOf(String(s.name)) !== -1 : true
      })
      setProducts(filtered)
    })()
  }, [id])

  return (
    <Layout>
      <Container maxWidth="6xl" padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">공급처 상세</h1>
          <div>
            <Button variant="secondary" onClick={()=>router.push('/vendors/suppliers')}>목록</Button>
            <Button className="ml-2" onClick={()=>router.push(`/vendors/suppliers/${id}/edit`)}>수정</Button>
          </div>
        </div>

        <Card padding="lg">
          <h2 className="text-lg font-semibold">기본 정보</h2>
          <div className="mt-2">
            <div><strong>공급처명:</strong> {supplier?.name || '-'}</div>
            <div><strong>코드:</strong> {supplier?.code || '-'}</div>
            <div><strong>상태:</strong> {supplier?.status || '-'}</div>
            <div><strong>담당자:</strong> {supplier?.contact?.person || '-'}</div>
            <div><strong>연락처:</strong> {supplier?.contact?.phone || '-'}</div>
          </div>
        </Card>

        <Card padding="lg" className="mt-4">
          <h2 className="text-lg font-semibold">공급처 상품 목록</h2>
          <div className="mt-3">
            <MarketplaceSalesPanel channels={products.flatMap((p:any)=> {
              if (p.seller_codes && typeof p.seller_codes === 'object') {
                return Object.entries(p.seller_codes).map(([k,v])=> ({ channelId: k, channelName: k, code: String(v), price: p.selling_price || p.price || undefined }));
              }
              if (p.externalMall && p.externalMall.external_sku) {
                return [{ channelId: p.externalMall.platformName || p.externalMall.platform || 'external', channelName: p.externalMall.platformName || p.externalMall.platform || 'external', code: p.externalMall.external_sku, price: p.selling_price || p.price || undefined }];
              }
              return [];
            })} title={`이 공급처의 판매처 목록`} />
          </div>
          <div className="mt-4 space-y-4">
            {products.length === 0 && <div className="text-gray-600">이 공급처에 연결된 상품이 없습니다.</div>}
            {products.map((p:any)=> {
              const variants = p.variants || []
              const totalStock = variants.reduce((sum:any,v:any)=> sum + (v.stock || 0), 0)
              const prices = variants.map((v:any)=> v.selling_price || v.price || 0).filter(Boolean)
              const minPrice = prices.length ? Math.min(...prices) : p.price
              return (
                <div key={p.id} className="border rounded p-4 shadow-sm">
                  <div className="flex items-start">
                    <img src={p.image || '/api/images/placeholder.png'} alt={p.name} className="w-24 h-24 object-cover rounded mr-4" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{p.name}</h3>
                          <div className="text-sm text-gray-600">{p.sku || p.code || '-'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{minPrice ? `${minPrice.toLocaleString()}원` : '-'}</div>
                          <div className="text-sm text-gray-600">재고: {totalStock}</div>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center">
                        <div className="text-sm text-gray-600 mr-4">평점: {p.rating ?? '-'}</div>
                        <div className="text-sm text-gray-600">태그: {(p.tags || []).join(', ')}</div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">{p.description ? <div dangerouslySetInnerHTML={{__html: p.description}} /> : '-'}</div>
                    </div>
                  </div>

                  {variants.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            <th className="border px-2 py-1">옵션</th>
                            <th className="border px-2 py-1">바코드1</th>
                            <th className="border px-2 py-1">바코드2</th>
                            <th className="border px-2 py-1">재고</th>
                            <th className="border px-2 py-1">창고</th>
                            <th className="border px-2 py-1">가격</th>
                            <th className="border px-2 py-1">액션</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v:any)=> (
                            <tr key={v.id} className="hover:bg-gray-50">
                              <td className="border px-2 py-1">{v.variant_name}</td>
                              <td className="border px-2 py-1">{v.barcode1 || '-'}</td>
                              <td className="border px-2 py-1">{v.barcode2 || '-'}</td>
                              <td className="border px-2 py-1">{v.stock ?? '-'}</td>
                              <td className="border px-2 py-1">{v.warehouse_location || '-'}</td>
                              <td className="border px-2 py-1">{v.selling_price ? `${v.selling_price.toLocaleString()}원` : '-'}</td>
                              <td className="border px-2 py-1">
                                <Button size="small" variant="ghost" onClick={()=>router.push(`/products/${p.id}`)}>보기</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </Container>
    </Layout>
  )
}
