import React from "react";
import {
  Container,
  Card,
  Button,
  Input,
  Modal,
  Table,
  type TableColumn,
} from "../../design-system";

const GROUP_STORAGE_KEY = "productGroups_v1";

interface ProductGroup {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
}

const defaultGroups: ProductGroup[] = [
  {
    id: "group-default",
    name: "미분류",
    description: "분류되지 않은 상품",
    isDefault: true,
  },
  {
    id: "group-1",
    name: "온라인 전용",
    description: "온라인 판매처 전용",
    isDefault: false,
  },
  {
    id: "group-2",
    name: "오프라인 매장",
    description: "실제 매장 판매",
    isDefault: false,
  },
];


const loadGroups = (): ProductGroup[] => {
  if (typeof window === "undefined") return defaultGroups;
  try {
    const raw = window.localStorage.getItem(GROUP_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(defaultGroups));
      return defaultGroups;
    }
    const parsed = JSON.parse(raw) as ProductGroup[];
    return parsed.length ? parsed : defaultGroups;
  } catch (err) {
    return defaultGroups;
  }
};

const saveGroups = (groups: ProductGroup[]) => {
  try {
    window.localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(groups));
  } catch (err) {
    // ignore
  }
};

const ProductClassificationPage: React.FC = () => {
  const [groups, setGroups] = React.useState<ProductGroup[]>(loadGroups);
  const [search, setSearch] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formState, setFormState] = React.useState({
    name: "",
    description: "",
  });

  React.useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  const filtered = groups.filter((group) => {
    const matchesSearch = search
      ? group.name.includes(search) || group.description?.includes(search)
      : true;
    return matchesSearch;
  });

  const openModal = (group?: ProductGroup) => {
    if (group) {
      setEditingId(group.id);
      setFormState({
        name: group.name,
        description: group.description ?? "",
      });
    } else {
      setEditingId(null);
      setFormState({
        name: "",
        description: "",
      });
    }
    setModalOpen(true);
  };


  const handleSave = () => {
    if (!formState.name.trim()) {
      window.alert("분류 이름을 입력하세요");
      return;
    }

    const nextGroup: ProductGroup = {
      id: editingId ?? `group-${Date.now()}`,
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      isDefault: editingId ? groups.find((g) => g.id === editingId)?.isDefault : false,
    };

    setGroups((prev) =>
      editingId
        ? prev.map((group) => (group.id === editingId ? nextGroup : group))
        : [nextGroup, ...prev],
    );
    setModalOpen(false);
  };

  const handleSetDefault = (id: string) => {
    setGroups((prev) => 
      prev.map(group => ({
        ...group,
        isDefault: group.id === id
      }))
    );
  };

  const handleDelete = (id: string) => {
    const target = groups.find((group) => group.id === id);
    if (!target) return;
    if (target.isDefault) {
      window.alert("기본 분류는 삭제할 수 없습니다. 먼저 다른 분류를 기본값으로 설정하세요.");
      return;
    }
    if (!window.confirm("삭제하시겠습니까?")) return;
    setGroups((prev) => prev.filter((group) => group.id !== id));
  };

  const columns: TableColumn<ProductGroup>[] = [
    {
      key: "name",
      title: "분류명",
      render: (value, group) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{value}</span>
            {group.isDefault && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                기본값
              </span>
            )}
          </div>
          {group.description && (
            <div className="text-sm text-gray-500 mt-1">{group.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "작업",
      render: (_, group) => (
        <div className="flex items-center gap-2">
          {!group.isDefault && (
            <Button
              size="small"
              variant="ghost"
              onClick={() => handleSetDefault(group.id)}
            >
              기본값으로
            </Button>
          )}
          <Button
            size="small"
            variant="ghost"
            onClick={() => openModal(group)}
          >
            수정
          </Button>
          <Button
            size="small"
            variant="ghost"
            onClick={() => handleDelete(group.id)}
            disabled={group.isDefault}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container maxWidth="full" centered={false} padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">상품 분류</h1>
            <p className="text-sm text-gray-600 mt-1">상품을 분류하여 관리할 수 있습니다</p>
          </div>
          <Button onClick={() => openModal()}>
            분류 추가
          </Button>
        </div>

        {/* 검색 */}
        <Card padding="lg" className="mb-6">
          <Input
            placeholder="분류 이름 또는 설명으로 검색"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
          />
        </Card>

        {/* 분류 목록 테이블 */}
        <Card padding="none">
          <Table
            data={filtered}
            columns={columns}
          />
        </Card>
      </div>

      {/* 추가/수정 모달 */}
      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "분류 수정" : "분류 추가"}
      >
        <div className="space-y-4">
          <Input
            label="분류명"
            placeholder="예: 온라인 전용"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            fullWidth
          />
          
          <Input
            label="설명"
            placeholder="예: 온라인 판매처 전용"
            value={formState.description}
            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            fullWidth
          />

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setModalOpen(false)} fullWidth>
              취소
            </Button>
            <Button onClick={handleSave} fullWidth>
              {editingId ? "수정" : "등록"}
            </Button>
          </div>
        </div>
      </Modal>
    </Container>
  );
};

export default ProductClassificationPage;

