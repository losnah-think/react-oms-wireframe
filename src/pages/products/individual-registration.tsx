"use client"
import React, { useState } from 'react'
import { Container, Card, Input, Button } from '../../design-system'

export default function IndividualRegistrationPage(){
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [stock, setStock] = useState<number | ''>('')
  const [images, setImages] = useState<File[]>([])

  const onFile = (f?: File | null) => {
    if (!f) return
    setImages(prev => [...prev, f])
  }

  const handleSave = () => {
    alert('개별 상품 등록 (모의): ' + title)
  }

  return (
    <Container maxWidth="full" centered={false} padding="md">
      <h1 className="text-2xl font-bold mb-4">개별 상품 등록</h1>

      <Card className="mb-6" padding="lg">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <label className="block text-sm font-medium mb-1">상품명</label>
            <Input value={title} onChange={(e:any)=>setTitle(e.target.value)} placeholder="상품명을 입력하세요" />

            <label className="block text-sm font-medium mt-4 mb-1">상품 코드 (SKU)</label>
            <Input value={sku} onChange={(e:any)=>setSku(e.target.value)} placeholder="SKU" />

            <div className="flex gap-4 mt-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">판매가</label>
                <Input type="number" value={price as any} onChange={(e:any)=>setPrice(e.target.value ? Number(e.target.value) : '')} />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">재고</label>
                <Input type="number" value={stock as any} onChange={(e:any)=>setStock(e.target.value ? Number(e.target.value) : '')} />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">이미지 업로드</label>
              <input type="file" accept="image/*" onChange={(e)=> onFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              <div className="mt-2 text-sm text-gray-600">{images.length} 개 업로드됨</div>
            </div>

          </div>

          <div className="col-span-4">
            <div className="text-sm text-gray-600">미리보기 영역</div>
            <div className="mt-4 border rounded h-40 bg-gray-50 flex items-center justify-center">미리보기</div>

            <div className="mt-6">
              <Button variant="primary" onClick={handleSave}>저장</Button>
            </div>
          </div>
        </div>
      </Card>
    </Container>
  )
}
