import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '../../design-system';
import EntityTable from '../../components/common/entity/EntityTable';
import TableExportButton from '../../components/common/TableExportButton';
import MallExtraInfoManager from '../../components/malls/MallExtraInfoManager';

type Mall = { id: string; name: string; totalProducts?: number };
type MallProduct = { id: string; productId?: string; name?: string; price?: number; mallPrice?: number; stock?: number; mallStock?: number; syncStatus?: string };
export default function MallProductsPage() {
  const router = useRouter();
  const MALLS: Mall[] = [
    { id: 'naver', name: '네이버 스마트스토어', totalProducts: 1245 },
    { id: 'coupang', name: '쿠팡', totalProducts: 856 },
    { id: 'gmarket', name: 'G마켓', totalProducts: 500 },
    { id: 'auction', name: '옥션', totalProducts: 320 },
    { id: '11st', name: '11번가', totalProducts: 210 },
    { id: 'smartstore', name: '스마트스토어', totalProducts: 150 },
  ];
  const [selectedMall, setSelectedMall] = useState<string | null>(null);
  const [showExtraManager, setShowExtraManager] = useState(false);
  const PRODUCTS: MallProduct[] = [
    { id: '1', productId: 'S1', name: '상품 A', price: 1000, mallPrice: 1000, stock: 10, mallStock: 10, syncStatus: 'synced' },
    { id: '2', productId: 'S2', name: '상품 B', price: 2000, mallPrice: 1800, stock: 5, mallStock: 3, syncStatus: 'price_diff' },
  ];
  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: '상품 정보',
        render: (p: MallProduct) => (
          <div>
            <div className="text-sm font-medium">{p.name}</div>
            <div className="text-xs text-gray-500">코드: {p.productId}</div>
          </div>
        ),
      },
      {
        key: 'price',
        label: '가격 비교',
        render: (p: MallProduct) => (
          <div>
            기준: ₩{p.price?.toLocaleString() ?? p.price}
            <br />
            쇼핑몰: ₩{(p.mallPrice || 0).toLocaleString()}
          </div>
        ),
      },
      {
        key: 'stock',
        label: '재고 비교',
        render: (p: MallProduct) => (
          <div>
            기준: {p.stock}개
            <br />
            쇼핑몰: {(p.mallStock || 0)}개
          </div>
        ),
      },
      {
        key: 'sync',
        label: '동기화 상태',
        render: (p: MallProduct) => <span className="text-sm">{p.syncStatus}</span>,
      },
    ],
    []
  );
  return (
    <Container maxWidth="full">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">쇼핑몰별 상품 관리</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {MALLS.map((m) => (
            <div
              key={m.id}
              onClick={() => router.push(`/malls/MallInfoManagementPage?mallId=${m.id}`)}
              className={`p-3 border cursor-pointer hover:shadow transition ${selectedMall === m.id ? 'border-gray-800 bg-gray-100' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <div className="text-center">
                <div className="text-sm text-gray-900">{m.name}</div>
                <div className="text-xs text-gray-500 mt-1">{m.totalProducts ?? 0}개</div>
              </div>
            </div>
          ))}
        </div>
        {selectedMall ? (
          <>
            <div className="bg-white border rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">{MALLS.find((mm) => mm.id === selectedMall)?.name} 상품 목록</h3>
                <TableExportButton data={PRODUCTS} fileName={`${selectedMall}-products.xlsx`} />
              </div>
              <div className="flex gap-2 mb-4">
                <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => alert('추가 (PoC)')}>+ 추가</button>
                <button className="px-3 py-2 border rounded" onClick={() => setShowExtraManager(true)}>부가 정보 관리</button>
              </div>
            </div>
            <div className="bg-white border rounded-lg overflow-hidden">
              <EntityTable items={PRODUCTS} columns={columns} onOpen={(id) => alert(`열기 ${id}`)} onDelete={(id) => {
                if (confirm('삭제하시겠습니까?')) alert(`삭제 ${id}`);
              }} />
            </div>
            {showExtraManager && (
              <MallExtraInfoManager
                mallId={selectedMall}
                onClose={() => setShowExtraManager(false)}
                onApply={() => {
                  alert('부가정보 저장됨');
                  setShowExtraManager(false);
                }}
              />
            )}
          </>
        ) : (
          <div className="bg-white border rounded-lg p-8 text-center">
            <p className="text-gray-600">상품을 관리할 쇼핑몰을 선택해주세요.</p>
          </div>
        )}
      </div>
    </Container>
  );
}
