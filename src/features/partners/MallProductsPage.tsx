import React, { useState, useEffect } from "react";
import { Container, Card } from "../../design-system";
import { mockProducts } from "../../data/mockProducts";
import { mockShops } from "../../data/mockShops";

interface MallProduct {
  id: number;
  name: string;
  code: string;
  brand: string;
  classificationPath: string[];
  selling_price: number;
  stock: number;
  is_selling: boolean;
}

export default function MallProductsPage() {
  const [products, setProducts] = useState<MallProduct[]>([]);
  const [selectedMall, setSelectedMall] = useState<string>("");

  useEffect(() => {
    // Take first 20 products as sample
    setProducts(mockProducts.slice(0, 20));
  }, []);

  const filteredProducts = selectedMall
    ? products.filter(p => p.brand === selectedMall) // Simple filter by brand as mall
    : products;

  const malls = Array.from(new Set(products.map(p => p.brand)))
    .map(brand => ({ id: brand, name: brand }));

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">쇼핑몰 상품 관리</h1>
            <p className="text-gray-600">각 쇼핑몰의 상품을 관리합니다.</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            브랜드 필터 (샘플)
          </label>
          <select
            value={selectedMall}
            onChange={(e) => setSelectedMall(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">전체 브랜드</option>
            {malls.map(mall => (
              <option key={mall.id} value={mall.id}>{mall.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {filteredProducts.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">
              상품이 없습니다.
            </div>
          )}
          <div className="grid gap-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="border rounded p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.code} • {product.brand} • {product.classificationPath.join(' > ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₩{product.selling_price.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">재고: {product.stock}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      product.is_selling
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {product.is_selling ? "판매중" : "품절"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                      상세보기
                    </button>
                    <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                      편집
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Container>
  );
}