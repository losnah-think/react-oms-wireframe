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
  Table,
  type TableColumn,
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
    description: "온라인 판매처 전용",
    channels: ["스마트스토어", "쿠팡"],
    categoryIds: [],
    color: "#2563eb",
    isDefault: true,
  },
  {
    id: "group-2",
    name: "오프라인 매장",
    description: "실제 매장 판매",
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

const ProductGroupsPage: React.FC = () => {
  const [groups, setGroups] = React.useState<ProductGroup[]>(loadGroups);
  const [search, setSearch] = React.useState("");
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
    return matchesSearch;
  });

  const summary = React.useMemo(() => {
    const total = groups.length;
    const channelUsage = groups.reduce((acc, group) => acc + group.channels.length, 0);
    const avgCategories = groups.reduce((acc, group) => acc + group.categoryIds.length, 0) / (total || 1);
    return { total, channelUsage, avgCategories: Math.round(avgCategories * 10) / 10 };
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
      window.alert("분류 이름을 입력하세요");
      return;
    }
    if (!formState.channels.length) {
      window.alert("판매 채널을 1개 이상 선택하세요");
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
      window.alert("기본 분류는 삭제할 수 없습니다");
      return;
    }
    if (!window.confirm("삭제하시겠습니까?")) return;
    setGroups((prev) => prev.filter((group) => group.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">상품 분류</h1>
              <p className="text-gray-600 mt-1">상품을 판매 채널별로 분류하고 관리하세요</p>
            </div>
            <Button size="big" onClick={() => openModal()} className="shadow-lg">
              ➕ 새 분류 추가
            </Button>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{summary.total}</div>
                <div className="text-gray-600 font-medium">전체 분류</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">{summary.channelUsage}</div>
                <div className="text-gray-600 font-medium">총 채널 수</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🛒</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">{summary.avgCategories}</div>
                <div className="text-gray-600 font-medium">평균 카테고리</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏷️</span>
              </div>
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="분류 이름 또는 설명으로 검색..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
                className="text-lg"
              />
            </div>
            {search && (
              <Button 
                variant="ghost" 
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            )}
          </div>
          {search && (
            <div className="mt-2 text-sm text-gray-500">
              "{search}" 검색 결과: {filtered.length}개 분류
            </div>
          )}
        </div>

        {/* 분류 목록 테이블 */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📁</div>
            <div className="text-xl font-semibold text-gray-900 mb-2">분류가 없습니다</div>
            <div className="text-gray-500 mb-6">새로운 상품 분류를 추가해보세요</div>
            <Button size="big" onClick={() => openModal()}>
              ➕ 첫 번째 분류 추가
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Table
              data={filtered}
              columns={[
                {
                  key: "name",
                  title: "분류명",
                  render: (value, group) => (
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: group.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{value}</span>
                          {group.isDefault && (
                            <Badge variant="secondary" size="small">기본</Badge>
                          )}
                        </div>
                        {group.description && (
                          <div className="text-sm text-gray-500 mt-1">{group.description}</div>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "channels",
                  title: "판매 채널",
                  render: (channels) => (
                    <div className="flex flex-wrap gap-1">
                      {channels.slice(0, 4).map((channel: string) => (
                        <Badge key={channel} variant="primary" size="small">
                          {channel}
                        </Badge>
                      ))}
                      {channels.length > 4 && (
                        <Badge variant="secondary" size="small">
                          +{channels.length - 4}
                        </Badge>
                      )}
                    </div>
                  ),
                },
                {
                  key: "categoryIds",
                  title: "연결된 카테고리",
                  render: (categoryIds) => (
                    <div className="text-sm text-gray-600">
                      {categoryIds.length}개
                    </div>
                  ),
                },
                {
                  key: "actions",
                  title: "작업",
                  render: (_, group) => (
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(group);
                        }}
                      >
                        수정
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(group.id);
                        }}
                        disabled={group.isDefault}
                        className="text-red-600 hover:text-red-700"
                      >
                        삭제
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}

      </div>

      {/* 추가/수정 모달 */}
      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "분류 수정" : "분류 추가"}
        footer={
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setModalOpen(false)} fullWidth>
              취소
            </Button>
            <Button onClick={handleSave} fullWidth>
              {editingId ? "수정" : "등록"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Input
            label="이름"
            placeholder="온라인 전용"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            fullWidth
          />
          
          <Input
            label="설명"
            placeholder="온라인 판매처 전용"
            value={formState.description}
            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            fullWidth
          />

          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">판매 채널 *</div>
            <div className="flex flex-wrap gap-2">
              {channelPresets.map((channel) => {
                const checked = formState.channels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      checked
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {channel}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">카테고리</div>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {categories.length === 0 && (
                <div className="p-4 text-center text-gray-500">카테고리 없음</div>
              )}
              {categories.map((category) => {
                const checked = formState.categoryIds.includes(category.id);
                return (
                  <label
                    key={category.id}
                    className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-medium">{category.name}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(category.id)}
                      className="w-5 h-5"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">색상</div>
            <div className="flex gap-3">
              {["#2563eb", "#f97316", "#10b981", "#8b5cf6", "#ec4899", "#64748b"].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormState((prev) => ({ ...prev, color }))}
                  className={`w-12 h-12 rounded-full transition ${
                    formState.color === color ? "ring-4 ring-offset-2 ring-blue-300 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductGroupsPage;