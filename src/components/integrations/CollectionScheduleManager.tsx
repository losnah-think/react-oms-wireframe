"use client";

import React from "react";
import {
  Card,
  Input,
  Dropdown,
  Button,
  Stack,
  Table,
  type TableColumn,
  Badge,
} from "../../design-system";

const STORAGE_KEY = "integrationCollectionSchedules_v1";

export interface ConnectedShopOption {
  id: string;
  name: string;
  platform: string;
}

type ResourceType = "orders" | "products";

type FrequencyOption = "15m" | "30m" | "1h" | "4h" | "12h" | "24h";

type CollectionSchedule = {
  id: string;
  shopId: string;
  shopName: string;
  platform: string;
  resource: ResourceType;
  frequency: FrequencyOption;
  active: boolean;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
};

const resourceOptions = [
  { value: "orders", label: "주문" },
  { value: "products", label: "상품" },
];

const frequencyOptions: { value: FrequencyOption; label: string }[] = [
  { value: "15m", label: "15분" },
  { value: "30m", label: "30분" },
  { value: "1h", label: "1시간" },
  { value: "4h", label: "4시간" },
  { value: "12h", label: "12시간" },
  { value: "24h", label: "24시간" },
];

const FREQUENCY_TO_MINUTES: Record<FrequencyOption, number> = {
  "15m": 15,
  "30m": 30,
  "1h": 60,
  "4h": 240,
  "12h": 720,
  "24h": 1440,
};

