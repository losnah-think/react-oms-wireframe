import React from 'react';
import { readVendors, readFixedAddresses, readVendorProducts, writeVendorProducts, Vendor, FixedAddress, VendorProduct } from '@/data/vendorsMock';
import { mockProducts } from '../../data/mockProducts';

const VendorDetailPage: React.FC<{ vendorId: number }> = ({ vendorId }) => {
  const [tab, setTab] = React.useState<'info'|'addresses'|'products'|'categories'>('info');
  const vendors: Vendor[] = React.useMemo(() => readVendors(), []);
  const vendor = vendors.find((v: Vendor) => v.id === vendorId);
  const [addresses, setAddresses] = React.useState<FixedAddress[]>(() => readFixedAddresses().filter(a => a.vendor_id === vendorId));
  const [vendorProducts, setVendorProducts] = React.useState<VendorProduct[]>(() => readVendorProducts().filter(vp => vp.vendor_id === vendorId));

  const allProducts = mockProducts.flatMap((p: any) => (p.variants && p.variants.length ? p.variants.map((v:any) => ({ productId: p.id, variantId: v.id, label: p.name + (v.variant_name ? ' · ' + v.variant_name : '') })) : [{ productId: p.id, variantId: undefined, label: p.name }]));

  const fetchVendorProducts = async () => {
    try {
      const r = await fetch('/api/vendors/products');
      const j = await r.json();
      const items: VendorProduct[] = j.items || [];
      setVendorProducts(items.filter(vp => vp.vendor_id === vendorId));
    } catch (e) {
      // fallback to local
      setVendorProducts(readVendorProducts().filter(vp => vp.vendor_id === vendorId));
    }
  };

  const assignProducts = async (selectedProductIds: number[]) => {
    try {
      for (const pid of selectedProductIds) {
        await fetch('/api/vendors/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendor_id: vendorId, product_id: pid }) });
      }
      await fetchVendorProducts();
    } catch (e) {
      const existing = readVendorProducts();
      const toAdd = selectedProductIds.map((pid, i) => ({ id: Date.now() + i, vendor_id: vendorId, product_id: pid }));
      const merged = [...existing, ...toAdd];
      writeVendorProducts(merged);
      setVendorProducts(merged.filter(vp => vp.vendor_id === vendorId));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">판매처: {vendor?.name ?? 'Unknown'}</h2>
      <div className="mt-3">
        <div className="inline-flex rounded bg-gray-100 p-1">
          <button onClick={() => setTab('info')} className={`px-4 py-2 ${tab==='info' ? 'bg-white shadow' : ''}`}>정보</button>
          <button onClick={() => setTab('addresses')} className={`px-4 py-2 ${tab==='addresses' ? 'bg-white shadow' : ''}`}>고정주소</button>
          <button onClick={() => setTab('products')} className={`px-4 py-2 ${tab==='products' ? 'bg-white shadow' : ''}`}>상품 관리</button>
          <button onClick={() => setTab('categories')} className={`px-4 py-2 ${tab==='categories' ? 'bg-white shadow' : ''}`}>카테고리 매핑</button>
        </div>
      </div>

      <div className="mt-4">
        {tab === 'info' && <div>판매처 기본 정보 편집(간단 스케폴딩)</div>}
        {tab === 'addresses' && (
          <div>
            <h3 className="font-medium mb-2">고정 주소 목록</h3>
            <ul className="space-y-2">
              {addresses.map((a: FixedAddress) => (
                <li key={a.id} className="border p-2 rounded">
                  <div className="font-medium">{a.label} {a.is_default && <span className="text-xs text-blue-600">(기본)</span>}</div>
                  <div className="text-sm text-gray-600">{a.address}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'products' && (
          <div>
            <h3 className="font-medium">등록된 상품</h3>
            <ul className="mt-2 space-y-2">
              {vendorProducts.map((vp: VendorProduct) => (
                <li key={vp.id} className="border p-2 rounded">상품 ID: {vp.product_id}</li>
              ))}
            </ul>

            <div className="mt-4">
              <h4 className="font-medium">상품 등록(샘플)</h4>
              <div className="mt-2">
                <select id="sample-add" className="border px-2 py-1">
                  {allProducts.map((p: any) => <option key={p.productId} value={p.productId}>{p.label} (#{p.productId})</option>)}
                </select>
                <button className="ml-2 px-3 py-1 border" onClick={() => {
                  const sel = (document.getElementById('sample-add') as HTMLSelectElement);
                  if (!sel) return;
                  const v = Number(sel.value);
                  assignProducts([v]);
                }}>등록</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'categories' && <div>카테고리 매핑 UI(간단 스케폴딩)</div>}
      </div>
    </div>
  );
};

export default VendorDetailPage;
