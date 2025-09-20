import React, { useRef, useState } from "react";
import { Container, Card, Button, Badge } from "../../design-system";
import * as XLSX from "xlsx";

type Row = Record<string, any>;

const guessHeaders = (rows: Row[]) =>
  rows && rows.length ? Object.keys(rows[0]) : [];

const OptionBulkEditPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [previewChanges, setPreviewChanges] = useState<Row[]>([]);

  const uploadChecklist = [
    "첫 번째 시트만 처리하며, 헤더 행은 필수입니다.",
    "CSV는 UTF-8, Excel은 XLSX/XLS 형식을 권장합니다.",
    "업데이트에 필요한 주요 식별자(option_id 등)를 포함하세요.",
  ];

  const recommendedColumns = [
    {
      label: "option_id / variant_id",
      description: "필수 · 옵션 매칭을 위한 고유 식별자",
    },
    {
      label: "product_id / id",
      description: "부모 상품 식별자 · 옵션 일괄 매핑 시 사용",
    },
    {
      label: "option_name / option_value",
      description: "옵션 표시 텍스트",
    },
    {
      label: "price / selling_price",
      description: "옵션별 판매 가격",
    },
    {
      label: "stock / variant_stock",
      description: "옵션별 재고 수량",
    },
  ];

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    setFileName(f.name);
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<Row>(sheet, { defval: "" });
    setRows(json);
    setHeaders(guessHeaders(json));
    setPreviewChanges(json.slice(0, 50));
  };

  const handleFileInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files && event.target.files[0]
      ? event.target.files[0]
      : null;
    onFile(file);
    event.target.value = "";
  };

  const handleApply = () => {
    // mock apply locally
    setRows((prev) =>
      prev.map((r) => {
        const match = previewChanges.find(
          (p) =>
            p["option_id"] &&
            r["option_id"] &&
            String(p["option_id"]) === String(r["option_id"]),
        );
        return match ? { ...r, ...match } : r;
      }),
    );
    alert("미리보기 변경이 로컬에 적용되었습니다. (모의 적용)");
  };

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "options");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `options-updated-${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCellEdit = (idx: number, key: string, value: string) => {
    setPreviewChanges((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  return (
    <Container maxWidth="lg" padding="md">
      <h1 className="text-2xl font-bold mb-4">옵션 일괄수정</h1>

      <Card padding="lg" className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-3">
            <div>
              <strong className="text-base">업로드 파일 선택</strong>
              <p className="mt-1 text-sm text-gray-600">
                옵션 수정용 CSV 또는 Excel 파일을 업로드하세요. 첫 번째 시트 기준으로
                최대 50행까지 미리보기에서 직접 수정하며 변경 사항을 확인할 수
                있습니다.
              </p>
            </div>
            <ul className="space-y-1 rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              {uploadChecklist.map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary-500" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <Button variant="primary" onClick={triggerFileDialog}>
              파일 선택
            </Button>
            <span className="text-xs text-gray-500">
              {fileName ? `선택된 파일: ${fileName}` : "지원 형식: CSV, XLSX, XLS"}
            </span>
          </div>
        </div>
      </Card>

      <div className="mb-6 grid gap-6 lg:grid-cols-[repeat(24,minmax(0,1fr))] lg:items-start">
        <Card padding="lg" className="lg:col-[span_18]">
          <div className="mb-3">
            <strong className="text-base">필드 미리보기</strong>
            <div className="text-sm text-gray-600">
              파일: {fileName || "없음"} · 행 수: {rows.length} · 열 수: {headers.length}
            </div>
            <p className="mt-1 text-sm text-gray-600">
              미리보기에서 값을 수정하면 모의 적용 버튼을 눌러 로컬 데이터에 반영해 볼 수
              있습니다. 실제 저장은 API 연동 후 지원됩니다.
            </p>
          </div>

          <div className="max-h-96 overflow-auto rounded border">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((h) => (
                    <th className="px-3 py-2 text-left" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewChanges.map((r, ri) => (
                  <tr key={ri} className="border-t">
                    {headers.map((h) => (
                      <td key={h} className="px-2 py-1">
                        <input
                          className="w-full rounded border px-2 py-1 text-sm"
                          value={r[h] ?? ""}
                          onChange={(e) => handleCellEdit(ri, h, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleApply} disabled={!headers.length}>
              미리보기 적용 (모의)
            </Button>
            <Button
              variant="ghost"
              onClick={handleDownload}
              disabled={!rows.length}
            >
              현재 데이터 다운로드
            </Button>
          </div>
        </Card>

        <Card padding="lg" className="lg:col-[span_6]">
          <div className="flex flex-col gap-6 md:flex-row lg:flex-col">
            <div className="flex-1 space-y-3">
              <strong className="text-base">업로드 안내</strong>
              <p className="text-sm text-gray-600">
                아래 체크리스트를 통해 업로드 실패를 줄이고 일관된 데이터 구조를 유지할
                수 있습니다.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>1. 샘플 파일을 참고해 컬럼 이름과 순서를 유지합니다.</li>
                <li>2. 빈값이 필요한 필드는 공백 대신 명확한 기본값을 넣어주세요.</li>
                <li>3. 숫자/날짜 형식은 문자열 대신 실제 데이터 형식을 사용합니다.</li>
              </ul>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                주의: CSV 인코딩(UTF-8)과 쉼표 분리, 날짜 포맷 등을 확인하세요. 실제 반영은
                서버 API와 매핑 규칙 도입 후 동작합니다.
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <strong className="text-base">권장 컬럼</strong>
              <p className="text-sm text-gray-600">
                프로젝트에 맞게 조합해 사용하되 핵심 식별자는 반드시 포함시키세요.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {recommendedColumns.map((column) => (
                  <div
                    key={column.label}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <Badge variant="secondary" size="small" outline>
                      {column.label}
                    </Badge>
                    <p className="mt-2 text-xs text-gray-600">{column.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default OptionBulkEditPage;
