import React from "react";
import { Container, Card, Button, Grid, GridCol, GridRow } from "../../design-system";
import { mockProducts } from "../../data/mockProducts";
import { clientBarcodeStore } from "../../lib/clientBarcodeStore";

type Product = {
  id: string;
  productId?: number;
  title?: string;
  barcode?: string | null;
  sku?: string;
  image?: string;
  supplier?: string;
};

const ProductBarcodesPage: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [query, setQuery] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  React.useEffect(() => {
    // 간단하게 mock 데이터 사용
    const rows = mockProducts.slice(0, 20).map((p: any) => ({
      id: String(p.id),
      productId: p.id,
      title: p.title,
      sku: p.sku,
      barcode: p.barcode || null,
      image: p.image,
      supplier: p.supplier,
    }));
    setProducts(rows);
  }, []);

  const filteredProducts = products.filter((p) =>
    p.title?.toLowerCase().includes(query.toLowerCase()) ||
    p.sku?.toLowerCase().includes(query.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(query.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditValue(product.barcode || "");
  };

  const handleSave = () => {
    if (!editingId) return;

    setProducts(prev =>
      prev.map(p =>
        p.id === editingId ? { ...p, barcode: editValue || null } : p
      )
    );

    // 간단한 로컬 저장소 저장
    const updated = products.map(p =>
      p.id === editingId ? { ...p, barcode: editValue || null } : p
    );
    localStorage.setItem('product_barcodes', JSON.stringify(updated));

    setEditingId(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <Container maxWidth="full" centered={false} padding="md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">상품 바코드 관리</h1>
        <p className="text-sm text-gray-600 mt-1">상품별 바코드를 조회하고 수정할 수 있습니다.</p>
      </div>

      <Card padding="lg" className="mb-4">
        <Grid container gutter={[12, 12]}>
          <GridCol span={12}>
            <input
              type="text"
              className="border px-3 py-2 rounded w-full"
              placeholder="상품명, SKU, 바코드로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </GridCol>
        </Grid>
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm border-collapse min-w-[800px]">
            <thead className="bg-white sticky top-0">
              <tr className="text-left text-gray-600 border-b">
                <th className="p-3" style={{ width: "8%" }}>이미지</th>
                <th className="p-3" style={{ width: "35%" }}>상품 정보</th>
                <th className="p-3" style={{ width: "25%" }}>바코드</th>
                <th className="p-3 text-center" style={{ width: "12%" }}>상태</th>
                <th className="p-3 text-center" style={{ width: "20%" }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt="상품"
                          className="max-h-10 object-cover rounded"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">이미지</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{p.title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      SKU: {p.sku} • 공급처: {p.supplier || '미정'}
                    </div>
                  </td>
                  <td className="p-3">
                    {editingId === p.id ? (
                      <input
                        type="text"
                        className="border px-2 py-1 w-full font-mono text-sm"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="바코드 입력"
                      />
                    ) : (
                      <div className="font-mono text-sm">
                        {p.barcode || <span className="text-gray-400">미발급</span>}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      p.barcode
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {p.barcode ? '발급됨' : '미발급'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {editingId === p.id ? (
                      <div className="flex gap-2 justify-center">
                        <Button size="small" onClick={handleSave}>
                          저장
                        </Button>
                        <Button size="small" variant="outline" onClick={handleCancel}>
                          취소
                        </Button>
                      </div>
                    ) : (
                      <Button size="small" variant="outline" onClick={() => handleEdit(p)}>
                        수정
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-gray-500">
                    검색 결과가 없습니다
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

export default ProductBarcodesPage;
