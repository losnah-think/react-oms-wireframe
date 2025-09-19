import React from "react";
import { Container, Card } from "../../design-system";

type Brand = { id: string; name: string; code?: string };

export default function BrandsPage() {
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Brand | null>(null);
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("mockBrands");
      if (raw) setBrands(JSON.parse(raw));
      else {
        // seed with a few brands
        const seed = [
          { id: "b1", name: "Acme", code: "ACM" },
          { id: "b2", name: "StudioX", code: "STX" },
        ];
        setBrands(seed);
        window.localStorage.setItem("mockBrands", JSON.stringify(seed));
      }
    } catch (e) {}
  }, []);

  const persist = (next: Brand[]) => {
    setBrands(next);
    try {
      window.localStorage.setItem("mockBrands", JSON.stringify(next));
    } catch (e) {}
  };

  const openAdd = () => {
    setEditing(null);
    setName("");
    setCode("");
    setShowModal(true);
  };
  const openEdit = (b: Brand) => {
    setEditing(b);
    setName(b.name);
    setCode(b.code ?? "");
    setShowModal(true);
  };

  const save = () => {
    if (!name.trim()) return alert("브랜드명을 입력하세요");
    if (editing) {
      const next = brands.map((b) =>
        b.id === editing.id
          ? { ...b, name: name.trim(), code: code.trim() || undefined }
          : b,
      );
      persist(next);
    } else {
      const nb: Brand = {
        id: `b_${Date.now()}`,
        name: name.trim(),
        code: code.trim() || undefined,
      };
      persist([...brands, nb]);
    }
    setShowModal(false);
  };

  const remove = (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    persist(brands.filter((b) => b.id !== id));
  };

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">브랜드 관리</h1>
            <p className="text-gray-600">
              브랜드 목록을 추가, 편집 및 삭제합니다.
            </p>
          </div>
          <div>
            <button
              className="px-3 py-2 bg-primary-600 text-white rounded"
              onClick={openAdd}
            >
              브랜드 추가
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {brands.length === 0 && (
            <div className="text-sm text-gray-500">
              등록된 브랜드가 없습니다.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {brands.map((b) => (
              <div
                key={b.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-gray-500">{b.code ?? "-"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-sm px-2 py-1 border rounded"
                    onClick={() => openEdit(b)}
                  >
                    편집
                  </button>
                  <button
                    className="text-sm px-2 py-1 border rounded text-red-600"
                    onClick={() => remove(b.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-3">
              {editing ? "브랜드 편집" : "브랜드 추가"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700">브랜드명</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">
                  코드 (선택)
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
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
