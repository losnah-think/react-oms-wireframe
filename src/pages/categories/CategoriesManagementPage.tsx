import React, { useState, useEffect } from "react";

import { Container } from "../../design-system";

interface Category {
  id: number;
  name: string;
  nameEng?: string;
  description?: string;
  parentId?: number | null;
  sortOrder: number;
  status: "active" | "inactive";
  icon?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  level?: number;
  productsCount?: number;
  children?: Category[];
}

interface FormData {
  name: string;
  nameEng: string;
  description: string;
  parentId: number | null;
  sortOrder: number;
  status: "active" | "inactive";
  icon: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
}

const CategoriesManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["1"]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    nameEng: "",
    description: "",
    parentId: null,
    sortOrder: 1,
    status: "active",
    icon: "",
    slug: "",
    seoTitle: "",
    seoDescription: "",
  });

  // 초기 데이터 로드
  useEffect(() => {
    const sampleCategories: Category[] = [
      {
        id: 1,
        name: "전자제품",
        nameEng: "Electronics",
        description: "전자기기 및 디지털 제품",
        parentId: null,
        sortOrder: 1,
        status: "active",
        icon: "□",
        slug: "electronics",
        seoTitle: "전자제품 - 최신 디지털 기기",
        seoDescription:
          "스마트폰, 노트북, 가전제품 등 다양한 전자제품을 만나보세요",
        level: 0,
        productsCount: 1245,
        children: [
          {
            id: 11,
            name: "스마트폰",
            nameEng: "Smartphones",
            description: "최신 스마트폰 및 액세서리",
            parentId: 1,
            sortOrder: 1,
            status: "active",
            icon: "□",
            slug: "smartphones",
            level: 1,
            productsCount: 456,
            children: [
              {
                id: 111,
                name: "아이폰",
                nameEng: "iPhone",
                description: "Apple iPhone 시리즈",
                parentId: 11,
                sortOrder: 1,
                status: "active",
                slug: "iphone",
                level: 2,
                productsCount: 156,
              },
              {
                id: 112,
                name: "갤럭시",
                nameEng: "Galaxy",
                description: "Samsung Galaxy 시리즈",
                parentId: 11,
                sortOrder: 2,
                status: "active",
                slug: "galaxy",
                level: 2,
                productsCount: 234,
              },
            ],
          },
          {
            id: 12,
            name: "노트북",
            nameEng: "Laptops",
            description: "노트북 및 컴퓨터",
            parentId: 1,
            sortOrder: 2,
            status: "active",
            icon: "□",
            slug: "laptops",
            level: 1,
            productsCount: 289,
          },
          {
            id: 13,
            name: "가전제품",
            nameEng: "Home Appliances",
            description: "생활가전 및 주방가전",
            parentId: 1,
            sortOrder: 3,
            status: "active",
            icon: "□",
            slug: "appliances",
            level: 1,
            productsCount: 500,
          },
        ],
      },
      {
        id: 2,
        name: "패션/의류",
        nameEng: "Fashion & Clothing",
        description: "의류, 신발, 액세서리",
        parentId: null,
        sortOrder: 2,
        status: "active",
        icon: "□",
        slug: "fashion",
        level: 0,
        productsCount: 2156,
        children: [
          {
            id: 21,
            name: "남성의류",
            nameEng: "Men's Clothing",
            description: "남성 의류 및 액세서리",
            parentId: 2,
            sortOrder: 1,
            status: "active",
            icon: "□",
            slug: "mens-clothing",
            level: 1,
            productsCount: 856,
          },
          {
            id: 22,
            name: "여성의류",
            nameEng: "Women's Clothing",
            description: "여성 의류 및 액세서리",
            parentId: 2,
            sortOrder: 2,
            status: "active",
            icon: "□",
            slug: "womens-clothing",
            level: 1,
            productsCount: 1024,
          },
          {
            id: 23,
            name: "신발",
            nameEng: "Shoes",
            description: "남녀공용 신발",
            parentId: 2,
            sortOrder: 3,
            status: "active",
            icon: "□",
            slug: "shoes",
            level: 1,
            productsCount: 276,
          },
        ],
      },
      {
        id: 3,
        name: "화장품",
        nameEng: "Beauty & Cosmetics",
        description: "화장품 및 뷰티 제품",
        parentId: null,
        sortOrder: 3,
        status: "active",
        icon: "□",
        slug: "beauty",
        level: 0,
        productsCount: 678,
        children: [
          {
            id: 31,
            name: "스킨케어",
            nameEng: "Skincare",
            description: "기초화장품 및 스킨케어",
            parentId: 3,
            sortOrder: 1,
            status: "active",
            icon: "□",
            slug: "skincare",
            level: 1,
            productsCount: 345,
          },
          {
            id: 32,
            name: "메이크업",
            nameEng: "Makeup",
            description: "색조화장품 및 메이크업",
            parentId: 3,
            sortOrder: 2,
            status: "active",
            icon: "□",
            slug: "makeup",
            level: 1,
            productsCount: 333,
          },
        ],
      },
    ];
    setCategories(sampleCategories);
  }, []);

  const handleInputChange = (
    field: keyof FormData,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("카테고리명을 입력해주세요.");
      return;
    }

    const newCategory: Category = {
      id: editingCategory ? editingCategory.id : Date.now(),
      ...formData,
      level: formData.parentId ? getLevel(formData.parentId) + 1 : 0,
      productsCount: editingCategory ? editingCategory.productsCount : 0,
      children: editingCategory ? editingCategory.children : [],
    };

    if (editingCategory) {
      setCategories((prev) => updateCategoryInTree(prev, newCategory));
    } else {
      if (formData.parentId) {
        setCategories((prev) =>
          addChildCategory(prev, formData.parentId!, newCategory),
        );
      } else {
        setCategories((prev) => [...prev, newCategory]);
      }
    }

    handleCloseModal();
  };

  const getLevel = (parentId: number): number => {
    const findLevel = (categories: Category[], id: number): number => {
      for (let category of categories) {
        if (category.id === id) {
          return category.level || 0;
        }
        if (category.children) {
          const level = findLevel(category.children, id);
          if (level !== -1) return level;
        }
      }
      return -1;
    };
    return findLevel(categories, parentId);
  };

  const updateCategoryInTree = (
    categories: Category[],
    updatedCategory: Category,
  ): Category[] => {
    return categories.map((category) => {
      if (category.id === updatedCategory.id) {
        return { ...updatedCategory, children: category.children };
      }
      if (category.children) {
        return {
          ...category,
          children: updateCategoryInTree(category.children, updatedCategory),
        };
      }
      return category;
    });
  };

  const addChildCategory = (
    categories: Category[],
    parentId: number,
    newCategory: Category,
  ): Category[] => {
    return categories.map((category) => {
      if (category.id === parentId) {
        return {
          ...category,
          children: [...(category.children || []), newCategory],
        };
      }
      if (category.children) {
        return {
          ...category,
          children: addChildCategory(category.children, parentId, newCategory),
        };
      }
      return category;
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameEng: category.nameEng || "",
      description: category.description || "",
      parentId: category.parentId || null,
      sortOrder: category.sortOrder,
      status: category.status,
      icon: category.icon || "",
      slug: category.slug || "",
      seoTitle: category.seoTitle || "",
      seoDescription: category.seoDescription || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (categoryId: number) => {
    if (
      window.confirm(
        "정말로 이 카테고리를 삭제하시겠습니까? 하위 카테고리도 함께 삭제됩니다.",
      )
    ) {
      setCategories((prev) => deleteCategoryFromTree(prev, categoryId));
    }
  };

  const deleteCategoryFromTree = (
    categories: Category[],
    categoryId: number,
  ): Category[] => {
    return categories.filter((category) => {
      if (category.id === categoryId) {
        return false;
      }
      if (category.children) {
        category.children = deleteCategoryFromTree(
          category.children,
          categoryId,
        );
      }
      return true;
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      nameEng: "",
      description: "",
      parentId: null,
      sortOrder: 1,
      status: "active",
      icon: "",
      slug: "",
      seoTitle: "",
      seoDescription: "",
    });
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const getFlatCategories = (
    categories: Category[],
    level: number = 0,
  ): Category[] => {
    let result: Category[] = [];
    for (let category of categories) {
      result.push({ ...category, level });
      if (
        category.children &&
        expandedCategories.includes(category.id.toString())
      ) {
        result.push(...getFlatCategories(category.children, level + 1));
      }
    }
    return result;
  };

  const getAllCategories = (categories: Category[]): Category[] => {
    let result: Category[] = [];
    for (let category of categories) {
      result.push(category);
      if (category.children) {
        result.push(...getAllCategories(category.children));
      }
    }
    return result;
  };

  const filteredCategories = categories.filter((category) => {
    const searchInCategory = (cat: Category): boolean => {
      const matches =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.nameEng &&
          cat.nameEng.toLowerCase().includes(searchTerm.toLowerCase()));
      if (matches) return true;
      if (cat.children) {
        return cat.children.some(searchInCategory);
      }
      return false;
    };
    return searchInCategory(category);
  });

  const flatCategories = getFlatCategories(filteredCategories);
  const allCategories = getAllCategories(categories);

  return (
    <Container maxWidth="full">
      (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            카테고리 관리
          </h1>
          <p className="text-gray-600">
            상품 카테고리의 계층 구조를 관리합니다.
          </p>
        </div>
        {/* 검색 및 제어 */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="카테고리명, 영문명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() =>
                setExpandedCategories(
                  allCategories.map((cat) => cat.id.toString()),
                )
              }
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              모두 펼치기
            </button>

            <button
              onClick={() => setExpandedCategories([])}
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              모두 접기
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 whitespace-nowrap"
            >
              카테고리 추가
            </button>
          </div>
        </div>
        {/* 카테고리 트리 */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리 구조
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    영문명/슬러그
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    정렬순서
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flatCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="flex items-center"
                        style={{
                          marginLeft: `${(category.level || 0) * 24}px`,
                        }}
                      >
                        {category.children && category.children.length > 0 && (
                          <button
                            onClick={() =>
                              toggleExpanded(category.id.toString())
                            }
                            className="mr-2 text-gray-400 hover:text-gray-600"
                          >
                            {expandedCategories.includes(category.id.toString())
                              ? "▼"
                              : "▶"}
                          </button>
                        )}
                        <div className="flex items-center">
                          {category.icon && (
                            <span className="mr-2">{category.icon}</span>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            {category.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.nameEng}
                      </div>
                      {category.slug && (
                        <div className="text-xs text-gray-500">
                          /{category.slug}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.productsCount?.toLocaleString() || 0}개
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.sortOrder}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.status === "active" ? "활성" : "비활성"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            parentId: category.id,
                          }));
                          setIsModalOpen(true);
                        }}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        하위추가
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* 카테고리 추가/수정 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCategory ? "카테고리 수정" : "카테고리 추가"}
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        카테고리명 *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        영문명
                      </label>
                      <input
                        type="text"
                        value={formData.nameEng}
                        onChange={(e) =>
                          handleInputChange("nameEng", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상위 카테고리
                    </label>
                    <select
                      value={formData.parentId || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parentId",
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">최상위 카테고리</option>
                      {allCategories
                        .filter((cat) => cat.id !== editingCategory?.id)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {"  ".repeat(category.level || 0)}
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      설명
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        아이콘
                      </label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) =>
                          handleInputChange("icon", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="□"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        정렬순서
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) =>
                          handleInputChange(
                            "sortOrder",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={1}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        상태
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          handleInputChange(
                            "status",
                            e.target.value as "active" | "inactive",
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL 슬러그
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        handleInputChange("slug", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="electronics"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO 제목
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) =>
                        handleInputChange("seoTitle", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO 설명
                    </label>
                    <textarea
                      value={formData.seoDescription}
                      onChange={(e) =>
                        handleInputChange("seoDescription", e.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {editingCategory ? "수정" : "추가"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )
    </Container>
  );
};

export default CategoriesManagementPage;
