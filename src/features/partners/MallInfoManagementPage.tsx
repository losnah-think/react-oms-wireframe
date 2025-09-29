import React from "react";
import { Container, Card, Button, Badge } from "../../design-system";
import { listVendors, MockVendor } from "../../data/mockVendors";

const platformLabels: Record<MockVendor["platform"], string> = {
  godomall: "고도몰",
  wisa: "위사",
  kurly: "마켓컬리",
  smartstore: "스마트스토어",
  cafe24: "카페24",
  gmarket: "G마켓",
  coupang: "쿠팡",
  naver: "네이버",
};

export default function MallInfoManagementPage() {
  const vendors = React.useMemo(() => listVendors(), []);

  return (
    <Container maxWidth="7xl" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">입점몰 정보 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            연동된 입점몰의 기본 정보를 확인하고 관리합니다.
          </p>
        </div>
        <Button variant="primary">입점몰 추가</Button>
      </div>

      <Card padding="lg" className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">등록된 입점몰</h2>
            <p className="text-sm text-gray-500">총 {vendors.length}개의 입점몰이 연동되어 있습니다.</p>
          </div>
          <Button variant="outline" size="small">엑셀 다운로드</Button>
        </header>

        <div className="grid gap-3">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 transition hover:border-primary-200 hover:bg-primary-50/40 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
                <div>
                  <p className="text-base font-semibold text-gray-900">{vendor.name}</p>
                  <p className="text-sm text-gray-500">
                    {vendor.code} · {platformLabels[vendor.platform]}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="rounded-md bg-gray-100 px-2.5 py-1">
                    등록일 {new Date(vendor.created_at).toLocaleDateString()}
                  </span>
                  <span className="rounded-md bg-gray-100 px-2.5 py-1">
                    최근 수정 {new Date(vendor.updated_at).toLocaleDateString()}
                  </span>
                  {((vendor.settings as any)?.site) && (
                    <span className="rounded-md bg-gray-100 px-2.5 py-1">
                      연동 사이트 {String((vendor.settings as any).site)}
                    </span>
                  )}
                  {((vendor.settings as any)?.loginId) && (
                    <span className="rounded-md bg-gray-100 px-2.5 py-1">
                      관리자 ID {String((vendor.settings as any).loginId)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={vendor.is_active ? "success" : "secondary"} size="small">
                  {vendor.is_active ? "연동중" : "중지"}
                </Badge>
                <Button variant="ghost" size="small">
                  상세 보기
                </Button>
                <Button variant="outline" size="small">
                  설정 변경
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Container>
  );
}
