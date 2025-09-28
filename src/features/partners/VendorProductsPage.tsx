import React, { useState, useEffect } from "react";
import { Container, Card } from "../../design-system";
import { mockProducts } from "../../data/mockProducts";
import { mockVendors } from "../../data/mockVendors";

interface VendorProduct {
  id: number;
  name: string;
  code: string;
  vendor: string;
  classificationPath: string[];
  selling_price: number;
  stock: number;
  is_selling: boolean;
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");

  useEffect(() => {
    // Take first 20 products as sample
    setProducts(mockProducts.slice(0, 20));
  }, []);

  const filteredProducts = selectedVendor
    ? products.filter(p => p.vendor === selectedVendor)
    : products;

  const vendors = Array.from(new Set(products.map(p => p.vendor)))
    .map(vendor => ({ id: vendor, name: vendor }));

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">판매처 상품 관리</h1>
            <p className="text-gray-600">각 판매처의 상품을 관리합니다.</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            판매처 필터
          </label>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">전체 판매처</option>
            {vendors.map(vendor => (
              <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
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
                        {product.code} • {product.vendor} • {product.classificationPath.join(' > ')}
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