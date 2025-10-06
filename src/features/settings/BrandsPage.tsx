import React from "react";
import { Container, Card, Button, Input } from "../../design-system";

type Brand = { id: string; name: string; code?: string };

export default function BrandsPage() {
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [newBrand, setNewBrand] = React.useState("");
  const [newCode, setNewCode] = React.useState("");

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("mockBrands");
      if (raw) setBrands(JSON.parse(raw));
      else {
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

  const addBrand = () => {
    if (!newBrand.trim()) return alert("브랜드명을 입력해주세요");
    const nb: Brand = {
      id: `b_${Date.now()}`,
      name: newBrand.trim(),
      code: newCode.trim() || undefined,
    };
    persist([...brands, nb]);
    setNewBrand("");
    setNewCode("");
  };

  const removeBrand = (id: string) => {
    if (!confirm("이 브랜드를 정말 삭제하시겠습니까? 삭제된 브랜드는 복구할 수 없습니다.")) return;
    persist(brands.filter((b) => b.id !== id));
  };

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">브랜드 관리</h1>
            <p className="text-gray-600">
              브랜드 목록을 추가 및 삭제합니다.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="브랜드명"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
            />
            <Input
              placeholder="코드 (선택)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <Button onClick={addBrand}>추가</Button>
          </div>
        </div>

        <div className="space-y-3">
          {brands.length === 0 && (
            <div className="text-sm text-gray-500">
              아직 등록된 브랜드가 없습니다
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
                <Button variant="ghost" onClick={() => removeBrand(b.id)}>
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Container>
  );
}
