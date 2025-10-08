import React, { useEffect, useState } from "react";
import Card from "../design-system/components/Card";
import Button from "../design-system/components/Button";
import Modal from "../design-system/components/Modal";
import Input from "../design-system/components/Input";
import { mockVendors } from "../data/mockVendors";

type Cycles = {
  orderCollection: string;
  cancelCheck: string;
  shippingProcess: string;
};

type VendorCycle = {
  enabled: boolean;
  interval: string;
};

const STORAGE_KEY = "integration_order_cycle_v2";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function save(data: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

const DEFAULT_CYCLES: Cycles = {
  orderCollection: "10",
  cancelCheck: "10",
  shippingProcess: "10",
};

export default function OrderCycleSettings() {
  const initial = load();
  const [running, setRunning] = useState<boolean>(initial?.running ?? false);
  const [cycles, setCycles] = useState<Cycles>(initial?.cycles ?? DEFAULT_CYCLES);
  const [vendorCycles, setVendorCycles] = useState<Record<string, VendorCycle>>(
    initial?.vendorCycles ?? Object.fromEntries(mockVendors.map((v) => [v.id, { enabled: true, interval: "10" }])),
  );
  const [lastRun, setLastRun] = useState<string | null>(initial?.lastRun ?? null);
  const [dirty, setDirty] = useState(false);
  const [showGlobalModal, setShowGlobalModal] = useState(false);

  useEffect(() => {
    // auto-save but also mark clean
    save({ running, cycles, vendorCycles, lastRun });
    setDirty(false);
  }, []); // only load on mount

  useEffect(() => {
    setDirty(true);
  }, [running, cycles, vendorCycles]);

  const toggleVendor = (id: string) => {
    setVendorCycles((s) => ({ 
      ...s, 
      [id]: { ...s[id], enabled: !s[id].enabled } 
    }));
  };

  const updateVendorInterval = (id: string, interval: string) => {
    setVendorCycles((s) => ({ 
      ...s, 
      [id]: { ...s[id], interval } 
    }));
  };

  const start = () => {
    setRunning(true);
    const now = new Date().toISOString();
    setLastRun(now);
    setDirty(true);
  };
  const stop = () => {
    setRunning(false);
    setDirty(true);
  };

  const reset = () => {
    if (!confirm("설정을 기본값으로 초기화하시겠습니까?")) return;
    setCycles(DEFAULT_CYCLES);
    setVendorCycles(Object.fromEntries(mockVendors.map((v) => [v.id, { enabled: true, interval: "10" }])));
    setRunning(false);
    setLastRun(null);
    save({ running: false, cycles: DEFAULT_CYCLES, vendorCycles: Object.fromEntries(mockVendors.map((v) => [v.id, { enabled: true, interval: "10" }])), lastRun: null });
    setDirty(false);
  };

  const persist = () => {
    save({ running, cycles, vendorCycles, lastRun });
    setDirty(false);
    alert("저장되었습니다.");
  };

  const options = ["1", "5", "10", "15", "30", "60"];

  return (
    <>
      <Card className="mb-6 p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">수집 주기 설정</h2>
            <div className="text-sm text-gray-600 mt-1">판매처별 주문 수집 실행 주기를 설정합니다</div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="small" onClick={() => setShowGlobalModal(true)}>
              전체 주기 설정
            </Button>
            <div className="text-sm text-gray-500">
              {running ? <span className="text-green-600">실행중</span> : <span className="text-gray-600">중지</span>}
            </div>
            {running ? (
              <Button variant="outline" onClick={stop} size="small">일시정지</Button>
            ) : (
              <Button size="small" onClick={start}>시작</Button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-3">판매처별 설정</div>
          <div className="space-y-2">
            {mockVendors.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3 flex-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={vendorCycles[v.id]?.enabled ?? true}
                      onChange={() => toggleVendor(v.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 font-medium text-gray-900">{v.name}</span>
                  </label>
                  <span className="text-sm text-gray-500">{v.platform}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">실행 주기</span>
                  <select
                    value={vendorCycles[v.id]?.interval ?? "10"}
                    onChange={(e) => updateVendorInterval(v.id, e.target.value)}
                    disabled={!vendorCycles[v.id]?.enabled}
                    className="border rounded px-3 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    {options.map((val) => (
                      <option key={val} value={val}>{val}분</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-500">
            마지막 실행: {lastRun ? new Date(lastRun).toLocaleString('ko-KR') : "-"}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="small" onClick={reset}>초기화</Button>
            <Button onClick={persist} size="small" disabled={!dirty}>저장</Button>
          </div>
        </div>
      </Card>

      {/* 전체 주기 설정 모달 */}
      <Modal
        open={showGlobalModal}
        onClose={() => setShowGlobalModal(false)}
        title="전체 주기 설정"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              주문 수집 주기
            </label>
            <select
              value={cycles.orderCollection}
              onChange={(e) => setCycles((c) => ({ ...c, orderCollection: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {options.map((v) => (
                <option key={v} value={v}>{v}분</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              취소 주문 체크 주기
            </label>
            <select
              value={cycles.cancelCheck}
              onChange={(e) => setCycles((c) => ({ ...c, cancelCheck: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {options.map((v) => (
                <option key={v} value={v}>{v}분</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              발송 처리 주기
            </label>
            <select
              value={cycles.shippingProcess}
              onChange={(e) => setCycles((c) => ({ ...c, shippingProcess: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {options.map((v) => (
                <option key={v} value={v}>{v}분</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowGlobalModal(false)} fullWidth>
              취소
            </Button>
            <Button onClick={() => setShowGlobalModal(false)} fullWidth>
              확인
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
