import React from "react";
import SuppliersToolbar from "../../components/vendors/SuppliersToolbar";
import SuppliersTable from "../../components/vendors/SuppliersTable";
import SupplierDrawer from "../../components/vendors/SupplierDrawer";
import * as api from "../../lib/mockSuppliers";

const SuppliersPage: React.FC = () => {
  const [items, setItems] = React.useState<any[]>([]);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedSupplier, setSelectedSupplier] = React.useState<any>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await api.listSuppliers({ q });
    setItems(res.items || []);
    setLoading(false);
  }, [q]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    const onUpdated = () => load();
    window.addEventListener("supplier:updated", onUpdated);
    window.addEventListener("supplier:deleted", onUpdated);
    return () => {
      window.removeEventListener("supplier:updated", onUpdated);
      window.removeEventListener("supplier:deleted", onUpdated);
    };
  }, [load]);

  const onAdd = async () => {
    const created = await api.createSupplier({
      name: "새 공급처",
      contact: {},
    });
    setOpenId(created.id);
    setSelectedSupplier(created);
    setDrawerOpen(true);
  };

  const onOpen = async (id: string) => {
    const s = await api.getSupplier(id);
    setSelectedSupplier(s);
    setOpenId(id);
    setDrawerOpen(true);
  };

  const onSave = async (payload: any) => {
    if (!selectedSupplier) return;
    await api.updateSupplier(selectedSupplier.id, payload);
    setDrawerOpen(false);
  };

  const onDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await api.softDeleteSupplier(id);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <SuppliersToolbar
        total={items.length}
        q={q}
        onChangeQ={setQ}
        onAdd={onAdd}
        onExport={() => {
          alert("CSV (demo)");
        }}
      />
      {loading ? (
        <div>로딩중...</div>
      ) : (
        <SuppliersTable items={items} onOpen={onOpen} onDelete={onDelete} />
      )}
      <SupplierDrawer
        open={drawerOpen}
        supplier={selectedSupplier}
        onClose={() => setDrawerOpen(false)}
        onSave={onSave}
      />
    </div>
  );
};

export default SuppliersPage;
