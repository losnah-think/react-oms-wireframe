// Pages exports
export { default as Dashboard } from "./dashboard/Dashboard";
export { default as OrderList } from "./orders/OrderList";
export { default as OrderListPage } from "./orders/OrderListPage";
export { default as OrderAnalytics } from "./orders/OrderAnalytics";
export { default as OrderSettings } from "./orders/OrderSettings";

export { default as ProductsListPage } from "./products/ProductsListPage";
export { default as ProductsAddPage } from "./products/ProductsAddPage";
export { default as ProductDetailPage } from "./products/ProductDetailPage";
export { default as ProductImportPage } from "./products/ProductImportPage";
export { default as ExternalProductImportPage } from "./products/ExternalProductImportPage";
export { default as ProductCsvUploadPage } from "./products/ProductCsvUploadPage";

export { default as VendorsListPage } from "./partners/VendorsListPage";
export { default as VendorProductsPage } from "./partners/VendorProductsPage";
export { default as VendorInfoManagementPage } from "./partners/VendorInfoManagementPage";
export { default as CategoryMappingPage } from "./partners/CategoryMappingPage";

export { default as CategoriesManagementPage } from "./categories/CategoriesManagementPage";

export { default as VendorManagementPage } from "./partners/VendorManagementPage";
export { default as VendorFixedAddressManagementPage } from "./partners/VendorFixedAddressManagementPage";
// NOTE: The following partner pages are not present in the codebase and
// were removed from this index to avoid module-not-found errors. If you
// add them later, re-export here:
// export { default as DeliveryCompanyManagementPage } from "./partners/DeliveryCompanyManagementPage";
// export { default as ExpectedDeliveryListPage } from "./partners/ExpectedDeliveryListPage";
// export { default as OrderSlipListPage } from "./partners/OrderSlipListPage";
// export { default as SupplierOrderPage } from "./partners/SupplierOrderPage";

export { default as BrandsPage } from "./settings/BrandsPage";
export { default as ProductCategoryPage } from "./settings/ProductCategoryPage";
// Product seasons/years pages and barcode management are not present under
// src/features/settings; keep exports minimal until those modules exist.
// export { default as ProductSeasonsPage } from "./settings/ProductSeasonsPage";
// export { default as ProductYearsPage } from "./settings/ProductYearsPage";
// export { default as BarcodeManagementPage } from "./settings/bc";
