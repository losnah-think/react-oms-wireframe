import React, { useEffect, useState } from "react";
import { Container, Card, Button } from "../../design-system";
import { useToast } from "../../components/ui/Toast";

export default function ProductsTrashPage() {
  const [trashed, setTrashed] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const toast = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("trashed_products_v1");
      if (raw) setTrashed(JSON.parse(raw));
      else setTrashed([]);
    } catch (e) {
      setTrashed([]);
    }
  }, []);

  // refresh helper removed (not used)

  const toggleSelect = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const restoreSelected = () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) {
      toast?.push("복원할 항목을 선택하세요.", "info");
      return;
    }
    const toRestore = trashed.filter((t) => ids.includes(String(t.id)));
    try {
      const rawP = localStorage.getItem("products_local_v1");
      const existingProducts = rawP ? JSON.parse(rawP) : [];
      const existingIds = new Set(
        existingProducts.map((p: any) => String(p.id)),
      );
      const merged = [...existingProducts];
      toRestore.forEach((t) => {
        if (!existingIds.has(String(t.id))) merged.push(t);
      });
      localStorage.setItem("products_local_v1", JSON.stringify(merged));

      const remaining = trashed.filter((t) => !ids.includes(String(t.id)));
      localStorage.setItem("trashed_products_v1", JSON.stringify(remaining));
      try {
        window.dispatchEvent(new CustomEvent("products:updated"));
      } catch (e) {}
      try {
        window.dispatchEvent(new CustomEvent("trashed:updated"));
      } catch (e) {}
      setSelected({});
      setTrashed(remaining);
      toast?.push(`${ids.length}개 항목을 복원했습니다.`, "success");
    } catch (e) {
      console.error(e);
      alert("복원 중 오류");
    }
  };

  const deleteSelectedPermanently = () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) {
      toast?.push("삭제할 항목을 선택하세요.", "info");
      return;
    }
    if (
      !confirm(
        "선택 항목을 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      )
    )
      return;
    const remaining = trashed.filter((t) => !ids.includes(String(t.id)));
    localStorage.setItem("trashed_products_v1", JSON.stringify(remaining));
    try {
      window.dispatchEvent(new CustomEvent("trashed:updated"));
    } catch (e) {}
    setSelected({});
    setTrashed(remaining);
    toast?.push("선택 항목을 영구 삭제했습니다.", "success");
  };

  const emptyTrash = () => {
    if (!confirm("휴지통을 비우면 모든 항목이 영구 삭제됩니다. 진행할까요?"))
      return;
    localStorage.removeItem("trashed_products_v1");
    try {
      window.dispatchEvent(new CustomEvent("trashed:updated"));
    } catch (e) {}
    setSelected({});
    setTrashed([]);
    toast?.push("휴지통이 비워졌습니다.", "success");
  };

  return (
    <Container maxWidth="full" padding="lg" className="bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">상품 휴지통</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={restoreSelected}>
            복원
          </Button>
          <Button variant="danger" onClick={deleteSelectedPermanently}>
            선택 항목 완전 삭제
          </Button>
          <Button variant="ghost" onClick={emptyTrash}>
            비우기
          </Button>
        </div>
      </div>

      <Card padding="lg">
        {trashed.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            휴지통이 비어 있습니다.
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const next: Record<string, boolean> = {};
                      if (checked)
                        trashed.forEach((t) => (next[String(t.id)] = true));
                      setSelected(next);
                    }}
                  />
                </th>
                <th className="px-4 py-2 text-left">상품명</th>
                <th className="px-4 py-2 text-left">상품코드</th>
                <th className="px-4 py-2 text-left">삭제일</th>
                <th className="px-4 py-2">액션</th>
              </tr>
            </thead>
            <tbody>
              {trashed.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!selected[String(t.id)]}
                      onChange={() => toggleSelect(String(t.id))}
                    />
                  </td>
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3">{t.code || "-"}</td>
                  <td className="px-4 py-3">{t.deleted_at || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelected({});
                          try {
                            const remaining = trashed.filter(
                              (x) => x.id !== t.id,
                            );
                            const rawP =
                              localStorage.getItem("products_local_v1");
                            const existingProducts = rawP
                              ? JSON.parse(rawP)
                              : [];
                            const existingIds = new Set(
                              existingProducts.map((p: any) => String(p.id)),
                            );
                            if (!existingIds.has(String(t.id)))
                              existingProducts.push(t);
                            localStorage.setItem(
                              "products_local_v1",
                              JSON.stringify(existingProducts),
                            );
                            localStorage.setItem(
                              "trashed_products_v1",
                              JSON.stringify(remaining),
                            );
                            try {
                              window.dispatchEvent(
                                new CustomEvent("products:updated"),
                              );
                            } catch (e) {}
                            try {
                              window.dispatchEvent(
                                new CustomEvent("trashed:updated"),
                              );
                            } catch (e) {}
                            setTrashed(remaining);
                            toast?.push("복원되었습니다.", "success");
                          } catch (e) {
                            toast?.push("오류", "error");
                          }
                        }}
                      >
                        복원
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (!confirm("영구 삭제하시겠습니까?")) return;
                          try {
                            const remaining = trashed.filter(
                              (x) => x.id !== t.id,
                            );
                            localStorage.setItem(
                              "trashed_products_v1",
                              JSON.stringify(remaining),
                            );
                            try {
                              window.dispatchEvent(
                                new CustomEvent("trashed:updated"),
                              );
                            } catch (e) {}
                            setTrashed(remaining);
                            toast?.push("영구 삭제되었습니다.", "success");
                          } catch (e) {
                            toast?.push("오류", "error");
                          }
                        }}
                      >
                        영구 삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </Container>
  );
}
