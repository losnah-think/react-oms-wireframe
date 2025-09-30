import React from "react";
import {
  Container,
  Card,
  Button,
  Input,
  Dropdown,
  Badge,
  Stack,
  Modal,
} from "../../design-system";
import type { Category } from "./ProductCategoryPage";

const GROUP_STORAGE_KEY = "productGroups_v1";
const CATEGORY_STORAGE_KEY = "productCategories_v2";

interface ProductGroup {
  id: string;
  name: string;
  description?: string;
  channels: string[];
  categoryIds: string[];
  color?: string;
  isDefault?: boolean;
}

const defaultGroups: ProductGroup[] = [
  {
    id: "group-1",
    name: "온라인 전용",
    description: "온라인 몰에만 노출되는 상품 군",
    channels: ["스마트스토어", "쿠팡"],
    categoryIds: [],
    color: "#2563eb",
    isDefault: true,
  },
  {
    id: "group-2",
    name: "오프라인 베스트",
    description: "오프라인 매장 베스트셀러",
    channels: ["백화점", "직영점"],
    categoryIds: [],
    color: "#f97316",
    isDefault: true,
  },
];

const loadCategories = (): Category[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Category[];
  } catch (err) {
    return [];
  }
};

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

const channelPresets = [
  "스마트스토어",
  "쿠팡",
  "지그재그",
  "자사몰",
  "오프라인",
];

const getColorDot = (color?: string) => (
  <span
    style={{
      display: "inline-block",
      width: 10,
      height: 10,
      borderRadius: "50%",
      backgroundColor: color || "#64748B",
    }}
  />
);

