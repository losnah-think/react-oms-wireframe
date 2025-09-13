"use client";
import React from "react";

type Interval = {
  id: string;
  minutes: number;
  label: string;
  enabled: boolean;
};

function minutesToLabel(mins: number) {
  if (mins < 60) return `${mins}분`;
  if (mins % 60 === 0) return `${mins / 60}시간`;
  return `${mins}분`;
}

export default function CollectionIntervalsEditor({
  value,
  onChange,
}: {
  value?: Interval[];
  onChange?: (list: Interval[]) => void;
}) {
  const [list, setList] = React.useState<Interval[]>(value ?? []);

  React.useEffect(() => setList(value ?? []), [value]);

  const apply = (next: Interval[]) => {
    setList(next);
    onChange?.(next);
    try {
      window.localStorage.setItem("collectionIntervals", JSON.stringify(next));
    } catch (e) {}
  };

  const addPreset = (minutes: number) => {
    if (list.some((i) => i.minutes === minutes)) return;
    const next = [
      ...list,
      {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
        minutes,
        label: minutesToLabel(minutes),
        enabled: true,
      },
    ];
    apply(next);
  };

  const addCustom = () => {
    const v = prompt("커스텀 분(예: 45) 또는 시간(예: 2h) 입력");
    if (!v) return;
    let minutes = 0;
    if (v.endsWith("h")) minutes = parseInt(v.slice(0, -1), 10) * 60;
    else minutes = parseInt(v, 10);
    if (isNaN(minutes) || minutes <= 0)
      return alert("유효한 숫자를 입력하세요");
    if (minutes < 1) return alert("최소 1분 이상 설정하세요");
    addPreset(minutes);
  };

  const toggle = (id: string) =>
    apply(list.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
  const remove = (id: string) => apply(list.filter((i) => i.id !== id));

  return (
    <div>
      <div className="mb-2">
        <div className="text-sm text-gray-600">수집 주기 설정</div>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            className="px-2 py-1 bg-gray-100 rounded"
            onClick={() => addPreset(5)}
          >
            +5분
          </button>
          <button
            className="px-2 py-1 bg-gray-100 rounded"
            onClick={() => addPreset(15)}
          >
            +15분
          </button>
          <button
            className="px-2 py-1 bg-gray-100 rounded"
            onClick={() => addPreset(30)}
          >
            +30분
          </button>
          <button
            className="px-2 py-1 bg-gray-100 rounded"
            onClick={() => addPreset(60)}
          >
            +1시간
          </button>
          <button className="px-2 py-1 border rounded" onClick={addCustom}>
            + 커스텀
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {list.length === 0 && (
          <div className="text-sm text-gray-500">
            설정된 주기가 없습니다. 프리셋을 추가하세요.
          </div>
        )}
        {list.map((it) => (
          <div
            key={it.id}
            className="flex items-center justify-between border rounded p-2"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={it.enabled}
                onChange={() => toggle(it.id)}
              />
              <div>
                <div className="font-medium">{it.label}</div>
                <div className="text-xs text-gray-500">{it.minutes}분</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="text-sm text-gray-500"
                onClick={() => {
                  const v = prompt(
                    "수정할 분(예: 45) 또는 시간(예: 2h)을 입력",
                    String(it.minutes),
                  );
                  if (!v) return;
                  let minutes = 0;
                  if (v.endsWith("h"))
                    minutes = parseInt(v.slice(0, -1), 10) * 60;
                  else minutes = parseInt(v, 10);
                  if (isNaN(minutes) || minutes <= 0)
                    return alert("유효한 숫자를 입력하세요");
                  const next = list.map((x) =>
                    x.id === it.id
                      ? { ...x, minutes, label: minutesToLabel(minutes) }
                      : x,
                  );
                  apply(next);
                }}
              >
                편집
              </button>
              <button
                className="text-sm text-red-600"
                onClick={() => remove(it.id)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
