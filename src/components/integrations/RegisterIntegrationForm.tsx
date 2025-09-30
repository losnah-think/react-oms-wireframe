"use client";

import React from "react";
import {
  Card,
  Input,
  Dropdown,
  Button,
  Stack,
  Badge,
} from "../../design-system";
import { mockVendors, type MockVendor } from "../../data/mockVendors";

const platformOptions = [
  { value: "cafe24", label: "카페24" },
  { value: "godo", label: "고도몰" },
  { value: "sabangnet", label: "사방넷" },
  { value: "makeshop", label: "메이크샵" },
  { value: "smartstore", label: "네이버 스마트스토어" },
  { value: "kurly", label: "마켓컬리" },
  { value: "custom", label: "기타 (커스텀)" },
];

const vendorsForSelect = mockVendors.map((vendor) => ({
  value: vendor.id,
  label: `${vendor.name} · ${vendor.platform}`,
}));

interface RegisterIntegrationFormProps {
  onClose?: () => void;
  onRegistered?: (integration: any) => void;
  vendors?: MockVendor[];
  initialShop?: {
    id: string;
    platform?: string;
    name?: string;
    credentials?: Record<string, string>;
  } | null;
}

const fieldLabel = {
  shopId: "Shop ID",
  storeName: "상점명",
  domain: "도메인",
  apiBaseUrl: "API Base URL",
  redirectUri: "Redirect URI",
  clientId: "Client ID",
  clientSecret: "Client Secret",
  accessToken: "Access Token",
} as const;

