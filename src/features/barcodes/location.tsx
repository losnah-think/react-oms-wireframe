import React from "react";
import { Container, Card, Button, Grid, GridCol, GridRow } from "../../design-system";

type Location = {
  id: number;
  code: string;
  created_at: string;
};

const SAMPLE_LOCATIONS: Location[] = [
  { id: 1, code: "A-01-01", created_at: "2025-01-01 10:00:00" },
  { id: 2, code: "A-01-02", created_at: "2025-01-01 10:00:00" },
  { id: 3, code: "A-01-03", created_at: "2025-01-01 10:00:00" },
  { id: 4, code: "B-01-01", created_at: "2025-01-01 10:00:00" },
  { id: 5, code: "B-01-02", created_at: "2025-01-01 10:00:00" },
];

const LocationBarcodesPage: React.FC = () => {
  const [locations, setLocations] = React.useState<Location[]>(SAMPLE_LOCATIONS);
  const [query, setQuery] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [newLocationCode, setNewLocationCode] = React.useState("");

  const filteredLocations = locations.filter((loc) =>
    loc.code.toLowerCase().includes(query.toLowerCase())
  );

  const handleEdit = (location: Location) => {
    setEditingId(location.id);
    setEditValue(location.code);
  };

  const handleSave = () => {
    if (!editingId) return;

    setLocations(prev =>
      prev.map(loc =>
        loc.id === editingId ? { ...loc, code: editValue } : loc
      )
    );

    // 간단한 로컬 저장소 저장
    const updated = locations.map(loc =>
      loc.id === editingId ? { ...loc, code: editValue } : loc
    );
    localStorage.setItem('location_barcodes', JSON.stringify(updated));

    setEditingId(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleDelete = (id: number) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;

    setLocations(prev => prev.filter(loc => loc.id !== id));

    // 로컬 저장소에서도 삭제
    const updated = locations.filter(loc => loc.id !== id);
    localStorage.setItem('location_barcodes', JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!newLocationCode.trim()) {
      alert("위치 코드를 입력하세요.");
      return;
    }

    const newLocation: Location = {
      id: Math.max(...locations.map(l => l.id)) + 1,
      code: newLocationCode.trim(),
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    setLocations(prev => [...prev, newLocation]);
    setNewLocationCode("");

    // 로컬 저장소에 저장
    const updated = [...locations, newLocation];
    localStorage.setItem('location_barcodes', JSON.stringify(updated));
  };

  // 로컬 저장소에서 데이터 로드
  React.useEffect(() => {
    const saved = localStorage.getItem('location_barcodes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLocations(parsed);
        }
      } catch (e) {
        // 파싱 실패시 기본 데이터 사용
      }
    }
  }, []);

  return (
    <Container maxWidth="full" centered={false} padding="md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">위치 바코드 관리</h1>
        <p className="text-sm text-gray-600 mt-1">창고 위치 바코드를 조회하고 관리할 수 있습니다.</p>
      </div>

      {/* 추가 폼 */}
      <Card padding="lg" className="mb-4">
        <Grid container gutter={[12, 12]}>
          <GridCol span={8}>
            <input
              type="text"
              className="border px-3 py-2 rounded w-full"
              placeholder="새 위치 코드 입력 (예: A-01-01)"
              value={newLocationCode}
              onChange={(e) => setNewLocationCode(e.target.value)}
            />
          </GridCol>
          <GridCol span={4}>
            <Button onClick={handleAdd} className="w-full">
              위치 추가
            </Button>
          </GridCol>
        </Grid>
      </Card>

      {/* 검색 */}
      <Card padding="lg" className="mb-4">
        <Grid container gutter={[12, 12]}>
          <GridCol span={12}>
            <input
              type="text"
              className="border px-3 py-2 rounded w-full"
              placeholder="위치 코드로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </GridCol>
        </Grid>
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm border-collapse min-w-[600px]">
            <thead className="bg-white sticky top-0">
              <tr className="text-left text-gray-600 border-b">
                <th className="p-3" style={{ width: "10%" }}>ID</th>
                <th className="p-3" style={{ width: "50%" }}>위치 코드</th>
                <th className="p-3" style={{ width: "25%" }}>등록일</th>
                <th className="p-3 text-center" style={{ width: "15%" }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((loc) => (
                <tr key={loc.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm font-medium">
                    {loc.id}
                  </td>
                  <td className="p-3">
                    {editingId === loc.id ? (
                      <input
                        type="text"
                        className="border px-2 py-1 w-full font-mono text-sm"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="위치 코드 입력"
                      />
                    ) : (
                      <div className="font-mono text-sm font-medium">
                        {loc.code}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {loc.created_at}
                  </td>
                  <td className="p-3 text-center">
                    {editingId === loc.id ? (
                      <div className="flex gap-2 justify-center">
                        <Button size="small" onClick={handleSave}>
                          저장
                        </Button>
                        <Button size="small" variant="outline" onClick={handleCancel}>
                          취소
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        <Button size="small" variant="outline" onClick={() => handleEdit(loc)}>
                          수정
                        </Button>
                        <Button size="small" variant="outline" onClick={() => handleDelete(loc.id)}>
                          삭제
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLocations.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
  );
};

export default LocationBarcodesPage;
