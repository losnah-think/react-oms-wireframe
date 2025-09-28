import React, { useState, useEffect } from "react";
import { Container, Card } from "../../design-system";
import { mockShops } from "../../data/mockShops";

interface Mall {
  id: number;
  shop_no: string;
  name: string;
  site_id: number;
  mall_id: string;
  active: boolean;
}

export default function MallsListPage() {
  const [malls, setMalls] = useState<Mall[]>([]);

  useEffect(() => {
    setMalls(mockShops);
  }, []);

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">쇼핑몰 목록</h1>
            <p className="text-gray-600">연동된 쇼핑몰을 확인합니다.</p>
          </div>
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
                      {mall.shop_no} • {mall.mall_id}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    mall.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {mall.active ? "연동중" : "연동중지"}
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