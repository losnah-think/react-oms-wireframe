import React, { useState, useEffect } from "react";
import { Container, Card } from "../../design-system";
import { mockVendors } from "../../data/mockVendors";

interface Vendor {
  id: string;
  name: string;
  code: string;
  platform: string;
  is_active: boolean;
}

export default function VendorsListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    setVendors(mockVendors);
  }, []);

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">판매처 목록</h1>
            <p className="text-gray-600">연동된 판매처를 확인합니다.</p>
          </div>
        </div>

        <div className="space-y-3">
          {vendors.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">
              등록된 판매처가 없습니다.
            </div>
          )}
          <div className="grid gap-3">
            {vendors.map(vendor => (
              <div key={vendor.id} className="border rounded p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-sm text-gray-500">
                      {vendor.code} • {vendor.platform}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    vendor.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {vendor.is_active ? "연동중" : "연동중지"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                    상세보기
                  </button>
                  <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                    설정
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Container>
  );
}