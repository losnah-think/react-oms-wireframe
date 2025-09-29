import React from "react";
import {
  Container,
  Card,
  Button,
  Input,
  Dropdown,
  Modal,
  Stack,
  Badge,
} from "../../design-system";
import {
  listVendors,
  upsertVendor,
  stampVendor,
  MockVendor,
} from "../../data/mockVendors";

type VendorFormState = {
  name: string;
  code: string;
  platform: MockVendor["platform"] | "";
  vendorType: string;
  vendorSite: string;
  apiKey: string;
  apiSecret: string;
  franchiseNumber: string;
  imageBaseUrl: string;
  commissionRate: string;
  memo: string;
  loginId: string;
  loginPassword: string;
  loginPasswordConfirm: string;
  orderDuplicatePolicy: string;
  productPageUrl: string;
  shippingNameDisplay: string;
  shippingCountDisplay: string;
  majorItems: string;
  globalService: boolean;
  globalServiceStatus: string;
  externalShipping: boolean;
  externalShippingStatus: string;
  nfaStatus: string;
};

type CreateVendorState = {
  name: string;
  code: string;
  platform: MockVendor["platform"] | "";
  vendorType: string;
};

const platformLabels: Record<MockVendor["platform"], string> = {
  godomall: "고도몰",
  wisa: "위사",
  kurly: "마켓컬리",
  smartstore: "스마트스토어",
  cafe24: "카페24",
  gmarket: "G마켓",
  coupang: "쿠팡",
  naver: "네이버",
};

const platformOptions = Object.entries(platformLabels).map(([value, label]) => ({
  value,
  label,
}));

const vendorTypeOptions = [
  { value: "오픈마켓", label: "오픈마켓" },
  { value: "전용 쇼핑몰", label: "전용 쇼핑몰" },
  { value: "마켓컬리", label: "마켓컬리" },
  { value: "스마트스토어", label: "스마트스토어" },
  { value: "카페24", label: "카페24" },
];

const orderDuplicateOptions = [
  { value: "전체 판매처 주문번호", label: "전체 판매처 주문번호" },
  { value: "판매처별 주문번호", label: "판매처별 주문번호" },
];

const shippingNameOptions = [
  { value: "상품명 보임", label: "상품명 보임" },
  { value: "상품명 숨김", label: "상품명 숨김" },
];

const shippingCountOptions = [
  { value: "수량 표시함", label: "수량 표시함" },
  { value: "수량 숨김", label: "수량 숨김" },
];

const majorItemOptions = [
  { value: "선택", label: "선택" },
  { value: "식품", label: "식품" },
  { value: "생활용품", label: "생활용품" },
  { value: "가전", label: "가전" },
];

const serviceStatusOptions = [
  { value: "사용함", label: "사용함" },
  { value: "사용안함", label: "사용안함" },
];

const createEmptyFormState = (): VendorFormState => ({
  name: "",
  code: "",
  platform: "",
  vendorType: "",
  vendorSite: "",
  apiKey: "",
  apiSecret: "",
  franchiseNumber: "",
  imageBaseUrl: "",
  commissionRate: "0%",
  memo: "",
  loginId: "",
  loginPassword: "",
  loginPasswordConfirm: "",
  orderDuplicatePolicy: orderDuplicateOptions[0].value,
  productPageUrl: "",
  shippingNameDisplay: shippingNameOptions[0].value,
  shippingCountDisplay: shippingCountOptions[0].value,
  majorItems: majorItemOptions[0].value,
  globalService: true,
  globalServiceStatus: serviceStatusOptions[0].value,
  externalShipping: false,
  externalShippingStatus: serviceStatusOptions[1].value,
  nfaStatus: "",
});

const mapVendorToForm = (vendor?: MockVendor | null): VendorFormState => {
  if (!vendor) return createEmptyFormState();

  return {
    name: vendor.name,
    code: vendor.code,
    platform: vendor.platform,
    vendorType: String(vendor.settings?.vendorType ?? ""),
    vendorSite: String(vendor.settings?.site ?? ""),
    apiKey: String(vendor.settings?.apiKey ?? ""),
    apiSecret: String(vendor.settings?.apiSecret ?? ""),
    franchiseNumber: String(vendor.settings?.franchiseNumber ?? ""),
    imageBaseUrl: String(vendor.settings?.imageBaseUrl ?? ""),
    commissionRate: String(vendor.settings?.commissionRate ?? "0%"),
    memo: String(vendor.settings?.memo ?? ""),
    loginId: String(vendor.settings?.loginId ?? ""),
    loginPassword: String(vendor.settings?.loginPassword ?? ""),
    loginPasswordConfirm: String(vendor.settings?.loginPasswordConfirm ?? ""),
    orderDuplicatePolicy: String(
      vendor.settings?.orderDuplicatePolicy ?? orderDuplicateOptions[0].value
    ),
    productPageUrl: String(vendor.settings?.productPageUrl ?? ""),
    shippingNameDisplay: String(
      vendor.settings?.shippingNameDisplay ?? shippingNameOptions[0].value
    ),
    shippingCountDisplay: String(
      vendor.settings?.shippingCountDisplay ?? shippingCountOptions[0].value
    ),
    majorItems: String(vendor.settings?.majorItems ?? majorItemOptions[0].value),
    globalService: Boolean(vendor.settings?.globalService ?? true),
    globalServiceStatus: String(
      vendor.settings?.globalServiceStatus ?? serviceStatusOptions[0].value
    ),
    externalShipping: Boolean(vendor.settings?.externalShipping ?? false),
    externalShippingStatus: String(
      vendor.settings?.externalShippingStatus ?? serviceStatusOptions[1].value
    ),
    nfaStatus: String(vendor.settings?.nfaStatus ?? ""),
  };
};

