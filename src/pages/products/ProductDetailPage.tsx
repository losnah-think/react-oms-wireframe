import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Badge,
  Stack,
  Modal,
} from "../../design-system";
import Toast from '../../components/Toast'
import { normalizeProductGroup } from '../../utils/groupUtils'
import { useRouter } from 'next/router'
import {
  formatDate,
  formatPrice,
  getStockStatus,
} from "../../utils/productUtils";

interface ProductDetailPageProps {
  productId?: string;
  onNavigate?: (page: string, productId?: string) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId: propProductId,
  onNavigate,
}) => {
  // id 추출 우선순위: prop -> Next.js router.query -> query string ?id= -> last path segment -> fallback
  const router = useRouter()
  const fromRouter = router?.query?.id ? String(router.query.id) : undefined
  const fromSearch = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") || undefined : undefined
  const fromPath = typeof window !== "undefined" ? ((): string | undefined => {
    try {
      const segs = window.location.pathname.split('/').filter(Boolean)
      if (segs.length === 0) return undefined
      // assume last segment is id when path looks like /products/123
      return segs[segs.length - 1]
    } catch (e) {
      return undefined
    }
  })() : undefined

  const productId = propProductId || fromRouter || fromSearch || fromPath || "1"
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [editingDescription, setEditingDescription] = useState("");
  const [toast, setToast] = useState<string | null>(null)

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [classificationNames, setClassificationNames] = useState<Record<string,string>>({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    console.debug('[ProductDetailPage] fetching product id=', productId)
    fetch(`/api/products/${productId}`)
      .then(async (r) => {
        if (!mounted) return
        if (!r.ok) {
          console.warn('[ProductDetailPage] product fetch non-ok status=', r.status)
          const pid = Number(productId) || Date.now()
          setProduct({
            id: pid,
            code: `PRD-PLACEHOLDER-${pid}`,
            name: `샘플 상품 (${pid})`,
            selling_price: 0,
            supply_price: 0,
            cost_price: 0,
            images: [],
            variants: [],
            description: '데모 환경: 실제 데이터가 없습니다.',
          })
          return
        }
  const data = await r.json()
  // Some API routes return `{ product }`, others return the raw product.
  const resolved = data?.product ?? data
  console.debug('[ProductDetailPage] fetched data=', resolved)
  setProduct(resolved || null)
      })
      .catch((e) => {
        console.error('[ProductDetailPage] fetch error', e)
        if (!mounted) return
        const pid = Number(productId) || Date.now()
        setProduct({
          id: pid,
          code: `PRD-PLACEHOLDER-${pid}`,
          name: `샘플 상품 (${pid})`,
          selling_price: 0,
          supply_price: 0,
          cost_price: 0,
          images: [],
          variants: [],
          description: '데모 환경: 실제 데이터가 없습니다. (네트워크 오류)',
        })
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [productId])

  // normalize product when fetched
  useEffect(() => {
    if (!product) return
    setProduct((prev:any) => normalizeProductGroup(prev))
  }, [product?.id])

  // Debug: log when loading finishes but product is null
  useEffect(() => {
    if (!loading && !product) {
      console.warn('[ProductDetailPage] finished loading but product is null for id=', productId)
    }
  }, [loading, product, productId])

  // load classification names for display
  useEffect(() => {
    let mounted = true
    fetch('/api/meta/classifications')
      .then(r => r.json())
      .then((body) => {
        if (!mounted) return
        const map: Record<string,string> = {}
        const walk = (nodes: any[]) => {
          nodes.forEach((n: any) => {
            map[n.id] = n.name
            if (n.children) walk(n.children)
          })
        }
        walk(body.classifications || [])
        setClassificationNames(map)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const handleBack = () => {
    if (onNavigate) {
      onNavigate("products-list");
    } else {
      // Next.js pages/[id].tsx에서 직접 접근 시 목록으로 이동
      window.location.href = "/products";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="full" padding="lg">
        <div className="text-center py-12">로딩 중...</div>
      </Container>
    )
  }

  if (!product) {
    return (
      <Container maxWidth="full" padding="lg">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            상품을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            요청하신 상품이 존재하지 않거나 삭제되었습니다.
          </p>
          <Button variant="primary" onClick={handleBack}>
            상품 목록으로 돌아가기
          </Button>
        </div>
      </Container>
    );
  }

  const marginRate = (
    ((product.selling_price - product.cost_price) / product.selling_price) *
    100
  ).toFixed(0);

  return (
    <>
    <Container maxWidth="full" padding="lg" className="bg-gray-50 min-h-screen">
      {/* 상단 액션 바 */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="text-blue-600">
          ← 목록으로
        </Button>
  <Stack direction="row" gap={2}>
          <Button
            variant="outline"
            className="border-blue-500 text-blue-600"
            onClick={() => setShowSettingsModal(true)}
          >
            상품 설정
          </Button>
          <Button
            variant="outline"
            className="border-gray-500 text-gray-600"
            onClick={() => setShowDescriptionModal(true)}
          >
            상품 설명 수정
          </Button>
          <Button variant="primary" onClick={() => onNavigate?.('products-edit', product.id)}>수정</Button>
        </Stack>
      </div>

      {/* 등록/수정 정보 */}
      <Card padding="md" className="mb-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <div>등록아이디: <strong>{product?.created_by || product?.registered_by || 'api_test'}</strong> | 등록일자 : {product?.created_at ? `${new Date(product.created_at).toLocaleDateString('ko-KR')} ${new Date(product.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` : '-'}</div>
            <div>최종수정아이디: <strong>{product?.updated_by || product?.modified_by || product?.created_by || 'api_test'}</strong> | 최종수정일자 : {product?.updated_at ? `${new Date(product.updated_at).toLocaleDateString('ko-KR')} ${new Date(product.updated_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` : '-'}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="small" onClick={() => {
              const now = new Date().toISOString()
              setProduct((prev: any) => ({ ...(prev || {}), created_at: now }))
            }}>상품등록일자 오늘로 갱신</Button>
          </div>
        </div>
      </Card>

      {/* 상품 이미지 및 기본 정보 — TABLE VIEW */}
      <Card padding="lg" className="mb-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-48" />
              <col />
            </colgroup>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-600 align-top">대표 이미지</td>
                <td className="px-4 py-3">
                  <div className="w-48 h-48 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={Array.isArray(product.images) && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop' }}
                    />
                  </div>
                </td>
              </tr>

              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-600">상품명</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{product.name}</td>
              </tr>

              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-600">기본 정보</td>
                <td className="px-4 py-3 text-gray-700">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div>상품ID: {product.id}</div>
                    <div>코드: {product.code}</div>
                    <div>브랜드: {product.brand || '-'}</div>
                    <div>공급사ID: {product.supplier_id || '-'}</div>
                  </div>
                </td>
              </tr>

              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-600">가격 / 재고</td>
                <td className="px-4 py-3 text-gray-700">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>판매가: <strong>{formatPrice(product.selling_price)}</strong></div>
                    <div>원가: {formatPrice(product.cost_price)}</div>
                    <div>공급가: {formatPrice(product.supply_price)}</div>
                    <div>총재고: <strong>{product.variants ? (product.variants as any[]).reduce((s:number,v:any)=>s+(v.stock||0),0).toLocaleString() : '0'}</strong></div>
                    <div>마진률: <strong>{marginRate}%</strong></div>
                    <div>등록일: {formatDate(product.created_at)}</div>
                  </div>
                </td>
              </tr>

              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-600">추가 속성</td>
                <td className="px-4 py-3 text-gray-700 grid grid-cols-2 gap-2 text-sm">
                  <div>공급처: <strong>{product?.supplier_name || '자사'}</strong></div>
                  <div>원산지: {product?.origin_country || '미지정'}</div>
                  <div>사입상품명: {product?.purchase_name || '미입력'}</div>
                  <div>배송비정책: {product?.shipping_policy || '미지정'}</div>
                  <div>HS Code: {product.hs_code || '-'}</div>
                  <div>박스당수량: {product.box_qty || '-'}</div>
                  <div>재고연동: {product.variants && product.variants[0] && product.variants[0].is_stock_linked ? '연동' : '미연동'}</div>
                  <div>분류: {classificationNames[product.classification_id] || product.classification || '미지정'}</div>
                  <div>외부몰 데이터: {product.externalMall?.platform || product.externalMall?.platformName || '없음'}</div>
                </td>
              </tr>

              <tr className="border-b">
                <td className="px-4 py-3 text-sm text-gray-600 align-top">태그</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {product.tags && product.tags.map((t: string) => (
                      <Badge key={t} variant="neutral">{t}</Badge>
                    ))}
                  </div>
                </td>
              </tr>

              {/* 상세 설명은 아래의 상세 설명 카드에서 보여줍니다 (중복 제거) */}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 옵션 및 상세 정보 */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">상품 옵션</h2>
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                옵션명
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                코드
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                바코드1
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                바코드2
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                바코드3
              </th>
              <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                판매가
              </th>
              <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                원가
              </th>
              <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                공급가
              </th>
              <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                재고
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                위치
              </th>
              <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
              {product.variants && (product.variants as any[]).map((variant: any) => (
                <tr key={variant.id} className="bg-white border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-900">{variant.variant_name}</td>
                  <td className="px-4 py-3 text-gray-700">{variant.code}</td>
                  <td className="px-4 py-3 text-gray-700">{variant.barcode1}</td>
                  <td className="px-4 py-3 text-gray-700">{variant.barcode2 || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{variant.barcode3 || '-'}</td>
                  <td className="px-4 py-3 text-right text-green-700 font-bold">{formatPrice(variant.selling_price)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatPrice(variant.cost_price)}</td>
                  <td className="px-4 py-3 text-right text-blue-700 font-bold">{formatPrice(variant.supply_price)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{variant.stock}개</td>
                  <td className="px-4 py-3 text-left text-gray-700">{variant.warehouse_location || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-1 justify-center">
                      {variant.is_selling ? <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">판매중</span> : <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">판매중지</span>}
                      {variant.is_soldout ? <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs">품절</span> : null}
                      {variant.is_for_sale === false ? <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs">미판매</span> : null}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>

      {/* 추가 상세 정보: 이미지, 메모, 사이즈/무게 */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">추가 정보</h2>
        <div className="grid grid-cols-3 gap-4">
          {product.images && product.images.map((src: string, idx: number) => (
            <div key={idx} className="w-full h-48 bg-gray-100 rounded overflow-hidden">
              <img src={src} className="w-full h-full object-cover" alt={`image-${idx}`} />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">메모</div>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {product.memos && product.memos.map((m: string, idx: number) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-700">
          <div>가로(cm): {product.variants && product.variants[0] && product.variants[0].width_cm}</div>
          <div>세로(cm): {product.variants && product.variants[0] && product.variants[0].height_cm}</div>
          <div>높이(cm): {product.variants && product.variants[0] && product.variants[0].depth_cm}</div>
          <div>무게(g): {product.variants && product.variants[0] && product.variants[0].weight_g}</div>
          <div>부피(cc): {product.variants && product.variants[0] && product.variants[0].volume_cc}</div>
          <div>원산지: {product.origin_country}</div>
        </div>
      </Card>

      {/* 상품 상세 설명 */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">상품 상세 설명</h2>
        <div className="prose max-w-none text-lg text-gray-700">
          {product.description}
        </div>
      </Card>

      {/* 상품 설정 모달 */}
      <Modal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="상품 설정"
      >
        <div className="space-y-4">
          <div className="font-bold text-lg">OMS 상품 설정</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">활성화</div>
              {/* 활성화 상태는 mockProducts에 없음 */}
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">판매중</div>
              {/* 판매중 상태는 mockProducts에 없음 */}
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">품절</div>
              {/* 품절 상태는 mockProducts에 없음 */}
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">면세여부</div>
              <div className="font-semibold">
                {product.is_dutyfree ? "면세" : "과세"}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowSettingsModal(false)}
            >
              닫기
            </Button>
            {/* 실제 설정 변경 기능은 추후 구현 */}
          </div>
        </div>
      </Modal>

      {/* 상품 설명 수정 모달 */}
      <Modal
        open={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        title="상품 설명 수정"
      >
        <div className="space-y-4">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-base"
            rows={6}
              value={editingDescription !== '' ? editingDescription : (product.description || '')}
              onChange={(e) => setEditingDescription(e.target.value)}
            placeholder="상품 설명을 입력하세요"
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowDescriptionModal(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
                onClick={() => {
                  // save to client state for immediate preview
                  setProduct((prev: any) => ({ ...(prev || {}), description: editingDescription || prev?.description }))
                  setShowDescriptionModal(false)
                  setToast('상품 설명이 저장되었습니다.')
                }}
            >
              저장
            </Button>
            {/* 실제 저장 기능은 추후 구현 */}
          </div>
        </div>
      </Modal>
    </Container>
    {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default ProductDetailPage;
