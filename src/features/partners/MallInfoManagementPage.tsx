import React, { useState, useEffect } from "react";
import { Container, Card } from "../../design-system";
import { mockShopSites } from "../../data/mockShops";

interface MallInfo {
  id: number;
  name: string;
  basic_main_url: string;
  site_type: string;
  active: boolean;
}

export default function MallInfoManagementPage() {
  const [malls, setMalls] = useState<MallInfo[]>([]);

  useEffect(() => {
    setMalls(mockShopSites);
  }, []);

  const getSiteTypeName = (type: string) => {
    const names = {
      cafe24: '카페24',
      makeshop: '메이크샵',
      storefarm: '스토어팜',
      gsshop: 'GS SHOP',
      interpark: '인터파크'
    };
    return names[type as keyof typeof names] || type;
  };

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">쇼핑몰 정보 관리</h1>
            <p className="text-gray-600">연동할 쇼핑몰의 정보를 관리합니다.</p>
          </div>
          <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
            쇼핑몰 추가
          </button>
        </div>

        <div className="space-y-3">
          {malls.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">
              등록된 쇼핑몰이 없습니다.
            </div>
          )}
          <div className="grid gap-3">
            {malls.map(mall => (
              <div key={mall.id} className="border rounded p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{mall.name}</div>
                    <div className="text-sm text-gray-500">
                      {mall.basic_main_url} • {getSiteTypeName(mall.site_type)}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    mall.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {mall.active ? "활성" : "비활성"}
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