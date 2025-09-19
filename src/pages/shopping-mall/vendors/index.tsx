import React from "react";
import { Container } from "../../../design-system";

export default function VendorsIndex() {
  return (
    <Container>
      <div className="p-6">
  <h1 className="text-2xl font-bold">판매처 관리</h1>
        <p className="text-gray-600">하위 메뉴에서 항목을 선택하세요.</p>
      </div>
    </Container>
  );
}
export { default as VendorManagementPage } from "../../vendors/VendorManagementPage";
export { default as VendorFixedAddressManagementPage } from "../../vendors/VendorFixedAddressManagementPage";
export { default as DeliveryCompanyManagementPage } from "../../vendors/DeliveryCompanyManagementPage";
export { default as ExpectedDeliveryListPage } from "../../vendors/suppliers/ExpectedDeliveryListPage";
export { default as OrderSlipListPage } from "../../vendors/suppliers/OrderSlipListPage";
export { default as SupplierOrderPage } from "../../vendors/suppliers/SupplierOrderPage";
