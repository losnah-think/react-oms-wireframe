import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 타입 정의
interface BarcodeTemplate {
  id: string;
  name: string;
  description: string;
  format: string;
  fields: BarcodeField[];
  isActive: boolean;
  createdAt: string;
}

interface BarcodeField {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  mapping: string;
  isRequired: boolean;
}

interface Product {
  id: string;
  productCode: string;
  productName: string;
  productCategory: string;
  representativeSellingPrice: number;
  stock: number;
  isSelling: boolean;
}

interface Shipper {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  barcodeRules: BarcodeRule[];
  createdAt: string;
}

interface BarcodeRule {
  id: string;
  shipperId: string;
  templateId: string;
  priority: number;
  conditions: BarcodeCondition[];
  isActive: boolean;
  createdAt: string;
}

interface BarcodeCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn';
  value: string | string[];
  description?: string;
}

// Mock 데이터
const mockShippers: Shipper[] = [
  {
    id: 'SHIPPER-1',
    name: 'CJ대한통운',
    code: 'CJ',
    description: '국내 최대 물류 기업',
    isActive: true,
    barcodeRules: [
      {
        id: 'RULE-1',
        shipperId: 'SHIPPER-1',
        templateId: 'TEMPLATE-1',
        priority: 1,
        conditions: [
          {
            field: 'productCategory',
            operator: 'equals',
            value: '신발',
            description: '신발 카테고리 상품'
          }
        ],
        isActive: true,
        createdAt: '2024-01-01'
      },
      {
        id: 'RULE-1-2',
        shipperId: 'SHIPPER-1',
        templateId: 'TEMPLATE-2',
        priority: 2,
        conditions: [
          {
            field: 'productCategory',
            operator: 'equals',
            value: '의류',
            description: '의류 카테고리 상품'
          }
        ],
        isActive: true,
        createdAt: '2024-01-01'
      },
      {
        id: 'RULE-1-3',
        shipperId: 'SHIPPER-1',
        templateId: 'TEMPLATE-3',
        priority: 3,
        conditions: [
          {
            field: 'productCategory',
            operator: 'in',
            value: ['전자제품', '가전제품'],
            description: '전자제품 및 가전제품'
          }
        ],
        isActive: true,
        createdAt: '2024-01-01'
      }
    ],
    createdAt: '2024-01-01'
  },
  {
    id: 'SHIPPER-2',
    name: '한진택배',
    code: 'HANJIN',
    description: '국내 주요 택배 기업',
    isActive: true,
    barcodeRules: [
      {
        id: 'RULE-2',
        shipperId: 'SHIPPER-2',
        templateId: 'TEMPLATE-2',
        priority: 1,
        conditions: [
          {
            field: 'productCategory',
            operator: 'in',
            value: ['의류', '액세서리'],
            description: '의류 및 액세서리 상품'
          }
        ],
        isActive: true,
        createdAt: '2024-01-01'
      },
      {
        id: 'RULE-2-2',
        shipperId: 'SHIPPER-2',
        templateId: 'TEMPLATE-4',
        priority: 2,
        conditions: [
          {
            field: 'productCategory',
            operator: 'equals',
            value: '화장품',
            description: '화장품 카테고리 상품'
          }
        ],
        isActive: true,
        createdAt: '2024-01-01'
      }
    ],
    createdAt: '2024-01-01'
  }
];

const mockBarcodeTemplates: BarcodeTemplate[] = [
  {
    id: 'TEMPLATE-1',
    name: '기본 상품 바코드',
    description: '상품명, 가격, 바코드가 포함된 기본 템플릿',
    format: 'EAN13',
    fields: [
      {
        id: 'FIELD-1',
        name: '상품명',
        type: 'text',
        position: { x: 10, y: 10 },
        size: { width: 200, height: 20 },
        mapping: 'productName',
        isRequired: true
      },
      {
        id: 'FIELD-2',
        name: '가격',
        type: 'price',
        position: { x: 10, y: 40 },
        size: { width: 100, height: 20 },
        mapping: 'representativeSellingPrice',
        isRequired: true
      }
    ],
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'TEMPLATE-2',
    name: 'QR 코드 템플릿',
    description: 'QR 코드와 상품 정보가 포함된 템플릿',
    format: 'QR',
    fields: [
      {
        id: 'FIELD-3',
        name: 'QR 코드',
        type: 'text',
        position: { x: 10, y: 10 },
        size: { width: 100, height: 100 },
        mapping: 'productCode',
        isRequired: true
      }
    ],
    isActive: true,
    createdAt: '2024-01-02'
  },
  {
    id: 'TEMPLATE-3',
    name: '전자제품 바코드',
    description: '전자제품용 특화 바코드 템플릿',
    format: 'EAN13',
    fields: [
      {
        id: 'FIELD-5',
        name: '제품명',
        type: 'text',
        position: { x: 10, y: 10 },
        size: { width: 200, height: 20 },
        mapping: 'productName',
        isRequired: true
      },
      {
        id: 'FIELD-6',
        name: '모델번호',
        type: 'text',
        position: { x: 10, y: 40 },
        size: { width: 150, height: 20 },
        mapping: 'productCode',
        isRequired: true
      },
      {
        id: 'FIELD-7',
        name: '가격',
        type: 'price',
        position: { x: 10, y: 70 },
        size: { width: 100, height: 20 },
        mapping: 'representativeSellingPrice',
        isRequired: true
      }
    ],
    isActive: true,
    createdAt: '2024-01-03'
  },
  {
    id: 'TEMPLATE-4',
    name: '화장품 바코드',
    description: '화장품용 특화 바코드 템플릿',
    format: 'QR',
    fields: [
      {
        id: 'FIELD-8',
        name: '제품명',
        type: 'text',
        position: { x: 10, y: 10 },
        size: { width: 200, height: 20 },
        mapping: 'productName',
        isRequired: true
      },
      {
        id: 'FIELD-9',
        name: 'QR 코드',
        type: 'text',
        position: { x: 10, y: 40 },
        size: { width: 80, height: 80 },
        mapping: 'productCode',
        isRequired: true
      },
      {
        id: 'FIELD-10',
        name: '용량',
        type: 'text',
        position: { x: 100, y: 40 },
        size: { width: 100, height: 20 },
        mapping: 'productCategory',
        isRequired: false
      }
    ],
    isActive: true,
    createdAt: '2024-01-04'
  }
];