const formStateToVendor = (
  original: MockVendor,
  form: VendorFormState
): MockVendor => ({
  ...original,
  name: form.name,
  code: form.code,
  platform: (form.platform || original.platform) as MockVendor["platform"],
  updated_at: new Date().toISOString(),
  settings: {
    ...original.settings,
    vendorType: form.vendorType,
    site: form.vendorSite,
    apiKey: form.apiKey,
    apiSecret: form.apiSecret,
    franchiseNumber: form.franchiseNumber,
    imageBaseUrl: form.imageBaseUrl,
    commissionRate: form.commissionRate,
    memo: form.memo,
    loginId: form.loginId,
    loginPassword: form.loginPassword,
    loginPasswordConfirm: form.loginPasswordConfirm,
    orderDuplicatePolicy: form.orderDuplicatePolicy,
    productPageUrl: form.productPageUrl,
    shippingNameDisplay: form.shippingNameDisplay,
    shippingCountDisplay: form.shippingCountDisplay,
    majorItems: form.majorItems,
    globalService: form.globalService,
    globalServiceStatus: form.globalServiceStatus,
    externalShipping: form.externalShipping,
    externalShippingStatus: form.externalShippingStatus,
    nfaStatus: form.nfaStatus,
  },
});

const Section: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="rounded-lg border border-gray-200 bg-white">
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
    <div className="px-6 py-5 space-y-6">{children}</div>
  </div>
);

const SectionGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</div>
);

const useInitialVendors = () => React.useMemo(() => listVendors(), []);

