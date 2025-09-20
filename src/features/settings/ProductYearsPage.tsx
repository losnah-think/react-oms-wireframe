import React from "react";
import { Container, Card } from "../../design-system";

type YearItem = { id: string; year: number };

export default function ProductYearsPage() {
  const [items, setItems] = React.useState<YearItem[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<YearItem | null>(null);
  const [year, setYear] = React.useState<number | "">("");

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("productYears");
      if (raw) setItems(JSON.parse(raw));
      else {
        const seed = [{ id: "y1", year: 2025 }];
        setItems(seed);
        window.localStorage.setItem("productYears", JSON.stringify(seed));
      }
    } catch (e) {}
  }, []);

  const persist = (next: YearItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem("productYears", JSON.stringify(next));
    } catch (e) {}
  };

  const openAdd = () => {
    setEditing(null);
    setYear("");
    setShowModal(true);
  };
  const openEdit = (b: YearItem) => {
    setEditing(b);
    setYear(b.year);
    setShowModal(true);
  };

  const save = () => {
    const y = Number(year);
    if (!y || isNaN(y)) return alert("유효한 연도를 입력하세요");
    if (editing) {
      const next = items.map((i) =>
        i.id === editing.id ? { ...i, year: y } : i,
      );
      persist(next);
    } else {
      const nb: YearItem = { id: `y_${Date.now()}`, year: y };
      persist([...items, nb]);
    }
    setShowModal(false);
  };

  const remove = (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    persist(items.filter((b) => b.id !== id));
  };

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">상품 연도 관리</h1>
            <p className="text-gray-600">
              상품 연도(예: 출시 연도)를 관리합니다.
            </p>
          </div>
          <div>
            <button
              className="px-3 py-2 bg-primary-600 text-white rounded"
              onClick={openAdd}
            >
              연도 추가
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((i) => (
            <div
              key={i.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{i.year}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-sm px-2 py-1 border rounded"
                  onClick={() => openEdit(i)}
                >
                  편집
                </button>
                <button
                  className="text-sm px-2 py-1 border rounded text-red-600"
                  onClick={() => remove(i.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-3">
              {editing ? "연도 편집" : "연도 추가"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700">연도</label>
                <input
                  value={year}
                  onChange={(e) =>
                    setYear(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="mt-1 block w-full border px-3 py-2 rounded"
                />
              </div>
            </div>

            <div className="mt-4 text-right">
              <button
                className="px-3 py-1 border rounded mr-2"
                onClick={() => setShowModal(false)}
              >
                취소
              </button>
              <button
                className="px-3 py-1 bg-primary-600 text-white rounded"
                onClick={save}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
