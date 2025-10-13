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

// 플랫폼 이름 매핑
const platformNameMap: Record<string, string> = {
  'godomall': '고도몰',
  'wisa': '위사몰',
  'kurly': '마켓컬리',
  'smartstore': '네이버 스마트스토어',
  'cafe24': '카페24',
  'gmarket': 'G마켓',
  'coupang': '쿠팡',
  'naver': '네이버',
};

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
              아직 등록된 판매처가 없습니다
            </div>
          )}
          <div className="grid gap-3">
            {vendors.map(vendor => (
              <div key={vendor.id} className="border rounded p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{vendor.name}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        {platformNameMap[vendor.platform] || vendor.platform}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {vendor.code}
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