const ProductGroupsPage: React.FC = () => {
  const [groups, setGroups] = React.useState<ProductGroup[]>(loadGroups);
  const [search, setSearch] = React.useState("");
  const [channelFilter, setChannelFilter] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formState, setFormState] = React.useState({
    name: "",
    description: "",
    channels: [] as string[],
    categoryIds: [] as string[],
    color: "#2563eb",
  });

  const categories = React.useMemo(() => loadCategories(), []);

  React.useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  const filtered = groups.filter((group) => {
    const matchesSearch = search
      ? group.name.includes(search) || group.description?.includes(search)
      : true;
    const matchesChannel = channelFilter
      ? group.channels.includes(channelFilter)
      : true;
    return matchesSearch && matchesChannel;
  });

  const summary = React.useMemo(() => {
    const total = groups.length;
    const channelUsage = groups.reduce((acc, group) => acc + group.channels.length, 0);
    const avgCategories = groups.reduce((acc, group) => acc + group.categoryIds.length, 0) / (total || 1);
    return { total, channelUsage, avgCategories };
  }, [groups]);

  const openModal = (group?: ProductGroup) => {
    if (group) {
      setEditingId(group.id);
      setFormState({
        name: group.name,
        description: group.description ?? "",
        channels: group.channels,
        categoryIds: group.categoryIds,
        color: group.color ?? "#2563eb",
      });
    } else {
      setEditingId(null);
      setFormState({
        name: "",
        description: "",
        channels: [],
        categoryIds: [],
        color: "#2563eb",
      });
    }
    setModalOpen(true);
  };

  const toggleChannel = (channel: string) => {
    setFormState((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((item) => item !== channel)
        : [...prev.channels, channel],
    }));
  };

  const toggleCategory = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((item) => item !== id)
        : [...prev.categoryIds, id],
    }));
  };

  const handleSave = () => {
    if (!formState.name.trim()) {
      window.alert("상품 그룹 이름을 입력해주세요.");
      return;
    }
    if (!formState.channels.length) {
      window.alert("적어도 1개의 채널을 선택해주세요.");
      return;
    }

    const nextGroup: ProductGroup = {
      id: editingId ?? `group-${Date.now()}`,
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      channels: formState.channels,
      categoryIds: formState.categoryIds,
      color: formState.color,
      isDefault: editingId ? groups.find((g) => g.id === editingId)?.isDefault : false,
    };

    setGroups((prev) =>
      editingId
        ? prev.map((group) => (group.id === editingId ? nextGroup : group))
        : [nextGroup, ...prev],
    );
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const target = groups.find((group) => group.id === id);
    if (!target || target.isDefault) {
      window.alert("기본 상품 그룹은 삭제할 수 없습니다.");
      return;
    }
    if (!window.confirm("상품 그룹을 삭제하시겠습니까?")) return;
    setGroups((prev) => prev.filter((group) => group.id !== id));
  };

  return (
    <Container maxWidth="7xl" className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">상품 그룹 관리</h1>
        <p className="text-sm text-gray-600">
          판매 채널과 카테고리를 묶어 상품 그룹을 정의하고, 연동 정책에 활용하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">총 그룹 수</span>
          <span className="text-2xl font-semibold text-gray-900">{summary.total}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">채널 연결 수</span>
          <span className="text-2xl font-semibold text-blue-600">{summary.channelUsage}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">평균 연결 카테고리</span>
          <span className="text-2xl font-semibold text-gray-900">
            {summary.avgCategories.toFixed(1)}개
          </span>
        </Card>
      </div>

      <Card padding="lg" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <Input
              label="검색"
              placeholder="상품 그룹명 또는 설명 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
            <Dropdown
              label="채널"
              options={[{ value: "", label: "전체 채널" }, ...channelPresets.map((channel) => ({ value: channel, label: channel }))]}
              value={channelFilter}
              onChange={setChannelFilter}
              fullWidth
            />
          </div>
          <Stack direction="row" gap={3} className="flex-wrap">
            <Button variant="outline" size="small" onClick={() => setChannelFilter("")}>필터 초기화</Button>
            <Button size="small" onClick={() => openModal()}>상품 그룹 추가</Button>
          </Stack>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((group) => (
            <Card key={group.id} padding="lg" className="flex h-full flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getColorDot(group.color)}
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    {group.isDefault && (
                      <Badge size="small" variant="primary">
                        기본값
                      </Badge>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-xs text-gray-600">{group.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {group.channels.map((channel) => (
                      <Badge key={channel} size="small" variant="secondary">
                        {channel}
                      </Badge>
                    ))}
                  </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {group.categoryIds.length > 0 ? (
              group.categoryIds
                .map((id) => categories.find((category) => category.id === id)?.name || "미지정")
                .map((name) => (
                  <Badge key={name} size="small" variant="secondary" outline>
                    {name}
                  </Badge>
                ))
            ) : (
              <span>연결된 상품 분류 없음</span>
            )}
          </div>
                </div>
                <Stack direction="column" gap={2}>
                  <Button variant="ghost" size="small" onClick={() => openModal(group)}>
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    disabled={group.isDefault}
                    onClick={() => handleDelete(group.id)}
                  >
                    삭제
                  </Button>
                </Stack>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            조건에 맞는 상품 그룹이 없습니다. 새 그룹을 추가해 보세요.
          </div>
        )}
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "상품 그룹 수정" : "상품 그룹 추가"}
        footer={
          <Stack direction="row" gap={3}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </Stack>
        }
      >
        <div className="space-y-4">
          <Input
            label="상품 그룹명"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            fullWidth
          />
          <Input
            label="설명"
            value={formState.description}
            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            fullWidth
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">연결 채널</label>
            <div className="flex flex-wrap gap-2">
              {channelPresets.map((channel) => {
                const checked = formState.channels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      checked
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {channel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">연결 상품 분류</label>
            <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200">
              {categories.length === 0 && (
                <p className="p-3 text-xs text-gray-500">등록된 상품 분류가 없습니다.</p>
              )}
              {categories.map((category) => {
                const checked = formState.categoryIds.includes(category.id);
                return (
                  <label
                    key={category.id}
                    className="flex cursor-pointer items-center justify-between border-b border-gray-100 px-3 py-2 text-sm last:border-b-0"
                  >
                    <span>{category.name}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(category.id)}
                      className="h-4 w-4"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </Container>
  );
};

export default ProductGroupsPage;