const loadSchedules = (): CollectionSchedule[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CollectionSchedule[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const computeNextRun = (frequency: FrequencyOption) => {
  const minutes = FREQUENCY_TO_MINUTES[frequency] ?? 60;
  return new Date(Date.now() + minutes * 60 * 1000).toLocaleString();
};

export default function CollectionScheduleManager({
  shops = [],
}: {
  shops: ConnectedShopOption[];
}) {
  const [schedules, setSchedules] = React.useState<CollectionSchedule[]>(loadSchedules);
  const [shopId, setShopId] = React.useState<string>(shops[0]?.id ?? "");
  const [resource, setResource] = React.useState<ResourceType>("orders");
  const [frequency, setFrequency] = React.useState<FrequencyOption>("1h");
  const [keyword, setKeyword] = React.useState("");

  React.useEffect(() => {
    if (!shopId && shops.length > 0) {
      setShopId(shops[0].id);
    }
  }, [shops, shopId]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    } catch (error) {
      console.error(error);
    }
  }, [schedules]);

  const addSchedule = () => {
    if (!shopId) {
      window.alert("연동 샵을 선택하세요.");
      return;
    }

    const shop = shops.find((item) => item.id === shopId);
    if (!shop) {
      window.alert("선택한 샵 정보를 불러오지 못했습니다.");
      return;
    }

    const id = `schedule-${Date.now()}`;
    const next: CollectionSchedule = {
      id,
      shopId,
      shopName: shop.name,
      platform: shop.platform,
      resource,
      frequency,
      active: true,
      createdAt: new Date().toLocaleString(),
      nextRun: computeNextRun(frequency),
    };

    setSchedules((prev) => [next, ...prev]);
  };

  const toggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              active: !item.active,
              nextRun: !item.active ? computeNextRun(item.frequency) : item.nextRun,
            }
          : item,
      ),
    );
  };

  const removeSchedule = (id: string) => {
    if (!window.confirm("이 수집 주기를 삭제하시겠습니까?")) return;
    setSchedules((prev) => prev.filter((item) => item.id !== id));
  };

  const changeFrequency = (id: string, value: FrequencyOption) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              frequency: value,
              nextRun: computeNextRun(value),
            }
          : item,
      ),
    );
  };

  const filtered = React.useMemo(() => {
    if (!keyword.trim()) return schedules;
    return schedules.filter((item) =>
      item.shopName.includes(keyword) || item.platform.includes(keyword),
    );
  }, [schedules, keyword]);

  const summary = React.useMemo(() => {
    const total = schedules.length;
    const active = schedules.filter((item) => item.active).length;
    const upcoming = schedules
      .filter((item) => item.active && item.nextRun)
      .sort(
        (a, b) => new Date(a.nextRun || 0).valueOf() - new Date(b.nextRun || 0).valueOf(),
      )[0]?.nextRun;
    return {
      total,
      active,
      upcoming: upcoming ?? "-",
    };
  }, [schedules]);

  const columns: TableColumn<CollectionSchedule>[] = [
    {
      key: "shopName",
      title: "연동 샵",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{record.shopName}</span>
          <span className="text-xs text-gray-500">{record.platform}</span>
        </div>
      ),
    },
    {
      key: "resource",
      title: "수집 항목",
      render: (value) => (
        <Badge size="small" variant="secondary">
          {resourceOptions.find((opt) => opt.value === value)?.label ?? value}
        </Badge>
      ),
    },
    {
      key: "frequency",
      title: "주기",
      render: (value, record) => (
        <Dropdown
          size="small"
          options={frequencyOptions}
          value={value}
          onChange={(next) => changeFrequency(record.id, next as FrequencyOption)}
        />
      ),
    },
    {
      key: "nextRun",
      title: "다음 실행",
      render: (value) => <span className="text-sm text-gray-700">{value ?? "-"}</span>,
    },
    {
      key: "createdAt",
      title: "등록일",
    },
    {
      key: "active",
      title: "상태",
      render: (value) => (
        <Badge size="small" variant={value ? "success" : "secondary"}>
          {value ? "활성" : "중지"}
        </Badge>
      ),
      align: "center",
    },
    {
      key: "actions",
      title: "",
      render: (_, record) => (
        <Stack direction="row" gap={2}>
          <Button size="small" variant="outline" onClick={() => toggleSchedule(record.id)}>
            {record.active ? "중지" : "재개"}
          </Button>
          <Button size="small" variant="outline" onClick={() => removeSchedule(record.id)}>
            삭제
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Card padding="lg" className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">수집 주기 관리</h2>
          <p className="text-xs text-gray-600">
            주기적으로 pull 해야 하는 항목을 등록하고, 상태를 한눈에 관리하세요.
          </p>
        </div>
        <Stack direction="row" gap={3} className="flex-wrap">
          <Badge size="small" variant="secondary">
            전체 {summary.total}건
          </Badge>
          <Badge size="small" variant="success">
            활성 {summary.active}건
          </Badge>
          <Badge size="small" variant="secondary">
            다음 실행 {summary.upcoming}
          </Badge>
        </Stack>
      </div>

      <Card padding="md" className="space-y-4 bg-gray-50">
        <div className="grid gap-3 md:grid-cols-4">
          <Dropdown
            label="연동 샵"
            options={shops.map((shop) => ({ value: shop.id, label: `${shop.name} • ${shop.platform}` }))}
            value={shopId}
            onChange={setShopId}
            fullWidth
          />
          <Dropdown
            label="수집 항목"
            options={resourceOptions}
            value={resource}
            onChange={(value) => setResource(value as ResourceType)}
            fullWidth
          />
          <Dropdown
            label="주기"
            options={frequencyOptions}
            value={frequency}
            onChange={(value) => setFrequency(value as FrequencyOption)}
            fullWidth
          />
          <Input
            label="검색"
            placeholder="샵 또는 플랫폼 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            fullWidth
          />
        </div>
        <Button size="small" onClick={addSchedule} disabled={!shopId}>
          주기 등록
        </Button>
      </Card>

      <Table<CollectionSchedule>
        bordered
        data={filtered}
        columns={columns}
        size="small"
      />

      {filtered.length === 0 && (
        <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          등록된 수집 주기가 없습니다. 위의 폼에서 새로운 주기를 추가하세요.
        </div>
      )}
    </Card>
  );
}
