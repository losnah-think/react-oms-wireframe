import React, { useState, useEffect } from "react";
import { Container, Card } from "../../design-system";
import { mockVendors } from "../../data/mockVendors";

interface VendorInfo {
  id: string;
  name: string;
  code: string;
  platform: string;
  is_active: boolean;
}

export default function VendorInfoManagementPage() {
  const [vendors, setVendors] = useState<VendorInfo[]>([]);

  useEffect(() => {
    setVendors(mockVendors);
  }, []);

  const getPlatformName = (platform: string) => {
    const names = {
      cafe24: '카페24',
      gmarket: 'G마켓',
      coupang: '쿠팡',
      naver: '네이버'
    };
    return names[platform as keyof typeof names] || platform;
  };

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">판매처 정보 관리</h1>
            <p className="text-gray-600">연동할 판매처의 정보를 관리합니다.</p>
          </div>
          <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
            판매처 추가
          </button>
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
                      {vendor.code} • {getPlatformName(vendor.platform)}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    vendor.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {vendor.is_active ? "활성" : "비활성"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                    편집
                  </button>
                  <button className="px-3 py-1 border rounded text-sm text-red-600 hover:bg-red-50">
                    삭제
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