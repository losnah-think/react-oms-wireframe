// src/features/products/ExternalProductImportPage.tsx
import React, { useState } from 'react';
import { Container, Card, Button, Input } from '../../design-system';
import { useRouter } from 'next/router';

const ExternalProductImportPage: React.FC = () => {
  const router = useRouter();
  const [importSource, setImportSource] = useState('');
  const [importData, setImportData] = useState('');
  const [loading, setLoading] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);

  const handleImport = async () => {
    if (!importSource || !importData) return;

    setLoading(true);
    try {
      // 실제로는 API 호출
      console.log('외부 상품 가져오기:', {
        source: importSource,
        data: importData
      });

      // Mock 결과
      setImportResults({
        total: 10,
        success: 8,
        failed: 2,
        errors: [
          '상품명이 비어있습니다 (ID: 3)',
          '가격 정보가 올바르지 않습니다 (ID: 7)'
        ]
      });
    } catch (error) {
      console.error('가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            외부 상품 가져오기
          </h1>
          <p className="text-gray-600">
            외부 상품 가져오기
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 가져오기 설정 */}
          <Card padding="lg">
            <h2 className="text-xl font-semibold mb-6">가져오기 설정</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가져오기 소스
                </label>
                <select
                  value={importSource}
                  onChange={(e) => setImportSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">소스를 선택하세요</option>
                  <option value="shopify">Shopify</option>
                  <option value="woocommerce">WooCommerce</option>
                  <option value="cafe24">Cafe24</option>
                  <option value="gmarket">G마켓</option>
                  <option value="auction">옥션</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가져오기 데이터
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="가져올 상품 데이터를 입력하거나 붙여넣으세요"
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
          </div>

            <div className="flex gap-2">
                <Button
                  onClick={handleImport}
                  disabled={!importSource || !importData || loading}
                >
                  {loading ? '가져오는 중...' : '가져오기 시작'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  취소
                </Button>
              </div>
            </div>
          </Card>

          {/* 가져오기 결과 */}
          {importResults && (
            <Card padding="lg">
              <h2 className="text-xl font-semibold mb-6">가져오기 결과</h2>
              
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {importResults.total}
                    </div>
                    <div className="text-sm text-blue-800">전체</div>
                      </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {importResults.success}
                    </div>
                    <div className="text-sm text-green-800">성공</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {importResults.failed}
                              </div>
                    <div className="text-sm text-red-800">실패</div>
                              </div>
                            </div>

                {importResults.errors.length > 0 && (
                        <div>
                    <h4 className="font-medium text-gray-900 mb-2">오류 목록</h4>
                              <div className="space-y-2">
                      {importResults.errors.map((error: string, index: number) => (
                        <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                          {error}
                        </div>
                      ))}
                    </div>
                    </div>
                  )}

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => router.push('/products')}
                    className="w-full"
                  >
                    상품 목록으로 이동
                  </Button>
                </div>
            </div>
          </Card>
        )}
      </div>

      </div>
    </Container>
  );
};

export default ExternalProductImportPage;
