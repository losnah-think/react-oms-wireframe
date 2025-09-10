import React, { useState, useEffect } from 'react';

const ProductCsvUploadPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [detectedPlatform, setDetectedPlatform] = useState(null);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [fileAnalysis, setFileAnalysis] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // 6가지 플랫폼 정의 (자사, 카페24, 위사몰, 네이버 스마트스토어, 메이크샵, 고도몰5)
  const platforms = [
    {
      id: 'company',
      name: '자사',
      logo: '□',
      description: '자사 쇼핑몰',
      detectionKeywords: ['상품코드', '상품명', '판매가', '공급가', '카테고리', '브랜드', '재고수량', '상품설명'],
      requiredFields: ['상품코드', '상품명', '판매가'],
      confidence: 0
    },
    {
      id: 'cafe24',
      name: 'Cafe24',
      logo: '□',
      description: 'Cafe24 쇼핑몰',
      detectionKeywords: ['상품코드', '상품명', '판매가', '공급가', '카테고리', '브랜드', '재고수량'],
      requiredFields: ['상품코드', '상품명', '판매가'],
      confidence: 0
    },
    {
      id: 'wiseamall',
      name: '위사몰',
      logo: '□',
      description: '위사몰 쇼핑몰',
      detectionKeywords: ['상품번호', '상품명', '가격', '분류', '제조사', '상품이미지'],
      requiredFields: ['상품명', '가격', '분류'],
      confidence: 0
    },
    {
      id: 'smartstore',
      name: '네이버 스마트스토어',
      logo: '□',
      description: '네이버 스마트스토어',
      detectionKeywords: ['상품ID', '상품명', '판매가격', '카테고리명', '브랜드명', '대표이미지'],
      requiredFields: ['상품명', '판매가격', '카테고리명'],
      confidence: 0
    },
    {
      id: 'makeshop',
      name: '메이크샵',
      logo: '□',
      description: '메이크샵 쇼핑몰',
      detectionKeywords: ['상품코드', '상품명', '판매가', '카테고리', '브랜드', '재고', '상태'],
      requiredFields: ['상품명', '판매가', '카테고리'],
      confidence: 0
    },
    {
      id: 'godo5',
      name: '고도몰5',
      logo: '□',
      description: '고도몰5 쇼핑몰',
      detectionKeywords: ['상품관리코드', '상품명', '판매가격', '상품분류', '제조회사', '브랜드'],
      requiredFields: ['상품명', '판매가격', '상품분류'],
      confidence: 0
    }
  ];

  // 업로드 이력 샘플 데이터 로드
  useEffect(() => {
    const mockHistory = [
      {
        id: 1,
        batchNumber: 'BATCH_2024_001',
        platform: 'cafe24',
        platformName: 'Cafe24',
        fileName: 'cafe24_products_20240301.csv',
        uploadDate: '2024-03-01 14:30:22',
        totalCount: 150,
        successCount: 148,
        errorCount: 2,
        status: 'completed'
      },
      {
        id: 2,
        batchNumber: 'BATCH_2024_002',
        platform: 'smartstore',
        platformName: '네이버 스마트스토어',
        fileName: 'naver_products_20240305.csv',
        uploadDate: '2024-03-05 09:15:33',
        totalCount: 89,
        successCount: 89,
        errorCount: 0,
        status: 'completed'
      },
      {
        id: 3,
        batchNumber: 'BATCH_2024_003',
        platform: 'company',
        platformName: '자사',
        fileName: 'company_products_20240308.csv',
        uploadDate: '2024-03-08 16:45:12',
        totalCount: 220,
        successCount: 215,
        errorCount: 5,
        status: 'completed'
      },
      {
        id: 4,
        batchNumber: 'BATCH_2024_004',
        platform: 'wiseamall',
        platformName: '위사몰',
        fileName: 'wisea_products_20240310.csv',
        uploadDate: '2024-03-10 11:22:45',
        totalCount: 67,
        successCount: 65,
        errorCount: 2,
        status: 'completed'
      },
      {
        id: 5,
        batchNumber: 'BATCH_2024_005',
        platform: 'makeshop',
        platformName: '메이크샵',
        fileName: 'makeshop_products_20240312.csv',
        uploadDate: '2024-03-12 10:15:28',
        totalCount: 123,
        successCount: 120,
        errorCount: 3,
        status: 'completed'
      },
      {
        id: 6,
        batchNumber: 'BATCH_2024_006',
        platform: 'godo5',
        platformName: '고도몰5',
        fileName: 'godo5_products_20240315.csv',
        uploadDate: '2024-03-15 13:40:15',
        totalCount: 95,
        successCount: 94,
        errorCount: 1,
        status: 'completed'
      }
    ];
    setUploadHistory(mockHistory);
  }, []);

  // 플랫폼 자동 감지 함수
  const detectPlatform = (columns) => {
    const updatedPlatforms = platforms.map(platform => {
      const matches = platform.detectionKeywords.filter(keyword => 
        columns.some(col => col.toLowerCase().includes(keyword.toLowerCase()))
      );
      const confidence = Math.round((matches.length / platform.detectionKeywords.length) * 100);
      return { ...platform, confidence, matchedKeywords: matches };
    });

    // 가장 높은 신뢰도를 가진 플랫폼 찾기
    const bestMatch = updatedPlatforms.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    );

    return { platforms: updatedPlatforms, bestMatch };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('CSV 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB 제한
      alert('파일 크기는 50MB 이하여야 합니다.');
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);
    setDetectedPlatform(null);
    setPreviewData([]);
    
    // CSV 파일 분석
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('올바른 CSV 파일이 아닙니다.');
        setIsAnalyzing(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
      const dataRows = lines.slice(1, 6).map(line => line.split(',').map(cell => cell.trim()));
      
      // 플랫폼 자동 감지
      setTimeout(() => {
        const detection = detectPlatform(headers);
        
        setFileAnalysis({
          fileName: file.name,
          fileSize: file.size,
          totalRows: lines.length - 1,
          totalColumns: headers.length,
          headers: headers,
          sampleData: dataRows
        });
        
        setPreviewData([headers, ...dataRows]);
        setDetectedPlatform(detection.bestMatch);
        setDetectionConfidence(detection.bestMatch.confidence);
        
        // 신뢰도가 낮으면 수동 선택 옵션 표시
        if (detection.bestMatch.confidence < 70) {
          setShowPlatformSelector(true);
        }
        
        setIsAnalyzing(false);
      }, 1500); // 분석 시뮬레이션
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  const handlePlatformSelect = (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    setSelectedPlatform(platformId);
    setDetectedPlatform(platform);
    setDetectionConfidence(100); // 수동 선택은 100% 신뢰도
    setShowPlatformSelector(false);
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // 업로드 진행률 시뮬레이션
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // 실제 업로드 로직 시뮬레이션
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // 업로드 결과 시뮬레이션
      const totalRows = Math.floor(Math.random() * 100) + 50;
      const successRows = Math.floor(totalRows * (0.85 + Math.random() * 0.1));
      const errorRows = totalRows - successRows;

      const results = {
        total: totalRows,
        success: successRows,
        error: errorRows,
        batchNumber: `BATCH_${new Date().getFullYear()}_${String(uploadHistory.length + 1).padStart(3, '0')}`,
        errors: errorRows > 0 ? [
          { row: 3, field: '상품명', message: '필수 항목이 비어있습니다' },
          { row: 7, field: '가격', message: '잘못된 가격 형식입니다' },
          { row: 12, field: '카테고리', message: '존재하지 않는 카테고리입니다' }
        ] : []
      };

      setUploadResults(results);

      // 업로드 이력에 추가
      const newHistoryItem = {
        id: uploadHistory.length + 1,
        batchNumber: results.batchNumber,
        platform: detectedPlatform.id,
        platformName: detectedPlatform.name,
        fileName: uploadedFile.name,
        uploadDate: new Date().toLocaleString('ko-KR'),
        totalCount: results.total,
        successCount: results.success,
        errorCount: results.error,
        status: 'completed'
      };

      setUploadHistory(prev => [newHistoryItem, ...prev]);
      setIsUploading(false);
    }, 3000);
  };

  const resetUpload = () => {
    setUploadResults(null);
    setUploadedFile(null);
    setDetectedPlatform(null);
    setPreviewData([]);
    setFileAnalysis(null);
    setShowPlatformSelector(false);
    setUploadProgress(0);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CSV 상품 등록</h1>
          <p className="text-gray-600">CSV 파일을 업로드하면 자동으로 쇼핑몰 플랫폼을 감지하여 상품을 등록합니다.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
          >
            □ 등록 이력 보기
          </button>
        </div>
      </div>

      {/* 등록 이력 모달 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* 배경 오버레이 */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowHistory(false)}
            ></div>

            {/* 모달 컨텐츠 */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">차수별 상품 등록 내역</h2>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    □
                  </button>
                </div>
                
                {uploadHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">차수</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">플랫폼</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">파일명</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일시</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전체</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성공</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">실패</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {uploadHistory.map((item) => {
                          const platform = platforms.find(p => p.id === item.platform);
                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.batchNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-lg mr-2">{platform?.logo}</span>
                                  <span className="text-sm text-gray-900">{item.platformName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.fileName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.uploadDate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.totalCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-green-600 font-medium">
                                  {item.successCount}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${item.errorCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                  {item.errorCount}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  완료
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">□</div>
                    <div className="text-lg">아직 등록 이력이 없습니다.</div>
                  </div>
                )}
              </div>
              
              {/* 모달 하단 */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 파일 업로드 */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">1. CSV 파일 업로드</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="text-4xl text-gray-400 mb-4">□</div>
            <div className="text-lg font-medium text-gray-700 mb-2">
              CSV 파일을 선택하거나 여기로 드래그하세요
            </div>
            <div className="text-sm text-gray-500 mb-4">
              지원 형식: CSV (UTF-8) | 최대 크기: 50MB
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
              파일 선택
            </div>
          </label>
        </div>

        {uploadedFile && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{uploadedFile.name}</div>
                <div className="text-sm text-gray-500">
                  크기: {(uploadedFile.size / 1024 / 1024).toFixed(2)}MB
                </div>
              </div>
              {isAnalyzing && (
                <div className="flex items-center text-blue-600">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  분석 중...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 플랫폼 감지 결과 */}
      {detectedPlatform && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2. 플랫폼 감지 결과</h2>
          
          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <span className="text-3xl mr-4">{detectedPlatform.logo}</span>
              <div>
                <div className="text-lg font-semibold text-gray-900">{detectedPlatform.name}</div>
                <div className="text-sm text-gray-600">{detectedPlatform.description}</div>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500 mr-2">감지 신뢰도:</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          detectionConfidence >= 80 ? 'bg-green-500' :
                          detectionConfidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${detectionConfidence}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${
                      detectionConfidence >= 80 ? 'text-green-600' :
                      detectionConfidence >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {detectionConfidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {detectionConfidence < 80 && (
              <button
                onClick={() => setShowPlatformSelector(true)}
                className="px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
              >
                다른 플랫폼 선택
              </button>
            )}
          </div>

          {detectionConfidence < 70 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="text-yellow-400 mr-2">□</div>
                <div className="text-sm text-yellow-800">
                  플랫폼 감지 신뢰도가 낮습니다. 수동으로 올바른 플랫폼을 선택해주세요.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 플랫폼 수동 선택 */}
      {showPlatformSelector && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">플랫폼 수동 선택</h2>
            <button
              onClick={() => setShowPlatformSelector(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              □
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                onClick={() => handlePlatformSelect(platform.id)}
                className="p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
              >
                <div className="text-center">
                  <span className="text-2xl mb-2 block">{platform.logo}</span>
                  <div className="font-medium text-gray-900 text-sm">{platform.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{platform.description}</div>
                  {platform.confidence > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      매칭률: {platform.confidence}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 파일 분석 정보 */}
      {fileAnalysis && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. 파일 분석 정보</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{fileAnalysis.totalRows}</div>
              <div className="text-sm text-gray-600">총 행 수</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{fileAnalysis.totalColumns}</div>
              <div className="text-sm text-gray-600">총 열 수</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{(fileAnalysis.fileSize / 1024 / 1024).toFixed(1)}MB</div>
              <div className="text-sm text-gray-600">파일 크기</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">UTF-8</div>
              <div className="text-sm text-gray-600">인코딩</div>
            </div>
          </div>

          {detectedPlatform && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm text-green-800">
                <strong>매칭된 필드:</strong> {detectedPlatform.matchedKeywords?.join(', ') || '없음'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 파일 미리보기 */}
      {previewData.length > 0 && detectedPlatform && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">4. 파일 미리보기</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {previewData[0]?.map((header, index) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.slice(1, 6).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              * 상위 5개 행만 미리보기로 표��됩니다.
            </div>
            {detectedPlatform && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isUploading ? '업로드 중...' : '상품 등록 시작'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 업로드 진행률 */}
      {isUploading && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">상품 등록 진행 상황</h2>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            {uploadProgress.toFixed(0)}% 완료 ({detectedPlatform?.name}에 등록 중...)
          </div>
        </div>
      )}

      {/* 업로드 결과 */}
      {uploadResults && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">상품 등록 결과</h2>
            <div className="text-sm text-gray-500">
              차수: {uploadResults.batchNumber}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{uploadResults.total}</div>
              <div className="text-sm text-blue-600">전체 상품</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{uploadResults.success}</div>
              <div className="text-sm text-green-600">등록 성공</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{uploadResults.error}</div>
              <div className="text-sm text-red-600">등록 실패</div>
            </div>
          </div>

          {uploadResults.errors.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">오류 내역</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="space-y-2">
                  {uploadResults.errors.map((error, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-red-800">행 {error.row}:</span>
                      <span className="text-red-700"> [{error.field}] {error.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={resetUpload}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              새 파일 업로드
            </button>
            <button className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              상품 목록으로 이동
            </button>
          </div>
        </div>
      )}

      {/* 지원 플랫폼 안내 */}
      {!uploadedFile && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">지원되는 플랫폼 (총 6개)</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <div key={platform.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">{platform.logo}</span>
                  <div className="font-medium text-gray-900 text-sm">{platform.name}</div>
                </div>
                <div className="text-xs text-gray-500">{platform.description}</div>
                <div className="text-xs text-gray-400 mt-1">
                  자동 감지 키워드: {platform.detectionKeywords.slice(0, 3).join(', ')}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm text-blue-800">
              <strong>□ 팁:</strong> CSV 파일을 업로드하면 자동으로 어떤 쇼핑몰의 파일인지 감지합니다. 
              감지 실패 시 수동으로 플랫폼을 선택할 수 있습니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCsvUploadPage;
