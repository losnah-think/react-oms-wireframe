import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Badge,
  Stack,
  Input,
  GridRow,
  GridCol,
} from "../../design-system";
import SideGuide from "../../components/SideGuide";
import HelpDrawer from "../../components/ui/HelpDrawer";

interface Platform {
  id: string;
  name: string;
  logo: string;
  description: string;
  detectionKeywords: string[];
  requiredFields: string[];
  matchedKeywords?: string[];
  confidence?: number;
}

interface UploadHistory {
  id: number;
  batchNumber: string;
  platform: string;
  platformName: string;
  fileName: string;
  uploadDate: string;
  totalCount: number;
  successCount: number;
  errorCount: number;
  status: string;
}

interface FileAnalysis {
  fileName: string;
  fileSize: number;
  totalRows: number;
  totalColumns: number;
  headers: string[];
  sampleData: string[][];
}

interface UploadResults {
  total: number;
  success: number;
  error: number;
  batchNumber: string;
  errors: {
    row: number;
    field: string;
    message: string;
  }[];
}

const ProductCsvUploadPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(
    null,
  );
  // Validation errors: { rowIndex: { fieldName: errorMsg } }
  const [validationErrors, setValidationErrors] = useState<Record<number, Record<string, string>>>({});
  // Track preview editable data as array of objects, each with field names as keys
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  // 전체 편집 모드 토글
  const [fullEditMode, setFullEditMode] = useState<boolean>(false);
  // Track created/updated counts after upload
  const [createdCount, setCreatedCount] = useState<number>(0);
  const [updatedCount, setUpdatedCount] = useState<number>(0);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(
    null,
  );
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [showPlatformSelector, setShowPlatformSelector] =
    useState<boolean>(false);
  const [fieldMapping, setFieldMapping] = useState<
    Record<string, string | null>
  >({});
  const [mappingValid, setMappingValid] = useState<boolean>(true);
  const [skipHeaderRows, setSkipHeaderRows] = useState<number>(0);
  const [handleImagesAsUrls, setHandleImagesAsUrls] = useState<boolean>(true);
  const [message, setMessage] = useState<{
    type: "info" | "success" | "error";
    text: string;
  } | null>(null);

  // 상태 관리: 업로드 전/후 화면 구분
  const [showUploadResult, setShowUploadResult] = useState<boolean>(false);
  // 스크롤 이동을 위한 ref
  const tableRef = React.useRef<HTMLTableElement>(null);

  // Lightweight RFC4180-style CSV parser supporting quoted fields and newlines
  const parseCSV = (text: string, delimiter = ","): string[][] => {
    const rows: string[][] = [];
    let cur = "";
    let row: string[] = [];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === delimiter) {
          row.push(cur);
          cur = "";
        } else if (ch === "\r") {
          // handle CRLF
          if (text[i + 1] === "\n") i++;
          row.push(cur);
          rows.push(row);
          row = [];
          cur = "";
        } else if (ch === "\n") {
          row.push(cur);
          rows.push(row);
          row = [];
          cur = "";
        } else {
          cur += ch;
        }
      }
    }
    // push last
    if (inQuotes) {
      // malformed CSV; still push what we have
    }
    if (cur !== "" || row.length > 0) {
      row.push(cur);
      rows.push(row);
    }
    // trim cells
    return rows.map((r) => r.map((c) => c.trim()));
  };

  const showMessage = (
    text: string,
    type: "info" | "success" | "error" = "info",
  ) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4000);
  };

  // 토스트 메시지 상태
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  // 토스트 메시지 표시 함수
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 오류 클릭 시 해당 행으로 이동하고 포커스를 주는 함수
  const scrollToRow = (rowIndex: number, fieldName?: string) => {
    if (tableRef.current) {
      const targetRow = tableRef.current.querySelector(`[data-row-index="${rowIndex}"]`);
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 토스트 메시지 표시
        showToast(`행 ${rowIndex + 1}로 이동했습니다. 수정해주세요!`, 'info');
        
        // 잠시 하이라이트 효과
        targetRow.classList.add('bg-yellow-100');
        setTimeout(() => {
          targetRow.classList.remove('bg-yellow-100');
          
          // 특정 필드가 지정된 경우 해당 셀로 포커스 이동
          if (fieldName) {
            const fieldInput = targetRow.querySelector(`input[data-field="${fieldName}"]`) as HTMLInputElement;
            if (fieldInput) {
              fieldInput.focus();
              fieldInput.select();
            }
          }
        }, 500);
      }
    }
  };
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // 6가지 플랫폼 정의 (자사, 카페24, 위사몰, 네이버 스마트스토어, 메이크샵, 고도몰5)
  const platforms: Platform[] = [
    {
      id: "company",
      name: "자사",
      logo: "□",
      description: "자사 판매처",
      detectionKeywords: [
        "상품코드",
        "상품명",
        "판매가",
        "공급가",
        "카테고리",
        "브랜드",
        "재고수량",
        "상품설명",
      ],
      requiredFields: ["상품코드", "상품명", "판매가"],
    },
    {
      id: "cafe24",
      name: "Cafe24",
      logo: "□",
      description: "Cafe24 판매처",
      detectionKeywords: [
        "상품코드",
        "상품명",
        "판매가",
        "공급가",
        "카테고리",
        "브랜드",
        "재고수량",
      ],
      requiredFields: ["상품코드", "상품명", "판매가"],
    },
    {
      id: "wiseamall",
      name: "위사몰",
      logo: "□",
      description: "위사몰 판매처",
      detectionKeywords: [
        "상품번호",
        "상품명",
        "가격",
        "분류",
        "제조사",
        "상품이미지",
      ],
      requiredFields: ["상품명", "가격", "분류"],
    },
    {
      id: "smartstore",
      name: "네이버 스마트스토어",
      logo: "□",
      description: "네이버 스마트스토어",
      detectionKeywords: [
        "상품ID",
        "상품명",
        "판매가격",
        "카테고리명",
        "브랜드명",
        "대표이미지",
      ],
      requiredFields: ["상품명", "판매가격", "카테고리명"],
    },
    {
      id: "makeshop",
      name: "메이크샵",
      logo: "□",
      description: "메이크샵 판매처",
      detectionKeywords: [
        "상품코드",
        "상품명",
        "판매가",
        "카테고리",
        "브랜드",
        "재고",
        "상태",
      ],
      requiredFields: ["상품명", "판매가", "카테고리"],
    },
    {
      id: "godo5",
      name: "고도몰5",
      logo: "□",
      description: "고도몰5 판매처",
      detectionKeywords: [
        "상품관리코드",
        "상품명",
        "판매가격",
        "상품분류",
        "제조회사",
        "브랜드",
      ],
      requiredFields: ["상품명", "판매가격", "상품분류"],
    },
  ];

  // 업로드 이력 샘플 데이터 로드
  useEffect(() => {
    const mockHistory: UploadHistory[] = [
      {
        id: 1,
        batchNumber: "BATCH_2024_001",
        platform: "cafe24",
        platformName: "Cafe24",
        fileName: "cafe24_products_20240301.csv",
        uploadDate: "2024-03-01 14:30:22",
        totalCount: 150,
        successCount: 148,
        errorCount: 2,
        status: "completed",
      },
      {
        id: 2,
        batchNumber: "BATCH_2024_002",
        platform: "smartstore",
        platformName: "네이버 스마트스토어",
        fileName: "naver_products_20240305.csv",
        uploadDate: "2024-03-05 09:15:33",
        totalCount: 89,
        successCount: 89,
        errorCount: 0,
        status: "completed",
      },
      {
        id: 3,
        batchNumber: "BATCH_2024_003",
        platform: "company",
        platformName: "자사",
        fileName: "company_products_20240308.csv",
        uploadDate: "2024-03-08 16:45:12",
        totalCount: 220,
        successCount: 215,
        errorCount: 5,
        status: "completed",
      },
      {
        id: 4,
        batchNumber: "BATCH_2024_004",
        platform: "wiseamall",
        platformName: "위사몰",
        fileName: "wisea_products_20240310.csv",
        uploadDate: "2024-03-10 11:22:45",
        totalCount: 67,
        successCount: 65,
        errorCount: 2,
        status: "completed",
      },
      {
        id: 5,
        batchNumber: "BATCH_2024_005",
        platform: "makeshop",
        platformName: "메이크샵",
        fileName: "makeshop_products_20240312.csv",
        uploadDate: "2024-03-12 10:15:28",
        totalCount: 123,
        successCount: 120,
        errorCount: 3,
        status: "completed",
      },
      {
        id: 6,
        batchNumber: "BATCH_2024_006",
        platform: "godo5",
        platformName: "고도몰5",
        fileName: "godo5_products_20240315.csv",
        uploadDate: "2024-03-15 13:40:15",
        totalCount: 95,
        successCount: 94,
        errorCount: 1,
        status: "completed",
      },
    ];
    setUploadHistory(mockHistory);
  }, []);

  // 플랫폼 자동 감지 함수(리팩토링)
  const detectPlatform = (columns: string[]) => {
    const matches = platforms.filter(p =>
      p.detectionKeywords.some(k =>
        columns.some(col => col.toLowerCase().includes(k.toLowerCase()))
      )
    );
    if (matches.length === 1) {
      return matches[0];
    }
    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      showMessage("CSV 파일만 업로드 가능합니다.", "error");
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);
    setDetectedPlatform(null);
    setPreviewData([]);
    setPreviewRows([]);
    setValidationErrors({});
    setShowPlatformSelector(false);

    // CSV 파일 분석
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);

      if (!rows || rows.length < 2) {
        showMessage("올바른 CSV 파일이 아닙니다.", "error");
        setIsAnalyzing(false);
        return;
      }

      const headers = (rows[0] || []).map((h) =>
        String(h).replace(/['"]/g, ""),
      );
      const dataRows = rows.slice(1); // 모든 데이터 행 가져오기

      // 플랫폼 자동 감지
      setTimeout(() => {
        const detected = detectPlatform(headers);
        if (detected) {
          setDetectedPlatform({ ...detected });
          setShowPlatformSelector(false);
        } else {
          setDetectedPlatform(null);
          setShowPlatformSelector(true);
        }

        setFileAnalysis({
          fileName: file.name,
          fileSize: file.size,
          totalRows: rows.length - 1,
          totalColumns: headers.length,
          headers: headers,
          sampleData: dataRows.slice(0, 6), // 미리보기용 샘플 데이터
        });

        setPreviewData([headers, ...dataRows]);
        
        // Build editable previewRows (array of objects) - 모든 행 처리
        const previewObjs: any[] = [];
        for (let i = 1; i < rows.length; ++i) {
          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h] = rows[i][idx] ?? "";
          });
          previewObjs.push(obj);
        }
        
        // Validate all rows
        const errors: Record<number, Record<string, string>> = {};
        previewObjs.forEach((row, idx) => {
          const rowErrors: Record<string, string> = {};
          // 상품명 missing
          if (!row["상품명"] || row["상품명"].trim() === "") {
            rowErrors["상품명"] = "상품명은 필수입니다.";
          }
          // 상품코드 missing → generate
          if (!row["상품코드"] || row["상품코드"].trim() === "") {
            // Generate code
            const today = new Date();
            const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
            row["상품코드"] = `PRD-${ymd}-${String(idx + 1).padStart(4, "0")}`;
          }
          // 판매가 missing
          if (!row["판매가"] || row["판매가"].trim() === "") {
            rowErrors["판매가"] = "판매가는 필수입니다.";
          }
          // 브랜드 missing
          if (!row["브랜드"] || row["브랜드"].trim() === "") {
            rowErrors["브랜드"] = "브랜드는 필수입니다.";
          } else if (typeof row["브랜드"] === "string" && row["브랜드"].includes(";")) {
            row["브랜드"] = row["브랜드"].split(";").map((b: string) => b.trim()).filter(Boolean);
          }
          if (Object.keys(rowErrors).length > 0) {
            errors[idx] = rowErrors;
          }
        });
        setPreviewRows(previewObjs);
        setValidationErrors(errors);
        setIsAnalyzing(false);
      }, 800); // 분석 시뮬레이션
    };

    reader.readAsText(file, "UTF-8");
  };

  // initialize field mapping when platform selected or file analyzed
  useEffect(() => {
    const plat =
      (detectedPlatform ?? platforms.find((p) => p.id === selectedPlatform)) ||
      null;
    if (!plat || !fileAnalysis) return;
    const headers = fileAnalysis.headers || [];
    const mapping: Record<string, string | null> = {};
    plat.requiredFields.forEach((rf) => {
      // try auto-match by looking for header that includes keyword (case-insensitive)
      const found = headers.find((h) =>
        h.toLowerCase().includes(rf.toLowerCase()),
      );
      mapping[rf] = found ?? null;
    });
    setFieldMapping(mapping);
    // validate
    const allMapped = plat.requiredFields.every((rf) => !!mapping[rf]);
    setMappingValid(allMapped);
  }, [detectedPlatform, selectedPlatform, fileAnalysis]);

  const handlePlatformSelect = (platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId);
    if (platform) {
      setSelectedPlatform(platformId);
      setDetectedPlatform(platform);
      setShowPlatformSelector(false);
    }
  };

  // 임시: 기존 상품코드 목록 (실제 구현시 서버에서 받아옴)
  const existingProductCodes = React.useMemo(() => [
    "PRD-20240601-1",
    "PRD-20240601-2",
    "PRD-20240601-3",
    "PRD-20240601-4",
    "PRD-20240601-5",
  ], []);

  const handleUpload = async () => {
    if (!uploadedFile) return;
    // validate mapping if required
    if (
      detectedPlatform &&
      detectedPlatform.requiredFields &&
      detectedPlatform.requiredFields.length > 0
    ) {
      if (!mappingValid) {
        showMessage(
          "필수 필드 매핑이 완료되어야 업로드할 수 있습니다.",
          "error",
        );
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);
    setCreatedCount(0);
    setUpdatedCount(0);

    // 업로드 진행률 시뮬레이션
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // 실제 업로드 로직: 상품코드 기준 생성/수정 건수 계산
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Use previewRows for this simulation
      let created = 0;
      let updated = 0;
      let errors: { row: number, field: string, message: string }[] = [];
      
      // 유효성 검사 오류가 있는 행들을 먼저 수집
      for (let i = 0; i < previewRows.length; ++i) {
        if (validationErrors[i]) {
          Object.entries(validationErrors[i]).forEach(([field, msg]) => {
            errors.push({
              row: i + 2, // +2 to match CSV row (header + 1-based)
              field,
              message: msg,
            });
          });
        }
      }
      
      // 유효성 검사 통과한 행들만 생성/수정 처리
      const validRows = previewRows.filter((_, index) => !validationErrors[index]);
      
      for (let i = 0; i < validRows.length; ++i) {
        const row = validRows[i];
        const code = row["상품코드"];
        // 기존 상품코드가 있는지 확인 (실제로는 서버에서 확인해야 함)
        if (existingProductCodes.length > 0 && existingProductCodes.includes(code)) {
          updated++;
        } else {
          created++;
        }
      }
      setCreatedCount(created);
      setUpdatedCount(updated);

      const results: UploadResults = {
        total: previewRows.length,
        success: previewRows.length - errors.length,
        error: errors.length,
        batchNumber: `BATCH_${new Date().getFullYear()}_${String(uploadHistory.length + 1).padStart(3, "0")}`,
        errors,
      };

      setUploadResults(results);
      setShowUploadResult(true); // 결과 화면 표시

      // 업로드 이력에 추가
      if (detectedPlatform) {
        const newHistoryItem: UploadHistory = {
          id: uploadHistory.length + 1,
          batchNumber: results.batchNumber,
          platform: detectedPlatform.id,
          platformName: detectedPlatform.name,
          fileName: uploadedFile.name,
          uploadDate: new Date().toLocaleString("ko-KR"),
          totalCount: results.total,
          successCount: results.success,
          errorCount: results.error,
          status: "completed",
        };

        setUploadHistory((prev) => [newHistoryItem, ...prev]);
      }

      setIsUploading(false);
    }, 1200);
  };

  const resetUpload = () => {
    setUploadResults(null);
    setUploadedFile(null);
    setDetectedPlatform(null);
    setPreviewData([]);
    setPreviewRows([]);
    setFileAnalysis(null);
    setShowPlatformSelector(false);
    setUploadProgress(0);
    setCreatedCount(0);
    setUpdatedCount(0);
    setValidationErrors({});
    setShowUploadResult(false);
  };

  return (
 
    <Container
      maxWidth="full"
      padding="md"
        className="overflow-x-hidden"
    >
      <div className="mx-auto w-full max-w-screen-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              CSV 상품 관리
            </h1>
            <p className="text-gray-600">
              CSV 파일을 업로드하면 자동으로 쇼핑몰 플랫폼을 감지하여 상품을 등록합니다.
            </p>
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
                    <h2 className="text-2xl font-bold text-gray-900">
                      차수별 상품 등록 내역
                    </h2>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      □
                    </button>
                  </div>

                  {uploadHistory.length > 0 ? (
                    <div className="overflow-x-auto max-w-full">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              차수
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              플랫폼
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              파일명
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              등록일시
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              전체
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              성공
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              실패
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              상태
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {uploadHistory.map((item) => {
                            const platform = platforms.find(
                              (p) => p.id === item.platform,
                            );
                            return (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.batchNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className="text-lg mr-2">
                                      {platform?.logo}
                                    </span>
                                    <span className="text-sm text-gray-900">
                                      {item.platformName}
                                    </span>
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
                                  <span
                                    className={`text-sm font-medium ${item.errorCount > 0 ? "text-red-600" : "text-gray-400"}`}
                                  >
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

          {/* 파일 업로드 후 화면 (두번째 이미지) */}
          {uploadedFile && !showUploadResult && (
            <>
              {/* CSV 파일 업로드 섹션 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      CSV 파일 업로드
          </h2>
                    <button 
                      onClick={() => setIsHelpOpen(true)}
                      className="text-blue-600 text-sm hover:text-blue-800"
                    >
                      CSV 도움말
                    </button>
                  </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
                      <div className="text-sm text-gray-500 mb-2">
                        지원 형식 CSV (UTF-8) 최대 크기 50MB
                      </div>
                      <div className="text-lg font-medium text-gray-700 mb-4">
                CSV 파일을 선택하거나 여기로 드래그하세요
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                         파일 선택
              </div>
            </label>
          </div>

          {uploadedFile && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 mb-1">업로드한 파일이 없습니다.</div>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {uploadedFile.name}
                  </div>
                  <div className="text-sm text-gray-500">
                              크기 {(uploadedFile.size / 1024 / 1024).toFixed(2)}MB
                  </div>
                </div>
                          <button 
                            onClick={() => setUploadedFile(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                  </div>
              </div>
            </div>
          )}
        </div>

                {/* 파일 분석 정보 */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      파일 분석 정보
            </h2>
              <button
            onClick={() => setIsHelpOpen(true)}
                      className="text-blue-600 text-sm hover:text-blue-800"
          >
            CSV 도움말
          </button>
        </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">총 행수</span>
                      <span className="text-sm font-medium">{fileAnalysis?.totalRows || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">총 열수</span>
                      <span className="text-sm font-medium">{fileAnalysis?.totalColumns || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">파일 크기</span>
                      <span className="text-sm font-medium">{fileAnalysis ? `${(fileAnalysis.fileSize / 1024 / 1024).toFixed(1)}MB` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">인코딩</span>
                      <span className="text-sm font-medium">UTF-8</span>
                    </div>
                  </div>

                  {detectedPlatform && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2"></span>
                        <div className="text-sm text-blue-800">
                          매칭된 필드: 상품코드, 상품명, 판매가, 공급가, 카테고리, 브랜드, 상품설명
                        </div>
                      </div>
          </div>
        )}
                </div>
              </div>

              {/* 플랫폼 선택 */}
          <div className="bg-white border rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  플랫폼 선택
              </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        (detectedPlatform?.id === platform.id || selectedPlatform === platform.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          checked={detectedPlatform?.id === platform.id || selectedPlatform === platform.id}
                          onChange={() => {}}
                          className="mr-3"
                        />
                        <span className="text-2xl mr-2">{platform.logo}</span>
                        <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {platform.name}
                            {detectedPlatform?.id === platform.id && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">예상</span>
                            )}
                    </div>
                    </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        SSSSSSSSSSSSSSSSSSSSSSS
                  </div>
                </div>
              ))}
            </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="text-sm text-yellow-800">
                    <strong> TIP:</strong> CSV 파일을 업로드하면 자동으로 어떤 쇼핑몰의 파일인지 감지합니다. 감지 실패 시 수동으로 플랫폼을 선택할 수 있습니다.
                </div>
              </div>
            </div>

              {/* 필드 매핑 */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  필드 매핑
            </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* 왼쪽 컬럼 */}
              <div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="w-20 text-sm text-gray-700">상품명</label>
                      <select
                          value={fieldMapping['상품명'] || ''}
                        onChange={(e) => {
                          const val = e.target.value || null;
                          setFieldMapping((prev) => {
                              const next = { ...prev, '상품명': val };
                            setMappingValid(
                              Object.values(next).every((v) => !!v),
                            );
                            return next;
                          });
                        }}
                          className="flex-1 border rounded px-3 py-2 text-sm"
                      >
                        <option value="">(매칭 헤더 선택)</option>
                          {fileAnalysis?.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                      <div className="flex items-center gap-3">
                        <label className="w-20 text-sm text-gray-700">상품코드</label>
                        <select
                          value={fieldMapping['상품코드'] || ''}
                          onChange={(e) => {
                            const val = e.target.value || null;
                            setFieldMapping((prev) => {
                              const next = { ...prev, '상품코드': val };
                              setMappingValid(
                                Object.values(next).every((v) => !!v),
                              );
                              return next;
                            });
                          }}
                          className="flex-1 border rounded px-3 py-2 text-sm"
                        >
                          <option value="">(매칭 헤더 선택)</option>
                          {fileAnalysis?.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                </div>
              </div>

                  {/* 오른쪽 컬럼 */}
              <div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="w-20 text-sm text-gray-700">브랜드</label>
                        <select
                          value={fieldMapping['브랜드'] || ''}
                          onChange={(e) => {
                            const val = e.target.value || null;
                            setFieldMapping((prev) => {
                              const next = { ...prev, '브랜드': val };
                              setMappingValid(
                                Object.values(next).every((v) => !!v),
                              );
                              return next;
                            });
                          }}
                          className="flex-1 border rounded px-3 py-2 text-sm"
                        >
                          <option value="">(매칭 헤더 선택)</option>
                          {fileAnalysis?.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-20 text-sm text-gray-700">판매가</label>
                        <select
                          value={fieldMapping['판매가'] || ''}
                          onChange={(e) => {
                            const val = e.target.value || null;
                            setFieldMapping((prev) => {
                              const next = { ...prev, '판매가': val };
                          setMappingValid(
                                Object.values(next).every((v) => !!v),
                              );
                              return next;
                            });
                          }}
                          className="flex-1 border rounded px-3 py-2 text-sm"
                        >
                          <option value="">(매칭 헤더 선택)</option>
                          {fileAnalysis?.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                  </div>
                </div>
              </div>
            </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={fullEditMode}
                    onChange={(e) => setFullEditMode(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">시트 전체 편집 (헤더 + 모든 행)</span>
              </div>
          </div>

              {/* 수정 가능한 데이터 테이블 */}
              {previewData.length > 0 && (
                <div className="bg-white border rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      데이터 편집 ({previewRows.length}개 행)
                    </h2>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={fullEditMode}
                        onChange={(e) => setFullEditMode(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">시트 전체 편집 (헤더 + 모든 행)</span>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto max-w-full max-h-96 overflow-y-auto border rounded-lg">
                    <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                            No.
                          </th>
                          {previewData[0]?.map((header, index) => (
                            <th
                              key={index}
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewRows.map((row, rowIndex) => (
                          <tr 
                            key={rowIndex} 
                            className="hover:bg-gray-50 transition-colors"
                            data-row-index={rowIndex}
                          >
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {rowIndex + 1}
                            </td>
                            {previewData[0].map((header, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-3 py-2 text-sm text-gray-900"
                              >
                                <div>
                                  <input
                                    data-field={header}
                                    className={`border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      validationErrors[rowIndex] && validationErrors[rowIndex][header] 
                                        ? 'border-red-300 bg-red-50' 
                                        : ''
                                    }`}
                                    value={
                                      Array.isArray(row[header])
                                        ? row[header].join(";")
                                        : (row[header] ?? "")
                                    }
                                    onChange={e => {
                                      const val = e.target.value;
                                      setPreviewRows(prev => {
                                        const newRows = [...prev];
                                        // If 브랜드, handle array split
                                        if (header === "브랜드" && val.includes(";")) {
                                          newRows[rowIndex][header] = val.split(";").map(s => s.trim()).filter(Boolean);
                                        } else {
                                          newRows[rowIndex][header] = val;
                                        }
                                        // revalidate this field
                                        setValidationErrors(prevErrs => {
                                          const errs = { ...prevErrs };
                                          const rowErrs = { ...(errs[rowIndex] || {}) };
                                          // 상품명
                                          if (header === "상품명") {
                                            if (!val || val.trim() === "") {
                                              rowErrs["상품명"] = "상품명은 필수입니다.";
                                            } else {
                                              delete rowErrs["상품명"];
                                            }
                                          }
                                          // 상품코드
                                          if (header === "상품코드") {
                                            if (!val || val.trim() === "") {
                                              // Generate code
                                              const today = new Date();
                                              const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
                                              newRows[rowIndex][header] = `PRD-${ymd}-${String(rowIndex + 1).padStart(4, "0")}`;
                                            }
                                          }
                                          // 판매가
                                          if (header === "판매가") {
                                            if (!val || val.trim() === "") {
                                              rowErrs["판매가"] = "판매가는 필수입니다.";
                                            } else {
                                              delete rowErrs["판매가"];
                                            }
                                          }
                                          // 브랜드
                                          if (header === "브랜드") {
                                            if (!val || val.trim() === "") {
                                              rowErrs["브랜드"] = "브랜드는 필수입니다.";
                                            } else {
                                              delete rowErrs["브랜드"];
                                            }
                                          }
                                          // Clean up empty error object
                                          if (Object.keys(rowErrs).length === 0) {
                                            delete errs[rowIndex];
                                          } else {
                                            errs[rowIndex] = rowErrs;
                                          }
                                          return errs;
                                        });
                                        return newRows;
                                      });
                                    }}
                                    type="text"
                                  />
                                  {validationErrors[rowIndex] && validationErrors[rowIndex][header] && (
                                    <div className="text-red-500 text-xs mt-1">
                                      {validationErrors[rowIndex][header]}
                                    </div>
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      * 전체 {previewRows.length}개 행을 편집할 수 있습니다. 스크롤하여 모든 데이터를 확인하세요.
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-gray-100 rounded border text-sm hover:bg-gray-200">
                        상품코드 자동생성
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        상품 등록 시작
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
        )}


        {/* 업로드 진행률 */}
        {isUploading && (
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              상품 등록 진행 상황
            </h2>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>

            <div className="text-center text-sm text-gray-600">
              {uploadProgress.toFixed(0)}% 완료 ({detectedPlatform?.name}에 등록
              중...)
            </div>
          </div>
        )}

          {/* 업로드 결과 화면 (첫번째 이미지) */}
          {showUploadResult && uploadResults && (
            <div className="space-y-6">
              {/* CSV 파일 업로드 섹션 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                      CSV 파일 업로드
              </h2>
                    <button 
                      onClick={() => setIsHelpOpen(true)}
                      className="text-blue-600 text-sm hover:text-blue-800"
                    >
                      CSV 도움말
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <div className="text-4xl text-gray-400 mb-4">📄</div>
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
                          <div className="font-medium text-gray-900">
                            {uploadedFile.name}
                          </div>
              <div className="text-sm text-gray-500">
                            크기 {(uploadedFile.size / 1024 / 1024).toFixed(2)}MB
              </div>
                        </div>
                        <button 
                          onClick={() => setUploadedFile(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
            </div>

                {/* 파일 분석 정보 */}
                {fileAnalysis && (
                  <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      파일 분석 정보
                    </h2>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">총 행수</span>
                        <span className="text-sm font-medium">{fileAnalysis.totalRows}</span>
                </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">총 열수</span>
                        <span className="text-sm font-medium">{fileAnalysis.totalColumns}</span>
              </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">파일 크기</span>
                        <span className="text-sm font-medium">{(fileAnalysis.fileSize / 1024 / 1024).toFixed(1)}MB</span>
                </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">인코딩</span>
                        <span className="text-sm font-medium">UTF-8</span>
              </div>
                </div>

                    {detectedPlatform && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start">
                          <span className="text-blue-600 mr-2"></span>
                          <div className="text-sm text-blue-800">
                            매칭된 필드: 상품코드, 상품명, 판매가, 공급가, 카테고리, 브랜드, 상품설명
              </div>
                </div>
              </div>
                    )}
                  </div>
                )}
              </div>

              {/* 플랫폼 선택 */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  플랫폼 선택
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        (detectedPlatform?.id === platform.id || selectedPlatform === platform.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          checked={detectedPlatform?.id === platform.id || selectedPlatform === platform.id}
                          onChange={() => {}}
                          className="mr-3"
                        />
                        <span className="text-2xl mr-2">{platform.logo}</span>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {platform.name}
                            {detectedPlatform?.id === platform.id && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">예상</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        SSSSSSSSSSSSSSSSSSSSSSS
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="text-sm text-yellow-800">
                    <strong> TIP:</strong> CSV 파일을 업로드하면 자동으로 어떤 쇼핑몰의 파일인지 감지합니다. 감지 실패 시 수동으로 플랫폼을 선택할 수 있습니다.
                  </div>
                </div>
              </div>

              {/* 상품 등록 결과 */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  상품 등록 결과
                </h2>

                <div className="mb-4">
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    전체 상품 {uploadResults.total}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {uploadResults.success}
                      </div>
                      <div className="text-sm text-green-600">등록 성공</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                  {updatedCount}
                </div>
                      <div className="text-sm text-blue-600">업데이트 성공</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {uploadResults.error}
                      </div>
                      <div className="text-sm text-red-600">등록 실패</div>
                    </div>
              </div>
            </div>

                {uploadResults.errors.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <span className="text-sm font-medium text-gray-900">
                        오류 내역 {uploadResults.errors.length}건
                      </span>
                      <span className="ml-2 text-blue-600"></span>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {(() => {
                          // 같은 행의 오류들을 그룹화
                          const groupedErrors = uploadResults.errors.reduce((acc, error) => {
                            const rowKey = error.row;
                            if (!acc[rowKey]) {
                              acc[rowKey] = [];
                            }
                            acc[rowKey].push(error);
                            return acc;
                          }, {} as Record<number, typeof uploadResults.errors>);

                          return Object.entries(groupedErrors)
                            .map(([row, errors]) => {
                              const rowIndex = parseInt(row) - 2; // CSV 행 번호를 배열 인덱스로 변환
                              const firstError = errors[0];
                              const errorFields = errors.map(e => e.field);
                              
                              return (
                                <div 
                                  key={row} 
                                  className="text-sm cursor-pointer hover:bg-red-100 p-3 rounded transition-colors group"
                                  onClick={() => scrollToRow(rowIndex, firstError.field)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-medium text-red-800">
                                        행 {row}:
                                      </span>
                                      <span className="text-red-700">
                                        {" "}[{errorFields.join(', ')}] 는 필수입니다.
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                                      📍 클릭
                                    </span>
                                  </div>
                                </div>
                              );
                            });
                        })()}
                      </div>
                      {uploadResults.errors.length > 0 && (
                        <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-red-200">
                          총 {uploadResults.errors.length}건의 오류가 있습니다. 스크롤하여 모든 오류를 확인하세요.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
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

              {/* 필드 매핑 */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  필드 매핑
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* 왼쪽 컬럼 */}
                  <div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="w-20 text-sm text-gray-700">상품명</label>
                        <select
                          value={fieldMapping['상품명'] || ''}
                          onChange={(e) => {
                            const val = e.target.value || null;
                            setFieldMapping((prev) => {
                              const next = { ...prev, '상품명': val };
                              setMappingValid(
                                Object.values(next).every((v) => !!v),
                              );
                              return next;
                            });
                          }}
                          className="flex-1 border rounded px-3 py-2 text-sm"
                        >
                          <option value="">(매칭 헤더 선택)</option>
                          {fileAnalysis?.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-20 text-sm text-gray-700">상품코드</label>
                        <select
                          value={fieldMapping['상품코드'] || ''}
                          onChange={(e) => {
                            const val = e.target.value || null;
                            setFieldMapping((prev) => {
                              const next = { ...prev, '상품코드': val };
                              setMappingValid(
                                Object.values(next).every((v) => !!v),
                              );
                              return next;
                            });
                          }}
                          className="flex-1 border rounded px-3 py-2 text-sm"
                        >
                          <option value="">(매칭 헤더 선택)</option>
                          {fileAnalysis?.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽 컬럼 */}
                  <div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="w-20 text-sm text-gray-700">브랜드</label>
                        <select
                          value={fieldMapping['브랜드'] || ''}
                          onChange={(e) => {
                            const val = e.target.value || null;
                            setFieldMapping((prev) => {
                              const next = { ...prev, '브랜드': val };
                              setMappingValid(
                                Object.values(next).every((v) => !!v),
                              );
                              return next;
                            });
                          }}
                          className="flex-1 border rounded px-3 py-2 text-sm"
                        >
                          <option value="">(매칭 헤더 선택)</option>
                          {fileAnalysis?.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-20 text-sm text-gray-700">판매가</label>
                        <select
                          value={fieldMapping['판매가'] || ''}
                          onChange={(e) => {
                            const val = e.target.value || null;
                            setFieldMapping((prev) => {
                              const next = { ...prev, '판매가': val };
                              setMappingValid(
                                Object.values(next).every((v) => !!v),
                              );
                              return next;
                            });
                          }}
                          className="flex-1 border rounded px-3 py-2 text-sm"
                        >
                          <option value="">(매칭 헤더 선택)</option>
                          {fileAnalysis?.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={fullEditMode}
                    onChange={(e) => setFullEditMode(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">시트 전체 편집 (헤더 + 모든 행)</span>
                </div>
              </div>

              {/* 수정 가능한 데이터 테이블 */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    데이터 편집
                  </h2>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={fullEditMode}
                      onChange={(e) => setFullEditMode(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">시트 전체 편집 (헤더 + 모든 행)</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto max-w-full">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {previewData[0]?.map((header, index) => (
                          <th
                            key={index}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(fullEditMode ? previewRows : previewRows.slice(0, 10)).map((row, rowIndex) => {
                        const hasError = uploadResults.errors.some(error => error.row === rowIndex + 2);
                        return (
                          <tr key={rowIndex} className={`hover:bg-gray-50 ${hasError ? 'bg-red-50' : ''}`}>
                            {previewData[0].map((header, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                              >
                                <div>
                                  <input
                                    className={`border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError ? 'border-red-300' : ''}`}
                                    value={
                                      Array.isArray(row[header])
                                        ? row[header].join(";")
                                        : (row[header] ?? "")
                                    }
                                    onChange={e => {
                                      const val = e.target.value;
                                      setPreviewRows(prev => {
                                        const newRows = [...prev];
                                        // If 브랜드, handle array split
                                        if (header === "브랜드" && val.includes(";")) {
                                          newRows[rowIndex][header] = val.split(";").map(s => s.trim()).filter(Boolean);
                                        } else {
                                          newRows[rowIndex][header] = val;
                                        }
                                        // revalidate this field
                                        setValidationErrors(prevErrs => {
                                          const errs = { ...prevErrs };
                                          const rowErrs = { ...(errs[rowIndex] || {}) };
                                          // 상품명
                                          if (header === "상품명") {
                                            if (!val || val.trim() === "") {
                                              rowErrs["상품명"] = "상품명은 필수입니다.";
                                            } else {
                                              delete rowErrs["상품명"];
                                            }
                                          }
                                          // 상품코드
                                          if (header === "상품코드") {
                                            if (!val || val.trim() === "") {
                                              // Generate code
                                              const today = new Date();
                                              const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
                                              newRows[rowIndex][header] = `PRD-${ymd}-${rowIndex + 1}`;
                                            }
                                          }
                                          // 판매가
                                          if (header === "판매가") {
                                            if (!val || val.trim() === "") {
                                              rowErrs["판매가"] = "판매가는 필수입니다.";
                                            } else {
                                              delete rowErrs["판매가"];
                                            }
                                          }
                                          // 브랜드
                                          if (header === "브랜드") {
                                            if (!val || val.trim() === "") {
                                              rowErrs["브랜드"] = "브랜드는 필수입니다.";
                                            } else {
                                              delete rowErrs["브랜드"];
                                            }
                                          }
                                          // Clean up empty error object
                                          if (Object.keys(rowErrs).length === 0) {
                                            delete errs[rowIndex];
                                          } else {
                                            errs[rowIndex] = rowErrs;
                                          }
                                          return errs;
                                        });
                                        return newRows;
                                      });
                                    }}
                                    type="text"
                                  />
                                  {validationErrors[rowIndex] && validationErrors[rowIndex][header] && (
                                    <div className="text-red-500 text-xs mt-1">
                                      {validationErrors[rowIndex][header]}
          </div>
        )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {fullEditMode
                      ? "* 전체 시트를 편집할 수 있습니다."
                      : "* 상위 10개 행만 표시됩니다. 전체 편집 모드로 전환하려면 체크박스를 클릭하세요."
                    }
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 rounded border text-sm hover:bg-gray-200">
                      상품코드 자동생성
                    </button>
                    <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                      상품 등록 시작
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 파일 업로드 전 초기 화면 */}
        {!uploadedFile && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* CSV 파일 업로드 섹션 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    CSV 파일 업로드
                  </h2>

                  <div className="border-2 border-dashed border-blue-400 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <div className="text-sm text-gray-500 mb-2">
                        지원 형식 CSV (UTF-8) 최대 크기 50MB
                      </div>
                      <div className="text-lg font-medium text-gray-700 mb-4">
                        CSV 파일을 선택하거나 여기로 드래그하세요
                      </div>
                      <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                         파일 선택
                      </div>
                    </label>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-gray-500">업로드한 파일이 없습니다.</div>
                  </div>
                </div>

                {/* 파일 분석 정보 */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      파일 분석 정보
                    </h2>
                    <button 
                      onClick={() => setIsHelpOpen(true)}
                      className="text-blue-600 text-sm hover:text-blue-800"
                    >
                      CSV 도움말
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">총 행수</span>
                      <span className="text-sm font-medium">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">총 열수</span>
                      <span className="text-sm font-medium">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">파일 크기</span>
                      <span className="text-sm font-medium">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">인코딩</span>
                      <span className="text-sm font-medium">-</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 지원 플랫폼 안내 */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
              지원되는 플랫폼 (총 6개)
            </h2>
                  <button 
                    onClick={() => setIsHelpOpen(true)}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    CSV 도움말
                  </button>
                </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">📄</span>
                        <div className="font-medium text-gray-900 text-sm">
                          {platform.name}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {platform.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
                      </div>
                    </div>
                  ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                    <strong> TIP:</strong> CSV 파일을 업로드하면 자동으로 어떤 쇼핑몰의 파일인지 감지합니다. 감지 실패 시 수동으로 플랫폼을 선택할 수 있습니다.
              </div>
            </div>
          </div>
            </>
        )}
      </div>

      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
          <div className={`px-6 py-3 rounded-lg shadow-lg border ${
            toastMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : toastMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {toastMessage.type === 'success' ? '' : 
                 toastMessage.type === 'error' ? '' : ''}
              </span>
              <span className="font-medium">{toastMessage.message}</span>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ProductCsvUploadPage;
