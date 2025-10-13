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
  label: `${vendor.name} (${vendor.platform})`,
  platform: vendor.platform,
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
  const [platform, setPlatform] = React.useState(initialShop?.platform ?? "");
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

  // 선택된 판매처 정보
  const selectedVendor = React.useMemo(() => {
    if (!vendorId) return null;
    return vendors.find((v) => v.id === vendorId);
  }, [vendorId, vendors]);

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
        window.alert("연결이 성공적으로 등록되었습니다!");
        onRegistered?.({ id, ...payload });
        onClose?.();
      } else {
        window.alert("등록에 실패했습니다. 입력 정보를 다시 확인해주세요.");
      }
    } catch (error) {
      console.error(error);
      window.alert("등록 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.");
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
      if (data?.ok) window.alert(`연결 테스트에 성공했습니다! (HTTP ${data.status})`);
      else window.alert(`연결 테스트에 실패했습니다. (HTTP ${data?.status || "unknown"})`);
    } catch (error) {
      console.error(error);
      window.alert("테스트 연결 중 오류가 발생했습니다. 설정을 확인해주세요.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">판매처 연동 등록</h3>
          <p className="text-sm text-gray-600">
            연동할 판매처를 선택하고 필수 정보를 입력하세요.
          </p>
        </div>
        {initialShop && (
          <Badge size="small" variant="secondary">
            기존 연동 수정
          </Badge>
        )}
      </div>

      {/* 판매처 선택 섹션 - 강조 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            1. 판매처 선택 <span className="text-red-500">*</span>
          </label>
          <Dropdown
            options={[{ value: "", label: "판매처를 선택하세요" }, ...vendorsForSelect]}
            value={vendorId}
            onChange={(value) => setVendorId(value)}
            fullWidth
          />
          <p className="mt-2 text-xs text-gray-600">
            기존에 등록된 판매처를 선택하거나, 선택하지 않으면 새로운 판매처로 등록됩니다.
          </p>
        </div>

        {/* 선택된 판매처 정보 미리보기 */}
        {selectedVendor && (
          <div className="bg-white border border-blue-300 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedVendor.name}</h4>
                <p className="text-sm text-gray-600 mt-1">코드: {selectedVendor.code}</p>
              </div>
              <Badge variant="primary" size="small">
                {selectedVendor.platform}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {selectedVendor.settings?.contact && (
                <div>
                  <span className="text-gray-500">담당자:</span>
                  <span className="ml-2 text-gray-900">{selectedVendor.settings.contact}</span>
                </div>
              )}
              {selectedVendor.settings?.loginId && (
                <div>
                  <span className="text-gray-500">로그인ID:</span>
                  <span className="ml-2 text-gray-900">{selectedVendor.settings.loginId}</span>
                </div>
              )}
              {selectedVendor.settings?.vendorType && (
                <div className="col-span-2">
                  <span className="text-gray-500">타입:</span>
                  <span className="ml-2 text-gray-900">{selectedVendor.settings.vendorType}</span>
                </div>
              )}
              {selectedVendor.settings?.commissionRate && (
                <div className="col-span-2">
                  <span className="text-gray-500">수수료율:</span>
                  <span className="ml-2 text-gray-900">{selectedVendor.settings.commissionRate}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 플랫폼 설정 섹션 */}
      <div className={`space-y-4 ${!vendorId ? 'opacity-50' : ''}`}>
        <label className="block text-sm font-semibold text-gray-900">
          2. 플랫폼 정보 <span className="text-red-500">*</span>
        </label>
        <Dropdown
          label="플랫폼 종류"
          options={platformOptions}
          value={platform}
          onChange={(value) => setPlatform(value)}
          fullWidth
          disabled={true}
        />
        {!vendorId ? (
          <p className="text-xs text-amber-600">
            ⚠️ 먼저 판매처를 선택해주세요.
          </p>
        ) : (
          <p className="text-xs text-blue-600">
            ✓ 선택한 판매처의 플랫폼이 자동으로 설정되었습니다.
          </p>
        )}
      </div>

      {/* API 인증 정보 섹션 */}
      <div className={`space-y-4 ${!vendorId ? 'opacity-50' : ''}`}>
        <label className="block text-sm font-semibold text-gray-900">
          3. API 인증 정보 <span className="text-red-500">*</span>
        </label>
        {!vendorId ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-500 text-sm">
              판매처를 선택하면 API 인증 정보를 입력할 수 있습니다.
            </p>
          </div>
        ) : (
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
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleTestConnection}
          disabled={isTesting || !vendorId}
        >
          {isTesting ? "테스트 중..." : "테스트 연결"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" disabled={!vendorId}>
          저장
        </Button>
      </div>
    </form>
  );
}
