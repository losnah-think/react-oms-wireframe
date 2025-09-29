import React from "react";
import Link from "next/link";
import { Container, Card, Button, Badge, Stack } from "../../design-system";
import VendorsListPage from "./VendorsListPage";
import VendorsIndex from "./VendorsIndex";

const quickLinks = [
  {
    title: "판매처 상품 관리",
    description: "판매처별 상품 현황과 재고, 판매 상태를 실시간으로 점검합니다.",
    href: "/vendors/products",
    badge: "Home > Vendors > Vendor Products",
  },
  {
    title: "판매처 정보 관리",
    description: "연동 판매처의 기본 정보, 담당자, 플랫폼 설정을 한 곳에서 관리합니다.",
    href: "/vendors/info",
    badge: "Home > Vendors > Vendor Info",
  },
  {
    title: "카테고리 매핑",
    description: "판매처 카테고리를 내부 카테고리와 연결해 자동 분류를 구성합니다.",
    href: "/vendors/category-mapping",
    badge: "Home > Vendors > Category Mapping",
  },
];

export default function VendorsHome() {
  return (
    <Container maxWidth="7xl" className="space-y-8 pb-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-gray-900">판매처 센터</h1>
        <p className="text-sm text-gray-600">
          판매처와 쇼핑몰 연동을 관리하고, 상품·카테고리·정보를 빠르게 점검할 수 있는 허브입니다.
        </p>
      </div>

      <Card padding="lg" className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">주요 기능 바로가기</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((link) => (
            <Card key={link.href} padding="lg" className="flex h-full flex-col justify-between gap-4">
              <div className="space-y-2">
                <Badge size="small" variant="secondary">
                  {link.badge}
                </Badge>
                <h3 className="text-lg font-semibold text-gray-900">{link.title}</h3>
                <p className="text-sm text-gray-600">{link.description}</p>
              </div>
              <Link href={link.href} className="inline-flex">
                <Button className="w-full">바로가기</Button>
              </Link>
            </Card>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="lg" className="space-y-4">
          <Stack direction="row" justify="between" align="center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">쇼핑몰 관리</h2>
              <p className="text-xs text-gray-500">연동된 쇼핑몰 목록과 상태를 확인하세요.</p>
            </div>
            <Link href="/vendors/malls" className="inline-flex">
              <Button variant="ghost" size="small">전체 보기</Button>
            </Link>
          </Stack>
          <VendorsListPage />
        </Card>

        <Card padding="lg" className="space-y-4">
          <Stack direction="row" justify="between" align="center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">판매처 관리</h2>
              <p className="text-xs text-gray-500">판매처별 API 연동 현황과 담당자를 관리합니다.</p>
            </div>
            <Link href="/vendors/info" className="inline-flex">
              <Button variant="ghost" size="small">관리 페이지</Button>
            </Link>
          </Stack>
          <VendorsIndex />
        </Card>
      </div>
    </Container>
  );
}

export { default as VendorsIndexPage } from "./VendorsIndex";
