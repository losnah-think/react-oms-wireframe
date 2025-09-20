import React, { useState } from 'react';
import { Container, Card, Button } from '../../design-system';
import { mockProducts } from '../../data/mockProducts';

export default function ProductImageGallery({ initialProductId }: { initialProductId?: number }) {
  const products = mockProducts || [];
  const [productId, setProductId] = useState<number | undefined>(initialProductId ?? products[0]?.id);
  const product = products.find((p: any) => p.id === productId) || products[0] || null;
  const images: string[] = Array.isArray(product?.images) ? product.images : [];
  const [activeIndex, setActiveIndex] = useState<number>(0);

  if (!product) return null;

  const openAt = (idx: number) => {
    setActiveIndex(idx);
  };
  const closeModal = () => setActiveIndex(-1);
  const next = (step = 1) => setActiveIndex((i) => (i + step + images.length) % images.length);
  const prev = (step = 1) => setActiveIndex((i) => (i - step + images.length) % images.length);

  return (
    <Container maxWidth="full" padding="md" className="py-6">
      <h2 className="text-2xl font-semibold mb-4">상품 이미지</h2>

      <div className="mb-4">
        <label className="text-sm text-gray-600 mr-2">상품 선택:</label>
        <select
          value={String(productId)}
          onChange={(e) => setProductId(Number(e.target.value))}
          className="border rounded p-2"
        >
          {products.map((p: any) => (
            <option key={p.id} value={p.id}>{`${p.id} · ${p.name} · ${p.brand}`}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card padding="md">
            <h3 className="text-lg font-medium mb-3">이미지 갤러리</h3>
            <div className="mb-3">
              {images[0] ? (
                <div className="w-full bg-white rounded overflow-hidden shadow-sm">
                  <img src={images[0]} alt={`${product.name} main`} className="w-full h-64 object-cover" />
                </div>
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-500">이미지 없음</div>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {images.map((src: string, idx: number) => (
                <button key={idx} onClick={() => openAt(idx)} className="block rounded overflow-hidden shadow-sm bg-white">
                  <img src={src} alt={`${product.name} ${idx + 1}`} className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card padding="md">
            <h3 className="text-lg font-medium mb-3">상품 정보</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div><strong>상품명:</strong> {product.name}</div>
              <div><strong>브랜드:</strong> {product.brand}</div>
              <div><strong>분류:</strong> {product.classification}</div>
              <div><strong>시즌:</strong> {product.season}</div>
              <div><strong>가격:</strong> {product.selling_price?.toLocaleString()}원</div>
            </div>
            <div className="mt-4">
              <Button variant="primary" onClick={() => window.open(`/products/${product.id}`, '_blank')}>상품 상세 열기</Button>
            </div>
          </Card>
        </div>
      </div>

      {activeIndex >= 0 && images[activeIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={closeModal}>
          <div className="max-w-4xl max-h-[90vh] p-4 relative">
            <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="이전">
              ‹
            </button>
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="다음">
              ›
            </button>
            <img src={images[activeIndex]} alt={`active-${activeIndex}`} className="w-full h-auto rounded shadow-lg" />
          </div>
        </div>
      )}
    </Container>
  );
}
