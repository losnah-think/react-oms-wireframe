import React from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import { Container, Card, Button, Input } from '@/design-system'
import * as mockSuppliers from '@/lib/mockSuppliers'

export default function NewSupplierPage(){
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [code, setCode] = React.useState('')
  const [site, setSite] = React.useState('')
  const [loginId, setLoginId] = React.useState('')
  const [loginPw, setLoginPw] = React.useState('')
  const [orderMethod, setOrderMethod] = React.useState('auto')
  const [shippingDisplay, setShippingDisplay] = React.useState('상품별 보냄')
  const [overseasUse, setOverseasUse] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  async function handleSave(){
    if (!name) return alert('공급처명을 입력하세요')
    setSaving(true)
    try {
      const payload = { name, code, site, contact: { person: '', phone: '' }, meta: { loginId, orderMethod, shippingDisplay, overseasUse } }
      await mockSuppliers.createSupplier(payload)
      router.push('/vendors/suppliers')
    } finally { setSaving(false) }
  }

  return (
    <Layout>
      <Container maxWidth="6xl" padding="lg">
        <h1 className="text-2xl font-bold mb-4">새 공급처 등록</h1>

        <Card padding="lg">
          <h2 className="font-semibold">판매처 정보</h2>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm">판매처 구분</label>
              <select value={site} onChange={(e:any)=>setSite(e.target.value)} className="w-full border rounded px-2 py-1">
                <option value="">선택</option>
                <option value="naver">네이버</option>
                <option value="cafe24">카페24</option>
                <option value="custom">커스텀</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">판매처명</label>
              <Input value={name} onChange={(e:any)=>setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm">자체판매처코드</label>
              <Input value={code} onChange={(e:any)=>setCode(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm">수수료율</label>
              <Input placeholder="0 %" />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">로그인 정보</h3>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <label className="block text-sm">로그인 아이디</label>
                <Input value={loginId} onChange={(e:any)=>setLoginId(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">로그인 비밀번호</label>
                <Input type="password" value={loginPw} onChange={(e:any)=>setLoginPw(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">로그인 비밀번호 확인</label>
                <Input type="password" placeholder="비밀번호 확인" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">주문 / CS</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm">주문처리방법</label>
                <select value={orderMethod} onChange={(e:any)=>setOrderMethod(e.target.value)} className="w-full border rounded px-2 py-1">
                  <option value="auto">전체 판매처 주문연동</option>
                  <option value="manual">수동</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">상품 페이지 URL</label>
                <Input placeholder="http:// 또는 https:// 로 시작" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">배송 / 출고 설정</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm">송장출력 상품형태</label>
                <select value={shippingDisplay} onChange={(e:any)=>setShippingDisplay(e.target.value)} className="w-full border rounded px-2 py-1">
                  <option>상품별 보냄</option>
                  <option>합포장</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">송장 출력 수량 표시여부</label>
                <select className="w-full border rounded px-2 py-1">
                  <option>수량 표시</option>
                  <option>수량 미표시</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">해외배송</h3>
            <div className="flex items-center mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input type="checkbox" checked={overseasUse} onChange={(e:any)=>setOverseasUse(e.target.checked)} />
                <span className="ml-2">셀메이트 해외배송 서비스</span>
              </label>
              <select className="w-full border rounded px-2 py-1">
                <option>선택안함</option>
                <option>사용안함</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="secondary" onClick={()=>router.push('/vendors/suppliers')}>취소</Button>
            <Button variant="primary" className="ml-2" onClick={handleSave} disabled={saving}>{saving ? '저장 중...' : '등록'}</Button>
          </div>
        </Card>
      </Container>
    </Layout>
  )
}