export default function RegisterIntegrationForm({
  onClose,
  onRegistered,
  vendors = mockVendors,
  initialShop = null,
}: RegisterIntegrationFormProps) {
  const [platform, setPlatform] = React.useState(initialShop?.platform ?? "cafe24");
  const [vendorId, setVendorId] = React.useState<string>("");
  const [shopId, setShopId] = React.useState(initialShop?.id ?? "");
  const [storeName, setStoreName] = React.useState(initialShop?.name ?? "");
  const [domain, setDomain] = React.useState(initialShop?.credentials?.storeDomain ?? "");
  const [apiBaseUrl, setApiBaseUrl] = React.useState(initialShop?.credentials?.apiBaseUrl ?? "");
  const [redirectUri, setRedirectUri] = React.useState(initialShop?.credentials?.redirectUri ?? "");
  const [clientId, setClientId] = React.useState(initialShop?.credentials?.clientId ?? "");
  const [clientSecret, setClientSecret] = React.useState(initialShop?.credentials?.clientSecret ?? "");
  const [accessToken, setAccessToken] = React.useState(initialShop?.credentials?.accessToken ?? "");
  const [isTesting, setTesting] = React.useState(false);

  React.useEffect(() => {
    if (!vendorId) return;
    const vendor = vendors.find((item) => item.id === vendorId);
    if (!vendor) return;
    const slug = vendor.platform?.toLowerCase?.() || "custom";
    setPlatform(slug as string);
    setStoreName((prev) => prev || vendor.name);
    setShopId((prev) => prev || `${slug}_${vendor.id}`);
  }, [vendorId, vendors]);

  React.useEffect(() => {
    if (!initialShop) return;
    setPlatform(initialShop.platform ?? "cafe24");
    setShopId(initialShop.id);
    setStoreName(initialShop.name ?? "");
    setDomain(initialShop.credentials?.storeDomain ?? "");
    setApiBaseUrl(initialShop.credentials?.apiBaseUrl ?? "");
    setRedirectUri(initialShop.credentials?.redirectUri ?? "");
    setClientId(initialShop.credentials?.clientId ?? "");
    setClientSecret(initialShop.credentials?.clientSecret ?? "");
    setAccessToken(initialShop.credentials?.accessToken ?? "");
  }, [initialShop]);

  const visibleFields = React.useMemo(() => {
    switch (platform) {
      case "cafe24":
        return ["shopId", "clientId", "clientSecret"] as const;
      case "godo":
        return ["storeName", "domain", "apiBaseUrl", "accessToken"] as const;
      case "sabangnet":
        return ["storeName", "apiBaseUrl", "clientId", "clientSecret"] as const;
      case "makeshop":
        return ["storeName", "apiBaseUrl", "accessToken"] as const;
      case "smartstore":
        return ["storeName", "apiBaseUrl", "clientId", "clientSecret", "accessToken"] as const;
      case "kurly":
        return ["storeName", "clientId", "clientSecret", "accessToken"] as const;
      default:
        return ["storeName", "apiBaseUrl", "redirectUri", "clientId", "clientSecret", "accessToken"] as const;
    }
  }, [platform]);

  const isRequired = (key: string) => {
    if (platform === "cafe24" && key === "shopId") return true;
    if (platform === "cafe24" && key === "clientId") return true;
    if (platform === "cafe24" && key === "clientSecret") return true;
    if (platform === "godo" && key === "storeName") return true;
    if (platform === "makeshop" && key === "storeName") return true;
    if (platform === "makeshop" && key === "accessToken") return true;
    if (platform === "custom" && key === "storeName") return true;
    if (platform === "custom" && key === "apiBaseUrl") return true;
    return false;
  };

  const getStateValue = (key: string) => {
    switch (key) {
      case "shopId":
        return shopId;
      case "storeName":
        return storeName;
      case "domain":
        return domain;
      case "apiBaseUrl":
        return apiBaseUrl;
      case "redirectUri":
        return redirectUri;
      case "clientId":
        return clientId;
      case "clientSecret":
        return clientSecret;
      case "accessToken":
        return accessToken;
      default:
        return "";
    }
  };

  const setStateValue = (key: string, value: string) => {
    switch (key) {
      case "shopId":
        return setShopId(value);
      case "storeName":
        return setStoreName(value);
      case "domain":
        return setDomain(value);
      case "apiBaseUrl":
        return setApiBaseUrl(value);
      case "redirectUri":
        return setRedirectUri(value);
      case "clientId":
        return setClientId(value);
      case "clientSecret":
        return setClientSecret(value);
      case "accessToken":
        return setAccessToken(value);
      default:
        return;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    for (const fieldKey of visibleFields) {
      if (isRequired(fieldKey) && !getStateValue(fieldKey).trim()) {
        window.alert(`${fieldLabel[fieldKey]} 입력이 필요합니다.`);
        return;
      }
    }

    const id = shopId.trim() || `shop_${Date.now()}`;
    const payload: Record<string, string> = { platform };
    visibleFields.forEach((fieldKey) => {
      const value = getStateValue(fieldKey);
      if (value) {
        payload[fieldKey] = value.trim();
      }
    });

    try {
      const resp = await fetch(`/api/integrations/shops/${id}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (data?.ok) {
        window.alert("연결이 등록되었습니다.");
        onRegistered?.({ id, ...payload });
        onClose?.();
      } else {
        window.alert("등록에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      window.alert("등록 중 오류가 발생했습니다.");
    }
  };

  const handleTestConnection = async () => {
    if (!apiBaseUrl) {
      window.alert("API Base URL을 입력하세요.");
      return;
    }
    setTesting(true);
    try {
      const resp = await fetch("/api/integrations/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiBaseUrl, accessToken, clientId, clientSecret }),
      });
      const data = await resp.json();
      if (data?.ok) window.alert(`연결 성공 (HTTP ${data.status})`);
      else window.alert(`연결 실패 (HTTP ${data?.status || "unknown"})`);
    } catch (error) {
      console.error(error);
      window.alert("테스트 연결 중 오류가 발생했습니다.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card padding="lg" className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">샵 정보</h3>
            <p className="tex-xs text-gray-500">
              플랫폼을 선택하고 필수 정보를 입력하세요. 필요 시 채널 관리자에서 정보를 확인할 수 있습니다.
            </p>
          </div>
          {initialShop && (
            <Badge size="small" variant="secondary">
              기존 연동 수정
            </Badge>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Dropdown
            label="플랫폼"
            options={platformOptions}
            value={platform}
            onChange={(value) => setPlatform(value)}
            fullWidth
          />
          <Dropdown
            label="연동할 거래처 (선택)"
            options={[{ value: "", label: "직접 입력" }, ...vendorsForSelect]}
            value={vendorId}
            onChange={(value) => setVendorId(value)}
            fullWidth
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {visibleFields.map((fieldKey) => (
            <Input
              key={fieldKey}
              label={`${fieldLabel[fieldKey]}${isRequired(fieldKey) ? " *" : ""}`}
              value={getStateValue(fieldKey)}
              onChange={(event) => setStateValue(fieldKey, event.target.value)}
              placeholder={fieldLabel[fieldKey]}
              fullWidth
            />
          ))}
        </div>

        <Stack direction="row" gap={3} className="flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="small"
            onClick={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting ? "테스트 중..." : "테스트 연결"}
          </Button>
          <Button type="submit" size="small">
            저장
          </Button>
          <Button type="button" variant="outline" size="small" onClick={onClose}>
            취소
          </Button>
        </Stack>
      </Card>
    </form>
  );
}
