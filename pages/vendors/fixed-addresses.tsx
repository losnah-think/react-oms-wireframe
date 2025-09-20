import React, { useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, Button, Modal, Input, Stack } from "@/design-system";

interface FixedAddress {
  id: string;
  vendor: string;
  title: string;
  receiver: string;
  phone: string;
  zip: string;
  address1: string;
  address2?: string;
}

const INITIAL: FixedAddress[] = [
  {
    id: "a1",
    vendor: "테스트 판매처 A",
    title: "본사",
    receiver: "홍길동",
    phone: "010-1234-5678",
    zip: "12345",
    address1: "서울시 강남구 테헤란로 1",
    address2: "101호",
  },
];

export default function VendorsFixedAddressesPage() {
  const [list, setList] = useState<FixedAddress[]>(INITIAL);
  const [editing, setEditing] = useState<FixedAddress | null>(null);
  const [isOpen, setOpen] = useState(false);

  const openNew = () => {
    setEditing({ id: "", vendor: "", title: "", receiver: "", phone: "", zip: "", address1: "", address2: "" });
    setOpen(true);
  };

  const openEdit = (item: FixedAddress) => {
    setEditing({ ...item });
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.vendor || !editing.title || !editing.receiver) {
      alert("판매처, 제목, 수취인을 입력하세요");
      return;
    }
    if (!editing.id) {
      const id = `m_${Date.now()}`;
      setList((prev) => [{ ...editing, id }, ...prev]);
    } else {
      setList((prev) => prev.map((p) => (p.id === editing.id ? editing : p)));
    }
    setOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setList((prev) => prev.filter((p) => p.id !== id));
  };

  const vendorSet = useMemo(() => Array.from(new Set(list.map((l) => l.vendor))), [list]);

  return (
    <Layout>
      <div style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">판매처 고정배송지 관리</h1>
            <p className="text-sm text-gray-600">판매처별 고정 배송지를 등록/수정/삭제합니다 (API 연동 제외 모드).</p>
          </div>
          <div>
            <Button variant="primary" onClick={openNew}>고정배송지 등록</Button>
          </div>
        </div>

        <Card padding="lg">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">판매처</th>
                  <th className="px-3 py-2 text-left">제목</th>
                  <th className="px-3 py-2 text-left">수취인</th>
                  <th className="px-3 py-2 text-left">연락처</th>
                  <th className="px-3 py-2 text-left">주소</th>
                  <th className="px-3 py-2 text-center">액션</th>
                </tr>
              </thead>
              <tbody>
                {list.map((l) => (
                  <tr key={l.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm">{l.vendor}</td>
                    <td className="px-3 py-2 text-sm">{l.title}</td>
                    <td className="px-3 py-2 text-sm">{l.receiver}</td>
                    <td className="px-3 py-2 text-sm">{l.phone}</td>
                    <td className="px-3 py-2 text-sm">{l.zip} {l.address1} {l.address2}</td>
                    <td className="px-3 py-2 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="small" variant="outline" onClick={() => openEdit(l)}>수정</Button>
                        <Button size="small" variant="danger" onClick={() => remove(l.id)}>삭제</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-sm text-gray-500">등록된 고정배송지가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Modal open={isOpen} onClose={() => { setOpen(false); setEditing(null); }} title={editing?.id ? "고정배송지 수정" : "고정배송지 등록"} size="big" footer={(
          <Stack direction="row" gap={2} justify="end">
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>취소</Button>
            <Button variant="primary" onClick={save}>저장</Button>
          </Stack>
        )}>
          {editing && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">판매처</label>
                <Input value={editing.vendor} onChange={(e) => setEditing({ ...editing, vendor: e.target.value })} placeholder="판매처명을 입력하세요" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">제목</label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="예: 본사, 물류센터" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">수취인</label>
                  <Input value={editing.receiver} onChange={(e) => setEditing({ ...editing, receiver: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">연락처</label>
                  <Input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">우편번호</label>
                  <Input value={editing.zip} onChange={(e) => setEditing({ ...editing, zip: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">주소</label>
                  <Input value={editing.address1} onChange={(e) => setEditing({ ...editing, address1: e.target.value })} />
                  <Input className="mt-2" value={editing.address2} onChange={(e) => setEditing({ ...editing, address2: e.target.value })} placeholder="상세주소" />
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