const mockProducts: Product[] = [
  {
    id: 'PROD-1',
    productCode: 'ABC123',
    productName: '나이키 에어맥스',
    productCategory: '신발',
    representativeSellingPrice: 150000,
    stock: 50,
    isSelling: true
  },
  {
    id: 'PROD-2',
    productCode: 'DEF456',
    productName: '아디다스 스탠스미스',
    productCategory: '신발',
    representativeSellingPrice: 120000,
    stock: 30,
    isSelling: true
  },
  {
    id: 'PROD-3',
    productCode: 'GHI789',
    productName: '나이키 티셔츠',
    productCategory: '의류',
    representativeSellingPrice: 45000,
    stock: 100,
    isSelling: true
  }
];

const ProductBarcodeManagementPage: React.FC = () => {
  const router = useRouter();
  
  // 상태 관리
  const [shippers, setShippers] = useState<Shipper[]>(mockShippers);
  const [templates, setTemplates] = useState<BarcodeTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedShipper, setSelectedShipper] = useState<Shipper | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<BarcodeTemplate | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // API에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 바코드 템플릿 가져오기
        const templatesResponse = await fetch('/api/barcodes');
        if (templatesResponse.ok) {
          const apiTemplates = await templatesResponse.json();
          // API 데이터를 컴포넌트 형식으로 변환
          const convertedTemplates = apiTemplates.map((template: any, index: number) => ({
            id: template.id,
            name: template.name,
            description: `API에서 가져온 템플릿 - ${template.name}`,
            format: index % 2 === 0 ? 'EAN13' : 'QR',
            fields: [
              {
                id: `FIELD-${template.id}-1`,
                name: '상품명',
                type: 'text',
                position: { x: 10, y: 10 },
                size: { width: 200, height: 20 },
                mapping: 'productName',
                isRequired: true
              },
              {
                id: `FIELD-${template.id}-2`,
                name: '바코드',
                type: 'text',
                position: { x: 10, y: 40 },
                size: { width: 150, height: 30 },
                mapping: 'productCode',
                isRequired: true
              }
            ],
            isActive: true,
            createdAt: new Date().toISOString().split('T')[0]
          }));
          setTemplates(convertedTemplates);
        } else {
          // API 실패 시 Mock 데이터 사용
          setTemplates(mockBarcodeTemplates);
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        // 에러 시 Mock 데이터 사용
        setTemplates(mockBarcodeTemplates);
        setToastMessage('API 연결 실패. Mock 데이터를 사용합니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 화주사별 사용 가능한 템플릿 필터링
  const getAvailableTemplates = (shipper: Shipper | null) => {
    if (!shipper) return []; // 화주사가 선택되지 않으면 템플릿을 보여주지 않음
    
    const shipperTemplateIds = shipper.barcodeRules
      .filter(rule => rule.isActive)
      .map(rule => rule.templateId);
    
    return templates.filter(template => 
      shipperTemplateIds.includes(template.id)
    );
  };

  // 상품에 적용 가능한 템플릿 찾기
  const findApplicableTemplate = (product: Product, shipper: Shipper) => {
    const activeRules = shipper.barcodeRules
      .filter(rule => rule.isActive)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of activeRules) {
      const matchesAllConditions = rule.conditions.every(condition => {
        const productValue = product[condition.field as keyof Product];
        
        switch (condition.operator) {
          case 'equals':
            return String(productValue) === String(condition.value);
          case 'contains':
            return String(productValue).includes(String(condition.value));
          case 'startsWith':
            return String(productValue).startsWith(String(condition.value));
          case 'endsWith':
            return String(productValue).endsWith(String(condition.value));
          case 'in':
            return Array.isArray(condition.value) && condition.value.includes(String(productValue));
          case 'notIn':
            return Array.isArray(condition.value) && !condition.value.includes(String(productValue));
          default:
            return false;
        }
      });

      if (matchesAllConditions) {
        return templates.find(template => template.id === rule.templateId);
      }
    }

    return null;
  };

  // 핸들러 함수들
  const handleShipperSelect = (shipper: Shipper) => {
    setSelectedShipper(shipper);
    setSelectedTemplate(null);
    setSelectedProducts([]);
    
    // 화주사 선택 시 해당 화주사의 첫 번째 템플릿을 자동으로 선택
    const availableTemplates = getAvailableTemplates(shipper);
    if (availableTemplates.length > 0) {
      setSelectedTemplate(availableTemplates[0]);
    }
  };

  const handleTemplateSelect = (template: BarcodeTemplate) => {
    setSelectedTemplate(template);
    setSelectedProducts([]);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // 토스트 메시지 자동 숨김
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">상품 바코드 관리</h1>
              <p className="text-sm text-gray-600 mt-1">
                화주사별 바코드 규칙을 설정하고 상품에 바코드를 생성하세요
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/products')}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 inline-flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                상품 목록으로
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 화주사 선택 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">화주사 선택</h3>
                  <p className="text-sm text-gray-600 mt-1">바코드 규칙을 적용할 화주사를 선택하세요</p>
                </div>
                <div className="p-4 space-y-3">
                  {shippers.map((shipper) => (
                    <button
                      key={shipper.id}
                      onClick={() => handleShipperSelect(shipper)}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                        selectedShipper?.id === shipper.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{shipper.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{shipper.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {shipper.code}
                            </span>
                            <span className="text-xs text-gray-500">
                              {shipper.barcodeRules.filter(rule => rule.isActive).length}개 규칙
                            </span>
                          </div>
                        </div>
                        {selectedShipper?.id === shipper.id && (
                          <div className="text-blue-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 바코드 템플릿 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">바코드 템플릿</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedShipper 
                      ? `${selectedShipper.name}에 사용 가능한 템플릿 (${getAvailableTemplates(selectedShipper).length}개)`
                      : '화주사를 먼저 선택하세요'
                    }
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {selectedShipper ? (
                    getAvailableTemplates(selectedShipper).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                          selectedTemplate?.id === template.id
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                {template.format}
                              </span>
                              <span className="text-xs text-gray-500">
                                {template.fields.length}개 필드
                              </span>
                            </div>
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <div className="text-blue-500">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-3">🏢</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        화주사를 선택해주세요
                      </h3>
                      <p className="text-gray-600 text-sm">
                        화주사를 선택하면 해당 화주사에 설정된 바코드 규칙에 따라<br/>
                        사용 가능한 템플릿만 필터링되어 표시됩니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 상품 선택 및 매핑 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">상품 선택 및 매핑</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedTemplate ? '바코드를 생성할 상품을 선택하세요' : '템플릿을 먼저 선택하세요'}
                      </p>
                    </div>
                    {selectedTemplate && selectedProducts.length > 0 && (
                      <button
                        onClick={() => {
                          console.log('바코드 생성:', {
                            template: selectedTemplate,
                            products: selectedProducts,
                            shipper: selectedShipper
                          });
                          setToastMessage(`${selectedProducts.length}개 상품의 바코드가 생성되었습니다.`);
                        }}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        바코드 생성
                      </button>
                    )}
                  </div>
                </div>
                
                {selectedTemplate ? (
                  <div className="p-4">
                    <div className="space-y-3">
                      {products.map((product) => {
                        const applicableTemplate = findApplicableTemplate(product, selectedShipper!);
                        const isApplicable = applicableTemplate?.id === selectedTemplate.id;
                        
                        return (
                          <div
                            key={product.id}
                            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                              selectedProducts.includes(product.id)
                                ? 'border-blue-500 bg-blue-50'
                                : isApplicable
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleProductSelect(product.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedProducts.includes(product.id)}
                                  onChange={() => handleProductSelect(product.id)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div>
                                  <h4 className="font-medium text-gray-900">{product.productName}</h4>
                                  <p className="text-sm text-gray-600">
                                    {product.productCode} • {product.productCategory}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {product.representativeSellingPrice.toLocaleString()}원 • 재고 {product.stock}개
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isApplicable && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                    규칙 적용됨
                                  </span>
                                )}
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  product.isSelling 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {product.isSelling ? '판매중' : '판매중지'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 text-4xl mb-3">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      템플릿을 선택해주세요
                    </h3>
                    <p className="text-gray-600">
                      좌측에서 템플릿을 선택하면 상품 목록이 표시됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-slide-up z-50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage("")}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductBarcodeManagementPage;