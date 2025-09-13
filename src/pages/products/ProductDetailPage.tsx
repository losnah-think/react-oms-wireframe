import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Button,
  Badge,
  Stack,
  Modal,
} from "../../design-system";
import { mockProducts } from "../../data/mockProducts";
import {
  formatDate,
  formatPrice,
  getStockStatus,
} from "../../utils/productUtils";

interface ProductDetailPageProps {
  productId?: string;
  onNavigate?: (page: string, productId?: string) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId: propProductId,
  onNavigate,
}) => {
  // URL 쿼리에서 id 파라미터 자동 수신 (Next.js pages/[id].tsx에서 prop으로 전달)
  const productId =
    propProductId ||
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("id") || "1"
      : "1");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [editingDescription, setEditingDescription] = useState("");

  // 상품 데이터 찾기
  const product = useMemo(() => {
    return mockProducts.find((p) => String(p.id) === String(productId));
  }, [productId]);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate("products-list");
    } else {
      // Next.js pages/[id].tsx에서 직접 접근 시 목록으로 이동
      window.location.href = "/products";
    }
  };

  if (!product) {
    return (
      <Container maxWidth="full" padding="lg">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            상품을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            요청하신 상품이 존재하지 않거나 삭제되었습니다.
          </p>
          <Button variant="primary" onClick={handleBack}>
            상품 목록으로 돌아가기
          </Button>
        </div>
      </Container>
    );
  }

  const marginRate = (
    ((product.selling_price - product.cost_price) / product.selling_price) *
    100
  ).toFixed(0);

  return (
    <Container maxWidth="full" padding="lg" className="bg-gray-50 min-h-screen">
      {/* 상단 액션 바 */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="text-blue-600">
          ← 목록으로
        </Button>
        <Stack direction="row" gap={2}>
          <Button
            variant="outline"
            className="border-blue-500 text-blue-600"
            onClick={() => setShowSettingsModal(true)}
          >
            상품 설정
          </Button>
          <Button
            variant="outline"
            className="border-gray-500 text-gray-600"
            onClick={() => setShowDescriptionModal(true)}
          >
            상품 설명 수정
          </Button>
        </Stack>
      </div>

      {/* 상품 이미지 및 기본 정보 */}
      <Card padding="lg" className="mb-6 shadow-sm">
        <div className="flex gap-8 items-start">
          <div className="w-80 h-80 bg-gray-100 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
            <img
              src={
                "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop"
              }
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop";
              }}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600 mb-4">
              {/* 판매상태는 옵션에서만 표시, 상품에는 없음 */}
              <span>상품코드: {product.code}</span>
              <span>•</span>
              <span>브랜드: {product.brand}</span>
              <span>공급사: {product.supplier_id}</span>
            </div>
            <div className="grid grid-cols-2 gap-6 py-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">판매가</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatPrice(product.selling_price)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">마진률</div>
                <div className="text-xl font-bold text-purple-600">
                  {marginRate}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">총 재고</div>
                <div className="text-xl font-bold text-blue-600">
                  {product.variants
                    ? product.variants
                        .reduce((sum, v) => sum + (v.stock || 0), 0)
                        .toLocaleString()
                    : 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">등록일</div>
                <div className="text-base text-gray-700">
                  {formatDate(product.created_at)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {/* 태그 필드는 mockProducts에 없으므로 미표시 */}
            </div>
          </div>
        </div>
      </Card>

      {/* 옵션 및 상세 정보 */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">상품 옵션</h2>
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                옵션명
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                코드
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                바코드
              </th>
              <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                판매가
              </th>
              <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                공급가
              </th>
              <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">
                재고
              </th>
              <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {product.variants &&
              product.variants.map((variant) => (
                <tr
                  key={variant.id}
                  className="bg-white border-b border-gray-100"
                >
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {variant.variant_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{variant.code}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {variant.barcode1}
                  </td>
                  <td className="px-4 py-3 text-right text-green-700 font-bold">
                    {formatPrice(variant.selling_price)}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700 font-bold">
                    {formatPrice(variant.supply_price)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {variant.stock}개
                  </td>
                  <td className="px-4 py-3 text-center">
                    {variant.is_selling && (
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">
                        판매중
                      </span>
                    )}
                    {!variant.is_selling && (
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs">
                        판매중지
                      </span>
                    )}
                    {variant.is_soldout && (
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs">
                        품절
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>

      {/* 상품 상세 설명 */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">상품 상세 설명</h2>
        <div className="prose max-w-none text-lg text-gray-700">
          {product.description}
        </div>
      </Card>

      {/* 상품 설정 모달 */}
      <Modal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="상품 설정"
      >
        <div className="space-y-4">
          <div className="font-bold text-lg">OMS 상품 설정</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">활성화</div>
              {/* 활성화 상태는 mockProducts에 없음 */}
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">판매중</div>
              {/* 판매중 상태는 mockProducts에 없음 */}
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">품절</div>
              {/* 품절 상태는 mockProducts에 없음 */}
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">면세여부</div>
              <div className="font-semibold">
                {product.is_dutyfree ? "면세" : "과세"}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowSettingsModal(false)}
            >
              닫기
            </Button>
            {/* 실제 설정 변경 기능은 추후 구현 */}
          </div>
        </div>
      </Modal>

      {/* 상품 설명 수정 모달 */}
      <Modal
        open={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        title="상품 설명 수정"
      >
        <div className="space-y-4">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-base"
            rows={6}
            value={editingDescription || product.description}
            onChange={(e) => setEditingDescription(e.target.value)}
            placeholder="상품 설명을 입력하세요"
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowDescriptionModal(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowDescriptionModal(false)}
            >
              저장
            </Button>
            {/* 실제 저장 기능은 추후 구현 */}
          </div>
        </div>
      </Modal>
    </Container>
  );
};

export default ProductDetailPage;
