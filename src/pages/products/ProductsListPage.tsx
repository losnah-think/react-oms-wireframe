import React, { useState, useMemo, useEffect } from "react";
import { Container, Card, Button, Stack, GridRow, GridCol } from "../../design-system";
import TableExportButton from "../../components/common/TableExportButton";
import HierarchicalSelect from '../../components/common/HierarchicalSelect';
import { formatPrice } from "../../utils/productUtils";

interface ProductsListPageProps {
  onNavigate?: (page: string, productId?: string) => void;
}

const ProductsListPage: React.FC<ProductsListPageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [productFilterOptions, setProductFilterOptions] = useState<any>({ brands: [], status: [] });
  const [classificationsData, setClassificationsData] = useState<any[]>([]);
  const [categoryNames, setCategoryNames] = useState<Record<string,string>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedBrand, setSelectedBrand] = useState("전체");
  const [sortBy, setSortBy] = useState("newest");

  // Defensive fetch helper
  const safeJson = async (res: Response, fallback: any) => {
    if (!res || !res.ok) return fallback;
    try {
      const j = await res.json();
      return j ?? fallback;
    } catch (e) {
      return fallback;
    }
  };

  useEffect(() => {
    let mounted = true;
    fetch('/api/products?limit=1000')
      .then((r) => safeJson(r, { products: [] }))
      .then((data) => { if (mounted) setProducts(Array.isArray(data.products) ? data.products : []); })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true;
    fetch('/api/meta/product-filters')
      .then((r) => safeJson(r, { brands: [], status: [] }))
      .then((data) => { if (mounted) setProductFilterOptions(data || { brands: [], status: [] }) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true;
    fetch('/api/meta/classifications')
      .then((r) => safeJson(r, []))
      .then((data) => {
        if (!mounted) return
        setClassificationsData(Array.isArray(data) ? data : []);
      }).catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true;
    fetch('/api/meta/filters')
      .then((r) => safeJson(r, { categories: [] }))
      .then((data) => {
        if (!mounted) return
        const map: Record<string,string> = {};
        (data && data.categories || []).forEach((c: any) => { if (c && c.id) map[c.id] = c.name })
        setCategoryNames(map)
      }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const filteredProducts = useMemo(() => {
    const list = products || [];
    return list.filter((p: any) => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (!String(p.name || '').toLowerCase().includes(s) && !String(p.code || p.sku || '').toLowerCase().includes(s)) return false;
      }
      if (selectedCategory !== '전체') {
        const prodClass = p.classification || categoryNames[p.category_id];
        if (prodClass !== selectedCategory) return false;
      }
      if (selectedBrand !== '전체' && p.brand !== selectedBrand) return false;
      return true;
    }).sort((a: any,b: any) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return 0;
    })
  }, [products, searchTerm, selectedCategory, selectedBrand, sortBy, categoryNames])

  const exportData = filteredProducts.map((p: any) => ({ id: p.id, code: p.code, name: p.name, price: p.selling_price, stock: Array.isArray(p.variants) ? p.variants.reduce((s: number, v: any) => s + (v.stock || 0), 0) : (p.stock || 0), brand: p.brand, createdAt: p.created_at }))

  return (
    <Container maxWidth="full" padding="md" className="bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Stack direction="row" justify="between" align="center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">상품 목록</h1>
            <p className="text-gray-600 mt-1 text-lg">총 <span className="font-bold text-blue-600">{filteredProducts.length}</span>개 상품 <span className="text-gray-400 ml-2">(전체 {products.length}개)</span></p>
          </div>
          <Stack direction="row" gap={3}>
            <Button variant="outline" onClick={() => onNavigate?.('products-import')} className="border-gray-300">상품 가져오기</Button>
            <Button variant="primary" onClick={() => onNavigate?.('products-add')} className="px-6">신규 상품 등록</Button>
            <TableExportButton data={exportData} fileName={`products-list.xlsx`} />
          </Stack>
        </Stack>
      </div>

      <Card padding="lg" className="mb-6 shadow-sm">
        <GridRow gutter={16}>
          <GridCol span={8}>
            <div className="relative">
              <input type="text" placeholder="상품명, 상품코드로 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg" />
            </div>
          </GridCol>
          <GridCol span={4}>
            <HierarchicalSelect data={classificationsData} value={selectedCategory === '전체' ? undefined : selectedCategory} placeholder="분류 선택" onChange={(node) => setSelectedCategory(node ? node.name : '전체')} />
          </GridCol>
          <GridCol span={4}>
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-lg">
              <option value="전체">전체 브랜드</option>
              {(productFilterOptions.brands || []).map((b: any) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </GridCol>
          <GridCol span={4}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-lg">
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </GridCol>
        </GridRow>
      </Card>

      <Card padding="none" className="overflow-hidden shadow-sm">
        <div className="overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">상품정보</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">분류/브랜드</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">재고</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">가격</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">등록일</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-6">
                    <div className="font-bold">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.code}</div>
                  </td>
                  <td className="px-6 py-6">{p.classification || categoryNames[p.category_id] || '-' }{p.brand ? <div className="text-sm">{p.brand}</div> : null}</td>
                  <td className="px-6 py-6">{Array.isArray(p.variants) ? p.variants.reduce((s:number,v:any) => s + (v.stock || 0), 0) : (p.stock || 0)}</td>
                  <td className="px-6 py-6">{formatPrice(p.selling_price)}</td>
                  <td className="px-6 py-6">{p.created_at ? new Date(p.created_at).toLocaleDateString('ko-KR') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
  );
}

export default ProductsListPage;