export default function VendorsIndex() {
  const initialVendors = useInitialVendors();
  const [vendors, setVendors] = React.useState<MockVendor[]>(initialVendors);
  const [selectedVendorId, setSelectedVendorId] = React.useState<string>(
    initialVendors[0]?.id ?? ""
  );
  const [formState, setFormState] = React.useState<VendorFormState>(() =>
    mapVendorToForm(initialVendors[0])
  );
  const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
  const [createState, setCreateState] = React.useState<CreateVendorState>(
    () => ({
      name: "",
      code: "",
      platform: "",
      vendorType: vendorTypeOptions[0].value,
    })
  );
  const selectedVendor = vendors.find((vendor) => vendor.id === selectedVendorId);

  const setVendorsAndSync = (next: MockVendor[]) => {
    setVendors(next);
  };

  const handleSelectVendor = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    const next = vendors.find((vendor) => vendor.id === vendorId);
    setFormState(mapVendorToForm(next));
  };

  const handleInputChange = (
    field: keyof VendorFormState
  ): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> => (
    event
  ) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const isCheckbox = (target as HTMLInputElement).type === "checkbox";
    const value: any = isCheckbox
      ? (target as HTMLInputElement).checked
      : (target as HTMLInputElement).value;
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDropdownChange = (
    field: keyof VendorFormState
  ) => (value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggle = (field: "globalService" | "externalShipping") => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    setFormState((prev) => ({
      ...prev,
      [field]: checked,
      ...(field === "globalService"
        ? { globalServiceStatus: checked ? "사용함" : "사용안함" }
        : { externalShippingStatus: checked ? "사용함" : "사용안함" }),
    }));
  };

  const handleSave = () => {
    if (!selectedVendor) {
      return;
    }

    const updatedVendor = formStateToVendor(selectedVendor, formState);
    upsertVendor(updatedVendor);
    const next = listVendors();
    setVendorsAndSync(next);
    setFormState(mapVendorToForm(updatedVendor));
  };

  const handleCreateVendorField = (
    field: keyof CreateVendorState
  ): React.ChangeEventHandler<HTMLInputElement> => (event) => {
    setCreateState((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleCreateVendorPlatform = (value: string) => {
    setCreateState((prev) => ({
      ...prev,
      platform: value as MockVendor["platform"],
    }));
  };

  const resetCreateState = () => {
    setCreateState({
      name: "",
      code: "",
      platform: "",
      vendorType: vendorTypeOptions[0].value,
    });
  };

  const handleCreateVendor = () => {
    if (!createState.name || !createState.platform) {
      return;
    }

    const newVendor = stampVendor({
      name: createState.name,
      code: createState.code || createState.name.slice(0, 8).toUpperCase(),
      platform: createState.platform,
      settings: {
        vendorType: createState.vendorType,
        site: platformLabels[createState.platform],
        commissionRate: "0%",
        orderDuplicatePolicy: orderDuplicateOptions[0].value,
        productPageUrl: "",
        loginId: "",
        globalService: true,
        globalServiceStatus: serviceStatusOptions[0].value,
        externalShipping: false,
        externalShippingStatus: serviceStatusOptions[1].value,
      },
    });

    upsertVendor(newVendor);
    const next = listVendors();
    setVendorsAndSync(next);
    setSelectedVendorId(newVendor.id);
    setFormState(mapVendorToForm(newVendor));
    setCreateModalOpen(false);
    resetCreateState();
  };

  const vendorCountText = `${vendors.length}개의 판매처`;

  return (
    <Container maxWidth="7xl" className="space-y-6">
      <Stack direction="row" justify="between" align="center" className="">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">판매처 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            판매처 정보를 등록하고 관리합니다. 등록된 판매처는 외부 연동 설정에서 API 연동이 가능합니다.
          </p>
        </div>
        <Stack direction="row" gap={3}>
          <Button variant="outline" size="small">
            가이드 보기
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>판매처 추가</Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-full p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">판매처 목록</h2>
              <p className="text-sm text-gray-500">{vendorCountText}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {vendors.map((vendor) => {
              const isSelected = vendor.id === selectedVendorId;
              return (
                <button
                  key={vendor.id}
                  type="button"
                  onClick={() => handleSelectVendor(vendor.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition focus:outline-none ${
                    isSelected
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-200 hover:bg-primary-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-medium text-gray-900">
                        {vendor.name}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {vendor.code} · {platformLabels[vendor.platform]}
                      </div>
                    </div>
                    <Badge
                      size="small"
                      variant={vendor.is_active ? "success" : "secondary"}
                    >
                      {vendor.is_active ? "활성" : "비활성"}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Section title="판매처 정보" description="판매처 기본 정보와 연동에 필요한 설정값을 입력합니다.">
            <SectionGrid>
              <Input
                label="판매처명"
                fullWidth
                value={formState.name}
                onChange={handleInputChange("name")}
                placeholder="판매처명을 입력하세요"
              />
              <Input
                label="판매처 코드"
                fullWidth
                value={formState.code}
                onChange={handleInputChange("code")}
                placeholder="예: GODOMALL001"
              />
              <Dropdown
                label="판매처 플랫폼"
                fullWidth
                options={platformOptions}
                value={formState.platform}
                onChange={handleDropdownChange("platform")}
                placeholder="플랫폼을 선택하세요"
              />
              <Dropdown
                label="판매처 타입"
                fullWidth
                options={vendorTypeOptions}
                value={formState.vendorType}
                onChange={handleDropdownChange("vendorType")}
              />
              <Input
                label="판매처 사이트"
                fullWidth
                value={formState.vendorSite}
                onChange={handleInputChange("vendorSite")}
                placeholder="예: GodomallAPI"
              />
              <Input
                label="API 키"
                fullWidth
                value={formState.apiKey}
                onChange={handleInputChange("apiKey")}
                placeholder="API 키를 입력하세요"
              />
              <Input
                label="API 비밀키"
                fullWidth
                value={formState.apiSecret}
                onChange={handleInputChange("apiSecret")}
                placeholder="필요 시 입력"
              />
              <Input
                label="지점/프랜차이즈 번호"
                fullWidth
                value={formState.franchiseNumber}
                onChange={handleInputChange("franchiseNumber")}
                placeholder="예: WSA-001-234"
              />
              <Input
                label="이미지 기본 경로"
                fullWidth
                value={formState.imageBaseUrl}
                onChange={handleInputChange("imageBaseUrl")}
                placeholder="https://..."
              />
              <Input
                label="NFA 상태"
                fullWidth
                value={formState.nfaStatus}
                onChange={handleInputChange("nfaStatus")}
                placeholder="발급 상태를 입력"
              />
              <Input
                label="수수료율"
                fullWidth
                value={formState.commissionRate}
                onChange={handleInputChange("commissionRate")}
                placeholder="예: 3%"
              />
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  메모
                </label>
                <textarea
                  className="h-28 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="메모를 입력하세요"
                  value={formState.memo}
                  onChange={handleInputChange("memo")}
                />
              </div>
            </SectionGrid>
          </Section>

          <Section title="로그인 정보">
            <SectionGrid>
              <Input
                label="로그인 아이디"
                fullWidth
                value={formState.loginId}
                onChange={handleInputChange("loginId")}
              />
              <Input
                label="로그인 비밀번호"
                fullWidth
                type="password"
                value={formState.loginPassword}
                onChange={handleInputChange("loginPassword")}
              />
              <Input
                label="로그인 비밀번호 확인"
                fullWidth
                type="password"
                value={formState.loginPasswordConfirm}
                onChange={handleInputChange("loginPasswordConfirm")}
              />
            </SectionGrid>
          </Section>

          <Section title="주문 / CS">
            <SectionGrid>
              <Dropdown
                label="중복체크 범위"
                fullWidth
                options={orderDuplicateOptions}
                value={formState.orderDuplicatePolicy}
                onChange={handleDropdownChange("orderDuplicatePolicy")}
              />
              <Input
                label="상품 페이지 URL"
                fullWidth
                value={formState.productPageUrl}
                onChange={handleInputChange("productPageUrl")}
                placeholder="https:// 로 시작해야 합니다"
              />
            </SectionGrid>
          </Section>

          <Section title="배송 / 송장 출력">
            <SectionGrid>
              <Dropdown
                label="송장검증 상품명 표시여부"
                fullWidth
                options={shippingNameOptions}
                value={formState.shippingNameDisplay}
                onChange={handleDropdownChange("shippingNameDisplay")}
              />
              <Dropdown
                label="송장검증 수량 표시여부"
                fullWidth
                options={shippingCountOptions}
                value={formState.shippingCountDisplay}
                onChange={handleDropdownChange("shippingCountDisplay")}
              />
              <Dropdown
                label="판매처 주요 품목 등록"
                fullWidth
                options={majorItemOptions}
                value={formState.majorItems}
                onChange={handleDropdownChange("majorItems")}
              />
            </SectionGrid>
          </Section>

          <Section title="해외배송">
            <div className="space-y-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-gray-900">셀메이트 해외배송 서비스</p>
                  <p className="text-sm text-gray-500">
                    셀메이트 해외배송 서비스를 사용하여 주문을 처리할 수 있습니다.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="globalService"
                    type="checkbox"
                    checked={formState.globalService}
                    onChange={handleToggle("globalService")}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="text-sm text-gray-700" htmlFor="globalService">
                    사용함
                  </label>
                  <Dropdown
                    options={serviceStatusOptions}
                    value={formState.globalServiceStatus}
                    onChange={handleDropdownChange("globalServiceStatus")}
                    disabled={!formState.globalService}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-gray-900">외부 해외배송</p>
                  <p className="text-sm text-gray-500">
                    외부 해외배송 연동 여부를 설정합니다.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="externalShipping"
                    type="checkbox"
                    checked={formState.externalShipping}
                    onChange={handleToggle("externalShipping")}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="text-sm text-gray-700" htmlFor="externalShipping">
                    사용함
                  </label>
                  <Dropdown
                    options={serviceStatusOptions}
                    value={formState.externalShippingStatus}
                    onChange={handleDropdownChange("externalShippingStatus")}
                    disabled={!formState.externalShipping}
                  />
                </div>
              </div>
            </div>
          </Section>

          <div className="flex justify-end">
            <Button onClick={handleSave}>등록</Button>
          </div>
        </div>
      </div>

      <Modal
        open={isCreateModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          resetCreateState();
        }}
        title="판매처 추가"
        size="default"
        footer={
          <Stack direction="row" gap={3}>
            <Button
              variant="ghost"
              onClick={() => {
                setCreateModalOpen(false);
                resetCreateState();
              }}
            >
              취소
            </Button>
            <Button onClick={handleCreateVendor}>등록</Button>
          </Stack>
        }
      >
        <div className="space-y-4">
          <Input
            label="판매처명"
            fullWidth
            value={createState.name}
            onChange={handleCreateVendorField("name")}
            placeholder="판매처명을 입력하세요"
          />
          <Input
            label="판매처 코드"
            fullWidth
            value={createState.code}
            onChange={handleCreateVendorField("code")}
            placeholder="없으면 자동 생성됩니다"
          />
          <Dropdown
            label="판매처 플랫폼"
            fullWidth
            options={platformOptions}
            value={createState.platform}
            onChange={handleCreateVendorPlatform}
            placeholder="플랫폼을 선택하세요"
          />
          <Dropdown
            label="판매처 타입"
            fullWidth
            options={vendorTypeOptions}
            value={createState.vendorType}
            onChange={(value) =>
              setCreateState((prev) => ({
                ...prev,
                vendorType: value,
              }))
            }
          />
        </div>
      </Modal>
    </Container>
  );
}
