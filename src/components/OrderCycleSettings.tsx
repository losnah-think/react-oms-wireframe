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

export default function OrderCycleSettings() {
  const initial = load();
  const [running, setRunning] = useState<boolean>(initial?.running ?? false);
  const [cycles, setCycles] = useState<Cycles>(
    initial?.cycles ?? {
      orderCollection: "10",
      cancelCheck: "10",
      shippingProcess: "10",
    },
  );
  const [vendorSettings, setVendorSettings] = useState<Record<string, boolean>>(
    initial?.vendorSettings ?? Object.fromEntries(mockVendors.map((v) => [v.id, true])),
  );
  const [lastRun, setLastRun] = useState<string | null>(initial?.lastRun ?? null);

  useEffect(() => {
    save({ running, cycles, vendorSettings, lastRun });
  }, [running, cycles, vendorSettings, lastRun]);

  const toggleVendor = (id: string) => {
    setVendorSettings((s) => ({ ...s, [id]: !s[id] }));
  };

  const start = () => {
    setRunning(true);
    const now = new Date().toISOString();
    setLastRun(now);
  };
  const stop = () => setRunning(false);

  const options = ["1", "5", "10", "15", "30", "60"].map((v) => (
    <option key={v} value={v}>{v}분</option>
  ));

  return (
    <Card className="mb-6 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-semibold">오토봇 설정</h2>
          <div className="text-sm text-gray-600">자동 수집/처리의 실행 주기를 설정하세요.</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500 mr-3">상태: {running ? <span className="text-green-600">실행중</span> : <span className="text-gray-600">중지</span>}</div>
          {running ? (
            <Button variant="danger" onClick={stop}>일시정지</Button>
          ) : (
            <Button onClick={start}>시작</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="p-3 border rounded">
          <div className="text-sm text-gray-500 mb-2">발주 확인 / 주문수집</div>
          <select
            value={cycles.orderCollection}
            onChange={(e) => setCycles((c) => ({ ...c, orderCollection: e.target.value }))}
            className="w-full border rounded px-2 py-1"
          >
            {options}
          </select>
        </div>

        <div className="p-3 border rounded">
          <div className="text-sm text-gray-500 mb-2">취소 주문 체크</div>
          <select
            value={cycles.cancelCheck}
            onChange={(e) => setCycles((c) => ({ ...c, cancelCheck: e.target.value }))}
            className="w-full border rounded px-2 py-1"
          >
            {options}
          </select>
        </div>

        <div className="p-3 border rounded">
          <div className="text-sm text-gray-500 mb-2">판매처 발송 처리</div>
          <select
            value={cycles.shippingProcess}
            onChange={(e) => setCycles((c) => ({ ...c, shippingProcess: e.target.value }))}
            className="w-full border rounded px-2 py-1"
          >
            {options}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-500 mb-2">판매처별 설정</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {mockVendors.map((v) => (
            <div key={v.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <div className="font-medium">{v.name}</div>
                <div className="text-xs text-gray-500">{v.code} • {v.platform}</div>
              </div>
              <div>
                <button
                  onClick={() => toggleVendor(v.id)}
                  className={`px-2 py-1 rounded text-sm ${vendorSettings[v.id] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  {vendorSettings[v.id] ? '사용' : '미사용'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        마지막 실행: {lastRun ? new Date(lastRun).toLocaleString() : "-"}
      </div>
    </Card>
  );
}
