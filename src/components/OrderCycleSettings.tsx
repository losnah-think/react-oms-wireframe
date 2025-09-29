import React, { useEffect, useState } from "react";
import Card from "../design-system/components/Card";
import Button from "../design-system/components/Button";
import { mockVendors } from "../data/mockVendors";

type Cycles = {
  orderCollection: string;
  cancelCheck: string;
  shippingProcess: string;
};

const STORAGE_KEY = "integration_order_cycle_v1";

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
  const [vendorSettings, setVendorSettings] = useState<Record<string, boolean>>(
    initial?.vendorSettings ?? Object.fromEntries(mockVendors.map((v) => [v.id, true])),
  );
  const [lastRun, setLastRun] = useState<string | null>(initial?.lastRun ?? null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    // auto-save but also mark clean
    save({ running, cycles, vendorSettings, lastRun });
    setDirty(false);
  }, []); // only load on mount

  useEffect(() => {
    setDirty(true);
  }, [running, cycles, vendorSettings]);

  const toggleVendor = (id: string) => {
    setVendorSettings((s) => ({ ...s, [id]: !s[id] }));
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
    setVendorSettings(Object.fromEntries(mockVendors.map((v) => [v.id, true])));
    setRunning(false);
    setLastRun(null);
    save({ running: false, cycles: DEFAULT_CYCLES, vendorSettings: Object.fromEntries(mockVendors.map((v) => [v.id, true])), lastRun: null });
    setDirty(false);
  };

  const persist = () => {
    save({ running, cycles, vendorSettings, lastRun });
    setDirty(false);
    alert("저장되었습니다.");
  };

  const options = ["1", "5", "10", "15", "30", "60"];

  return (
    <Card className="mb-6 p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">오토봇 설정</h2>
          <div className="text-sm text-gray-600">첨부된 UI를 참고해 주문 수집/처리 주기를 설정합니다.</div>
          <div className="mt-2 text-xs text-gray-500">권장: 10분 이상으로 설정하세요.</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">상태: {running ? <span className="text-green-600">실행중</span> : <span className="text-gray-600">중지</span>}</div>
          {running ? (
            <Button variant="danger" onClick={stop} size="small">일시정지</Button>
          ) : (
            <Button size="small" onClick={start}>시작</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="p-3 border rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-700">발주 확인 / 주문수집</div>
            <div className="text-xs text-gray-500">주기</div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={cycles.orderCollection}
              onChange={(e) => setCycles((c) => ({ ...c, orderCollection: e.target.value }))}
              className="w-full border rounded px-2 py-1"
            >
              {options.map((v) => (
                <option key={v} value={v}>{v}분</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 border rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-700">취소 주문 체크</div>
            <div className="text-xs text-gray-500">주기</div>
          </div>
          <select
            value={cycles.cancelCheck}
            onChange={(e) => setCycles((c) => ({ ...c, cancelCheck: e.target.value }))}
            className="w-full border rounded px-2 py-1"
          >
            {options.map((v) => (
              <option key={v} value={v}>{v}분</option>
            ))}
          </select>
        </div>

        <div className="p-3 border rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-700">판매처 발송 처리</div>
            <div className="text-xs text-gray-500">주기</div>
          </div>
          <select
            value={cycles.shippingProcess}
            onChange={(e) => setCycles((c) => ({ ...c, shippingProcess: e.target.value }))}
            className="w-full border rounded px-2 py-1"
          >
            {options.map((v) => (
              <option key={v} value={v}>{v}분</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-700 mb-2">판매처별 사용 설정</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {mockVendors.map((v) => (
            <div key={v.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <div className="font-medium">{v.name}</div>
                <div className="text-xs text-gray-500">{v.code} • {v.platform}</div>
              </div>
              <div>
                <Button
                  size="small"
                  variant={vendorSettings[v.id] ? "primary" : "ghost"}
                  onClick={() => toggleVendor(v.id)}
                >
                  {vendorSettings[v.id] ? "사용" : "미사용"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">마지막 실행: {lastRun ? new Date(lastRun).toLocaleString() : "-"}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="small" onClick={() => alert('스케줄 설정을 열어줍니다 (개발 필요)')}>
            스케줄 설정
          </Button>
          <Button variant="secondary" size="small" onClick={reset}>리셋</Button>
          <Button onClick={persist} size="small" disabled={!dirty}>저장</Button>
        </div>
      </div>
    </Card>
  );
}
