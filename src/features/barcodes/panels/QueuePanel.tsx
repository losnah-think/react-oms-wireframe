import React from "react";
import { Table, Button, Badge } from "../../../design-system";
import type { QueueItem } from "../useBarcodeSettings";

type Props = {
  queue: QueueItem[];
  selectedQueueIds: string[];
  setSelectedQueueIds: (keys: string[]) => void;
  removeQueueItems: () => void;
  clearQueue: () => void;
  updateQueueStatus: (status: QueueItem["status"]) => void;
};

const QueuePanel: React.FC<Props> = ({
  queue,
  selectedQueueIds,
  setSelectedQueueIds,
  removeQueueItems,
  clearQueue,
  updateQueueStatus,
}) => {
  const columns = [
    {
      key: "sanitizedName",
      title: "상품명",
      render: (value: any, record: QueueItem) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{record.sanitizedName}</span>
          <span className="text-xs text-gray-500">원본: {record.productName}</span>
        </div>
      ),
    },
    { key: "sku", title: "SKU" },
    {
      key: "quantity",
      title: "수량",
      render: (value: any, record: QueueItem) => (
        <input
          type="number"
          min={1}
          className="w-20 rounded-md border border-gray-200 px-2 py-1 text-sm"
          value={record.quantity}
          onChange={(event) => {
            const next = Number((event.target as HTMLInputElement).value) || 1;
            record.quantity = next; // local mutation is okay for small demo
          }}
        />
      ),
    },
    {
      key: "templateId",
      title: "사용 템플릿",
      render: (_: any, record: QueueItem) => (
        <Badge size="small" variant="secondary">{record.templateId}</Badge>
      ),
    },
    {
      key: "status",
      title: "상태",
      render: (value: any) => <Badge size="small">{value}</Badge>,
    },
    { key: "createdAt", title: "등록일" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">인쇄 대기열</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="small" onClick={removeQueueItems}>
            선택 삭제
          </Button>
          <Button variant="outline" size="small" onClick={clearQueue}>
            대기열 비우기
          </Button>
        </div>
      </div>

  <Table bordered columns={columns as any} data={queue} size="small" rowSelection={{ selectedRowKeys: selectedQueueIds, onChange: (keys: any) => setSelectedQueueIds(keys) }} />

      <div className="rounded-md border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-800">배치 작업</h3>
        <div className="mt-3 flex gap-2">
          <Button onClick={() => updateQueueStatus("인쇄중")}>선택 인쇄중</Button>
          <Button onClick={() => updateQueueStatus("인쇄완료")}>선택 인쇄완료</Button>
        </div>
      </div>
    </div>
  );
};

export default QueuePanel;
