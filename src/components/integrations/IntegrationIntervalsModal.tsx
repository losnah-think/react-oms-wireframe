"use client";
import React from "react";

type Interval = {
  id: string;
  minutes: number;
  label: string;
  enabled: boolean;
};

export default function IntegrationIntervalsModal({
  integrationId,
  value,
  onClose,
  onSave,
}: {
  integrationId: string;
  value?: Interval[];
  onClose: () => void;
  onSave?: (list: Interval[]) => void;
}) {
  const [list, setList] = React.useState<Interval[]>(value ?? []);
  const [undoStack, setUndoStack] = React.useState<Interval[][]>([]);
  const [warning, setWarning] = React.useState<string | null>(null);

  React.useEffect(() => setList(value ?? []), [value]);

  const pushUndo = (prev: Interval[]) =>
    setUndoStack((s) => [prev, ...s].slice(0, 10));

  const addPreset = (minutes: number) => {
    if (list.some((i) => i.minutes === minutes)) {
      setWarning("중복된 주기는 추가되지 않습니다");
      return;
    }
    pushUndo(list);
    setWarning(null);
    setList((prev) => [
      ...prev,
      {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
        minutes,
        label: minutes < 60 ? `${minutes}분` : `${minutes / 60}시간`,
        enabled: true,
      },
    ]);
  };

  const remove = (id: string) => {
    pushUndo(list);
    setList((l) => l.filter((x) => x.id !== id));
  };
  const toggle = (id: string) => {
    pushUndo(list);
    setList((l) =>
      l.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)),
    );
  };

  const move = (idx: number, dir: number) => {
    const next = [...list];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return;
    pushUndo(list);
    const [item] = next.splice(idx, 1);
    next.splice(to, 0, item);
    setList(next);
  };

  const undo = () => {
    const [head, ...rest] = undoStack;
    if (!head) return;
    setList(head);
    setUndoStack(rest);
  };

  const save = () => onSave?.(list);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {integrationId} 수집 주기 설정
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              className="text-sm text-gray-600"
              disabled={undoStack.length === 0}
            >
              Undo
            </button>
            <button onClick={onClose} className="text-gray-500">
              닫기
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            className="px-2 py-1 bg-gray-100 rounded"
            onClick={() => addPreset(5)}
            title="Add 5 minutes"
            aria-label="add-5m"
          >
            +5분
          </button>
          <button
            className="px-2 py-1 bg-gray-100 rounded"
            onClick={() => addPreset(15)}
            title="Add 15 minutes"
            aria-label="add-15m"
          >
            +15분
          </button>
          <button
            className="px-2 py-1 bg-gray-100 rounded"
            onClick={() => addPreset(30)}
            title="Add 30 minutes"
            aria-label="add-30m"
          >
            +30분
          </button>
          <button
            className="px-2 py-1 bg-gray-100 rounded"
            onClick={() => addPreset(60)}
            title="Add 1 hour"
            aria-label="add-1h"
          >
            +1시간
          </button>
        </div>

        {warning && (
          <div className="text-sm text-yellow-600 mb-2">{warning}</div>
        )}

        <div className="space-y-2">
          {list.map((it, idx) => (
            <div
              key={it.id}
              className="flex items-center justify-between border rounded p-2"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={it.enabled}
                  onChange={() => toggle(it.id)}
                  aria-label={`enable-interval-${it.id}`}
                />
                <div>
                  <div className="font-medium">{it.label}</div>
                  <div className="text-xs text-gray-500">{it.minutes}분</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-sm text-gray-500"
                  onClick={() => move(idx, -1)}
                  title="Move up"
                  aria-label={`move-up-${it.id}`}
                >
                  ▲
                </button>
                <button
                  className="text-sm text-gray-500"
                  onClick={() => move(idx, 1)}
                  title="Move down"
                  aria-label={`move-down-${it.id}`}
                >
                  ▼
                </button>
                <button
                  className="text-sm text-gray-500"
                  onClick={() => remove(it.id)}
                  title="Delete"
                  aria-label={`delete-interval-${it.id}`}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <button className="px-3 py-1 border rounded mr-2" onClick={onClose}>
            취소
          </button>
          <button
            className="px-3 py-1 bg-primary-600 text-white rounded"
            onClick={() => {
              save();
              onClose();
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
