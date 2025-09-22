import React from 'react';
import { useRouter } from 'next/router';
import { Container, Card, Button, Stack } from '@/design-system/components';
import { clientBarcodeStore } from '../../lib/clientBarcodeStore';

interface OptionEditPageProps {
  product: any;
  currentVariant: any;
  updateCurrentVariant: (updater: (draft: any) => void) => void;
  optionKey: string | null;
}

const OptionEditPage: React.FC<OptionEditPageProps> = ({
  product,
  currentVariant,
  updateCurrentVariant,
  optionKey,
}) => {
  const router = useRouter();

  const v = currentVariant || {};
  const selling = Number(v.selling_price ?? 0);
  const supply = Number(v.supply_price ?? 0);
  const cost = Number(v.cost_price ?? 0);
  const marginAmt = Number.isFinite(selling - supply)
    ? Number((selling - supply).toFixed(2))
    : Number.isFinite(selling - cost)
      ? Number((selling - cost).toFixed(2))
      : 0;

  const backToDetail = () => {
    const pid = product?.id ?? '';
    const path = `/products/${encodeURIComponent(String(pid))}`;
    try { router?.push?.(path); } catch { if (typeof window !== "undefined") window.location.href = path; }
  };

  const handleSave = () => {
    // Placeholder save: in the real app this should call the parent's save/update flow
    // For now just navigate back to the product detail page after 'saving'
    try {
      const barcodeValue = v.barcode ?? v.barcode1 ?? null;
      const storeId = v.id ? String(v.id) + `-${product?.id}` : String(product?.id ?? '');
      clientBarcodeStore.updateProductBarcode(storeId, barcodeValue);
    } catch (e) {
      console.warn('failed to save barcode to client store', e);
    }
    backToDetail();
  };

  const openInboundCalendar = () => {
    // Placeholder: open inbound schedule/calendar UI
    // In the real app this should call the calendar component or open a modal
    // For now we'll just alert and leave a TODO comment for integration
    if (typeof window !== 'undefined') alert('입고 일정표 호출 (TODO: integrate calendar modal)');
  };

  return (
    <Container maxWidth="6xl" padding="lg" className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">옵션정보-수정</h1>
          <div className="mt-1 text-xs text-gray-500">상품 ID: {product?.id} / 옵션 식별자: {String(optionKey || "")}</div>
          <div className="mt-2 text-sm text-gray-700">{product?.name || product?.product_name || ''}</div>
        </div>
        <Stack direction="row" gap={2}>
          <Button variant="primary" onClick={handleSave}>수정</Button>
          <Button variant="ghost" onClick={backToDetail}>취소</Button>
        </Stack>
      </div>

      {/* 기본 정보 */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
          {/* 1 바코드번호(필수) */}
          <div>
            <div className="text-gray-600 mb-1">바코드번호<span className="text-red-500 ml-1">*</span></div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.barcode ?? v.barcode1 ?? ""}
              onChange={(e) => updateCurrentVariant((d) => { d.barcode = e.target.value; d.barcode1 = e.target.value; })}
            />
          </div>
          {/* 2 새로운바코드 */}
          <div>
            <div className="text-gray-600 mb-1">새로운바코드</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.new_barcode ?? ""}
              onChange={(e) => updateCurrentVariant((d) => { d.new_barcode = e.target.value; })}
            />
          </div>
          {/* 3 바코드번호2 */}
          <div>
            <div className="text-gray-600 mb-1">바코드번호2</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.barcode2 ?? ""}
              onChange={(e) => updateCurrentVariant((d) => { d.barcode2 = e.target.value; })}
            />
          </div>
          {/* 4 바코드번호3 */}
          <div>
            <div className="text-gray-600 mb-1">바코드번호3</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.barcode3 ?? ""}
              onChange={(e) => updateCurrentVariant((d) => { d.barcode3 = e.target.value; })}
            />
          </div>
          {/* 5 옵션공급처명 */}
          <div>
            <div className="text-gray-600 mb-1">옵션공급처명</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.option_supplier_name ?? v.extra_fields?.option_supplier_name ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.option_supplier_name = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), option_supplier_name: e.target.value };
              })}
            />
          </div>
          {/* 6 옵션명(필수, ≤50자) */}
          <div>
            <div className="text-gray-600 mb-1">옵션명<span className="text-red-500 ml-1">*</span></div>
            <input
              maxLength={50}
              className="w-full px-3 py-2 border rounded"
              value={v.variant_name || ""}
              onChange={(e) => updateCurrentVariant((d) => { d.variant_name = e.target.value; })}
            />
          </div>
          {/* 7 사입옵션명 */}
          <div>
            <div className="text-gray-600 mb-1">사입옵션명</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.purchase_variant_name ?? v.extra_fields?.purchase_variant_name ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.purchase_variant_name = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), purchase_variant_name: e.target.value };
              })}
            />
          </div>
          {/* 8 옵션코드(필수) */}
          <div>
            <div className="text-gray-600 mb-1">옵션코드<span className="text-red-500 ml-1">*</span></div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.code || ""}
              onChange={(e) => updateCurrentVariant((d) => { d.code = e.target.value; })}
            />
          </div>
          {/* 24 판매처옵션코드 */}
          <div>
            <div className="text-gray-600 mb-1">판매처옵션코드</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.channel_option_code ?? ""}
              onChange={(e) => updateCurrentVariant((d) => { d.channel_option_code = e.target.value; })}
            />
          </div>
          {/* 판매처별 옵션코드 (추가 이미 존재) -- 사입옵션명 추가 필드 */}
          <div>
            <div className="text-gray-600 mb-1">사입옵션명</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.purchase_variant_name ?? v.extra_fields?.purchase_variant_name ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.purchase_variant_name = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), purchase_variant_name: e.target.value };
              })}
            />
          </div>
          {/* 25 판매처별 옵션코드 */}
          <div>
            <div className="text-gray-600 mb-1">판매처별 옵션코드</div>
            <input
              className="w-full px-3 py-2 border rounded"
              placeholder="예: NAVER:OPT-1; CAFE24:OPT-2"
              value={v.channel_option_codes ?? v.extra_fields?.channel_option_codes ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.channel_option_codes = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), channel_option_codes: e.target.value };
              })}
            />
          </div>
        </div>
      </Card>

      {/* 가격 정보 */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">가격 정보</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
          {/* 10 원가(선택) */}
          <div>
            <div className="text-gray-600 mb-1">원가</div>
            <input
              className="w-full px-3 py-2 border rounded text-right"
              value={String(v.cost_price ?? 0)}
              onChange={(e) => updateCurrentVariant((d) => { d.cost_price = Number(e.target.value || 0); })}
            />
          </div>
          {/* 11 판매단가(필수) */}
          <div>
            <div className="text-gray-600 mb-1">판매단가<span className="text-red-500 ml-1">*</span></div>
            <input
              className="w-full px-3 py-2 border rounded text-right"
              value={String(v.selling_price ?? 0)}
              onChange={(e) => updateCurrentVariant((d) => { d.selling_price = Number(e.target.value || 0); })}
            />
          </div>
          {/* 13/20 옵션공급가 */}
          <div>
            <div className="text-gray-600 mb-1">옵션공급가</div>
            <input
              className="w-full px-3 py-2 border rounded text-right"
              value={String(v.supply_price ?? 0)}
              onChange={(e) => updateCurrentVariant((d) => { d.supply_price = Number(e.target.value || 0); })}
            />
          </div>
          {/* 12 마진금액 */}
          <div>
            <div className="text-gray-600 mb-1">마진금액</div>
            <input
              className="w-full px-3 py-2 border rounded text-right"
              value={String(
                v.margin_amount ??
                ((Number(v.selling_price || 0) - Number(v.supply_price || v.cost_price || 0)) || 0)
              )}
              onChange={(e) => updateCurrentVariant((d) => { d.margin_amount = Number(e.target.value || 0); })}
            />
          </div>
          {/* 29 해외통화옵션가 */}
          <div>
            <div className="text-gray-600 mb-1">해외통화옵션가</div>
            <input
              className="w-full px-3 py-2 border rounded text-right"
              value={v.foreign_currency_price ?? v.extra_fields?.foreign_currency_price ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.foreign_currency_price = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), foreign_currency_price: e.target.value };
              })}
            />
          </div>
        </div>
      </Card>

      {/* 재고 · 출고 및 상태 */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">재고 · 출고 및 상태</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
          {/* 9 안정재고 */}
          <div>
            <div className="text-gray-600 mb-1">안정재고</div>
            <input
              className="w-full px-3 py-2 border rounded text-right"
              value={v.safety_stock ?? v.extra_fields?.safety_stock ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.safety_stock = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), safety_stock: e.target.value };
              })}
            />
          </div>
          {/* 14 상품위치 */}
          <div>
            <div className="text-gray-600 mb-1">상품위치</div>
            <select
              className="w-full px-3 py-2 border rounded bg-white"
              value={v.warehouse_location ?? v.extra_fields?.warehouse_location ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.warehouse_location = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), warehouse_location: e.target.value };
              })}
            >
              <option value="">선택</option>
              <option value="국내재고">국내재고</option>
              <option value="출고존">출고존</option>
              <option value="보관존">보관존</option>
              <option value="입고존">입고존</option>
              <option value="가상재고">가상재고</option>
              <option value="불량재고">불량재고</option>
              <option value="해외재고">해외재고</option>
              <option value="본사_보관존">본사_보관존</option>
              <option value="본사_입고존">본사_입고존</option>
              <option value="본사_출고존">본사_출고존</option>
            </select>
          </div>
          {/* 23 창고별상품위치일괄수정 */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={!!v.bulk_location_apply}
                onChange={(e) => updateCurrentVariant((d) => { d.bulk_location_apply = e.target.checked; })}
              />
              창고별상품위치일괄수정
            </label>
          </div>
          {/* 19 발송및출고자동화여부 */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={!!v.is_auto_dispatch}
                onChange={(e) => updateCurrentVariant((d) => { d.is_auto_dispatch = e.target.checked; })}
              />
              발송및출고자동화여부
            </label>
          </div>
          {/* 22 미진열출고여부 */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={!!v.is_hidden_sale_dispatch}
                onChange={(e) => updateCurrentVariant((d) => { d.is_hidden_sale_dispatch = e.target.checked; })}
              />
              미진열출고여부
            </label>
          </div>
          {/* 26 재고연동여부(필수) */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={!!v.is_stock_linked}
                onChange={(e) => updateCurrentVariant((d) => { d.is_stock_linked = e.target.checked; })}
              />
              재고연동여부<span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {/* 15 판매여부(필수) & 16 품절여부(필수) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div>
              <div className="text-gray-600 mb-1">판매상태</div>
              <select
                className="w-full px-3 py-2 border rounded bg-white"
                value={v.sale_status ?? v.extra_fields?.sale_status ?? "판매중"}
                onChange={(e) => updateCurrentVariant((d) => { d.sale_status = e.target.value; d.extra_fields = { ...(d.extra_fields || {}), sale_status: e.target.value }; })}
              >
                <option value="판매중">판매중</option>
                <option value="미판매">미판매</option>
                <option value="이월">이월</option>
                <option value="반송">반송</option>
              </select>
            </div>
            <div>
              <div className="text-gray-600 mb-1">품절여부</div>
              <select
                className="w-full px-3 py-2 border rounded bg-white"
                value={v.soldout_status ?? v.extra_fields?.soldout_status ?? "미품절"}
                onChange={(e) => updateCurrentVariant((d) => { d.soldout_status = e.target.value; d.extra_fields = { ...(d.extra_fields || {}), soldout_status: e.target.value }; })}
              >
                <option value="미품절">미품절</option>
                <option value="품절">품절</option>
                <option value="임시품절">임시품절</option>
                <option value="소진시 품절">소진시 품절</option>
                <option value="공장소진 품절">공장소진 품절</option>
              </select>
            </div>
            <div>
              <div className="text-gray-600 mb-1">관리등급</div>
              <select
                className="w-full px-3 py-2 border rounded bg-white"
                value={v.grade ?? v.extra_fields?.grade ?? "일반관리"}
                onChange={(e) => updateCurrentVariant((d) => { d.grade = e.target.value; d.extra_fields = { ...(d.extra_fields || {}), grade: e.target.value }; })}
              >
                <option value="일반관리">일반관리</option>
                <option value="우수관리">우수관리</option>
                <option value="특별관리">특별관리</option>
              </select>
            </div>
          </div>
          {/* 17 관리등급 */}
          <div>
            <div className="text-gray-600 mb-1">관리등급</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.grade ?? v.extra_fields?.grade ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.grade = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), grade: e.target.value };
              })}
            />
          </div>
          {/* 30 박스당수량 */}
          <div>
            <div className="text-gray-600 mb-1">박스당수량</div>
            <input
              className="w-full px-3 py-2 border rounded text-right"
              value={v.box_quantity ?? v.extra_fields?.box_quantity ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.box_quantity = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), box_quantity: e.target.value };
              })}
            />
          </div>
        </div>
      </Card>

      {/* 입고 일정표 및 입고예정 */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">입고 일정</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm items-center">
          <div>
            <div className="text-gray-600 mb-1">입고 일정표</div>
            <Button variant="ghost" onClick={openInboundCalendar}>입고 일정표로 이동</Button>
          </div>
          <div>
            <div className="text-gray-600 mb-1">입고 예정일</div>
            <input className="w-full px-3 py-2 border rounded bg-gray-100" value={v.inbound_expected_date ?? v.extra_fields?.inbound_expected_date ?? ""} readOnly />
          </div>
          <div>
            <div className="text-gray-600 mb-1">입고 예정수량</div>
            <input className="w-full px-3 py-2 border rounded text-right bg-gray-100" value={String(v.inbound_expected_qty ?? v.extra_fields?.inbound_expected_qty ?? 0)} readOnly />
          </div>
        </div>
        <div className="mt-2">
          <Button variant="secondary" onClick={() => updateCurrentVariant((d) => { d.inbound_schedule_added = true; })}>일정 추가</Button>
        </div>
      </Card>

      {/* 추가 정보 */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
          {/* 27 가로, 세로, 높이 */}
          <div>
            <div className="text-gray-600 mb-1">가로(cm)</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.width_cm ?? v.extra_fields?.width_cm ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.width_cm = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), width_cm: e.target.value };
              })}
            />
          </div>
          <div>
            <div className="text-gray-600 mb-1">세로(cm)</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.height_cm ?? v.extra_fields?.height_cm ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.height_cm = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), height_cm: e.target.value };
              })}
            />
          </div>
          <div>
            <div className="text-gray-600 mb-1">높이(cm)</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.depth_cm ?? v.extra_fields?.depth_cm ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.depth_cm = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), depth_cm: e.target.value };
              })}
            />
          </div>
          {/* 28 무게, 부피 */}
          <div>
            <div className="text-gray-600 mb-1">무게(g)</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.weight_g ?? v.extra_fields?.weight_g ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.weight_g = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), weight_g: e.target.value };
              })}
            />
          </div>
          <div>
            <div className="text-gray-600 mb-1">부피</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.volume ?? v.extra_fields?.volume ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.volume = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), volume: e.target.value };
              })}
            />
          </div>
          {/* 31 제조원, 32 제조국, 33 제품소재, 34 제품유형 */}
          <div>
            <div className="text-gray-600 mb-1">제조원</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.manufacturer ?? v.extra_fields?.manufacturer ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.manufacturer = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), manufacturer: e.target.value };
              })}
            />
          </div>
          <div>
            <div className="text-gray-600 mb-1">제조국</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.made_in ?? v.extra_fields?.made_in ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.made_in = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), made_in: e.target.value };
              })}
            />
          </div>
          <div>
            <div className="text-gray-600 mb-1">제품소재</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.material ?? v.extra_fields?.material ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.material = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), material: e.target.value };
              })}
            />
          </div>
          <div>
            <div className="text-gray-600 mb-1">제품유형</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.product_type ?? v.extra_fields?.product_type ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.product_type = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), product_type: e.target.value };
              })}
            />
          </div>
          {/* 35 주의사항, 36 사용기준 */}
          <div>
            <div className="text-gray-600 mb-1">주의사항</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.cautions ?? v.extra_fields?.cautions ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.cautions = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), cautions: e.target.value };
              })}
            />
          </div>
          <div>
            <div className="text-gray-600 mb-1">사용기준</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.usage_standard ?? v.extra_fields?.usage_standard ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.usage_standard = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), usage_standard: e.target.value };
              })}
            />
          </div>
          {/* 37 색상, 38 사이즈 */}
          <div>
            <div className="text-gray-600 mb-1">색상</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.color ?? v.extra_fields?.color ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.color = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), color: e.target.value };
              })}
            />
          </div>
          <div>
            <div className="text-gray-600 mb-1">사이즈</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={v.size ?? v.extra_fields?.size ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.size = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), size: e.target.value };
              })}
            />
          </div>
          {/* 21 옵션메모1~5 */}
          <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[1,2,3,4,5].map((n) => (
              <div key={n}>
                <div className="text-gray-600 mb-1">{`옵션메모${n}`}</div>
                <input
                  className="w-full px-3 py-2 border rounded"
                  value={Array.isArray(v.option_memos) && v.option_memos[n-1] ? v.option_memos[n-1] : ""}
                  onChange={(e) => updateCurrentVariant((d) => {
                    const arr = Array.isArray(d.option_memos) ? [...d.option_memos] : [];
                    arr[n-1] = e.target.value;
                    d.option_memos = arr;
                  })}
                />
              </div>
            ))}
          </div>
          {/* 18 비고 */}
          <div className="lg:col-span-2">
            <div className="text-gray-600 mb-1">비고</div>
            <textarea
              className="w-full h-28 px-3 py-2 border rounded"
              value={v.remark ?? v.extra_fields?.remark ?? ""}
              onChange={(e) => updateCurrentVariant((d) => {
                d.remark = e.target.value;
                d.extra_fields = { ...(d.extra_fields || {}), remark: e.target.value };
              })}
            />
          </div>
        </div>

        {/* 메타: 등록/수정일, 발주상태 */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-gray-600 mb-1">등록일자</div>
            <input className="w-full px-3 py-2 border rounded bg-gray-100" value={product?.created_at ?? product?.createdAt ?? ''} readOnly />
          </div>
          <div>
            <div className="text-gray-600 mb-1">최종수정일자</div>
            <input className="w-full px-3 py-2 border rounded bg-gray-100" value={product?.updated_at ?? product?.updatedAt ?? ''} readOnly />
          </div>
          <div>
            <div className="text-gray-600 mb-1">발주상태</div>
            <select
              className="w-full px-3 py-2 border rounded bg-white"
              value={v.order_status ?? v.extra_fields?.order_status ?? "선택안함"}
              onChange={(e) => updateCurrentVariant((d) => { d.order_status = e.target.value; d.extra_fields = { ...(d.extra_fields || {}), order_status: e.target.value }; })}
            >
              <option value="선택안함">선택안함</option>
              <option value="발주진행">발주진행</option>
              <option value="발주미진행">발주미진행</option>
              <option value="시즌종료">시즌종료</option>
              <option value="발주 종료">발주 종료</option>
            </select>
          </div>
        </div>

        {/* 하단 액션: 수정 / 취소 */}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="primary" onClick={handleSave}>수정</Button>
          <Button variant="secondary" onClick={backToDetail}>취소</Button>
        </div>
      </Card>
    </Container>
  );
};

export default OptionEditPage;