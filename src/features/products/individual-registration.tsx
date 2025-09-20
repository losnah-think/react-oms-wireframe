"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { Container, Card, Input, Button } from "../../design-system";
import {
  fetchMockClassifications,
  Classification,
} from "../../data/product-classifications-mock";

export default function IndividualRegistrationPage() {
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [images, setImages] = useState<File[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [groupId, setGroupId] = useState<string | "">("");

  const onFile = (f?: File | null) => {
    if (!f) return;
    setImages((prev) => [...prev, f]);
  };

  const handleSave = () => {
    alert(
      "개별 상품 등록 (모의): " +
        title +
        "\n그룹(소속): " +
        (groupId || "미지정"),
    );
  };

  useEffect(() => {
    let mounted = true;
    fetchMockClassifications().then((data) => {
      if (!mounted) return;
      setClassifications(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Container maxWidth="full" centered={false} padding="md">
      <h1 className="text-2xl font-bold mb-4">개별 상품 등록</h1>

      <Card className="mb-6" padding="lg">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <label className="block text-sm font-medium mb-1">상품명</label>
            <Input
              value={title}
              onChange={(e: any) => setTitle(e.target.value)}
              placeholder="상품명을 입력하세요"
            />

            <label className="block text-sm font-medium mt-4 mb-1">
              상품 코드 (SKU)
            </label>
            <Input
              value={sku}
              onChange={(e: any) => setSku(e.target.value)}
              placeholder="SKU"
            />

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium mb-1">
                  그룹(소속)
                </label>
                <Link
                  className="text-sm text-blue-600 hover:underline"
                  href="/settings/product-classifications"
                >
                  상품 분류 관리 열기
                </Link>
              </div>
              <select
                className="w-full rounded border p-2"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              >
                <option value="">선택 안함</option>
                {classifications.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? "— " + c.name : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 mt-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">판매가</label>
                <Input
                  type="number"
                  value={price as any}
                  onChange={(e: any) =>
                    setPrice(e.target.value ? Number(e.target.value) : "")
                  }
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">재고</label>
                <Input
                  type="number"
                  value={stock as any}
                  onChange={(e: any) =>
                    setStock(e.target.value ? Number(e.target.value) : "")
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                이미지 업로드
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  onFile(
                    e.target.files && e.target.files[0]
                      ? e.target.files[0]
                      : null,
                  )
                }
              />
              <div className="mt-2 text-sm text-gray-600">
                {images.length} 개 업로드됨
              </div>
            </div>
          </div>

          <div className="col-span-4">
            <div className="text-sm text-gray-600">미리보기 영역</div>
            <div className="mt-4 border rounded h-40 bg-gray-50 flex items-center justify-center">
              미리보기
            </div>

            <div className="mt-6">
              <Button variant="primary" onClick={handleSave}>
                저장
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Container>
  );
}
