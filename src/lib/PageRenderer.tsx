import React from 'react';

// PageRenderer 클래스 - 페이지 렌더링 로직 관리
export class PageRenderer {
  private static instance: PageRenderer;

  private constructor() {}

  public static getInstance(): PageRenderer {
    if (!PageRenderer.instance) {
      PageRenderer.instance = new PageRenderer();
    }
    return PageRenderer.instance;
  }

  public renderPage(currentPage: string, selectedProductId: string, onNavigate: (page: string, id?: string) => void): JSX.Element {
    switch (currentPage) {
      // Dashboard
      case "dashboard":
        return this.renderDashboard();

      // Products
      case "products-list":
        return this.renderProductsList(onNavigate);
      case "products-detail":
        return this.renderProductDetail(selectedProductId, onNavigate);
      case "products-registration-history":
        return this.renderRegistrationHistory();
      case "products-individual-registration":
        return this.renderIndividualRegistration();
      case "products-add":
        return this.renderProductsAdd(onNavigate);
      case "products-edit":
        return this.renderProductEdit(selectedProductId, onNavigate);
      case "products-csv":
        return this.renderProductsCsv();
      case "products-import":
        return this.renderProductsImport();
      case "products-external-import":
        return this.renderExternalProductImport();

      // Orders
      case "orders-list":
        return this.renderOrdersList();
      case "orders-analytics":
        return this.renderOrdersAnalytics();
      case "orders-settings":
        return this.renderOrdersSettings();

      // Categories
      case "categories":
        return this.renderCategories();

      // Malls
      case "malls-list":
        return this.renderMallsList();
      case "malls-info":
        return this.renderMallInfo();
      case "malls-products":
        return this.renderMallProducts();
      case "malls-category-mapping":
        return this.renderCategoryMapping();

      // Settings
      case "settings-product-classifications":
        return this.renderProductClassifications();
      case "settings-product-groups":
        return this.renderProductGroups();
      case "settings-integrations":
        return this.renderIntegrations();
      case "settings-integrations-orderDetail":
        return this.renderIntegrationOrderDetail();
      case "settings-brands":
        return this.renderBrands();
      case "settings-basic-metadata":
        return this.renderBasicMetadata();
      case "settings-product-years":
        return this.renderProductYears();
      case "settings-product-seasons":
        return this.renderProductSeasons();
      case "settings-barcodes":
        return this.renderBarcodes();

      default:
        return this.renderDashboard();
    }
  }

  private renderDashboard(): JSX.Element {
    const Dashboard = require("@/features/dashboard/Dashboard").default;
    return <Dashboard />;
  }

  private renderProductsList(onNavigate: (page: string, id?: string) => void): JSX.Element {
    const ProductsListPage = require("@/features/products/ProductsListPage").default;
    return <ProductsListPage onNavigate={onNavigate} />;
  }

  private renderProductDetail(productId: string, onNavigate: (page: string, id?: string) => void): JSX.Element {
    const ProductDetailPage = require("@/features/products/ProductDetailPage").default;
    return <ProductDetailPage productId={productId} onNavigate={onNavigate} />;
  }

  private renderRegistrationHistory(): JSX.Element {
    const RegistrationHistoryPage = require("@/features/products/registration-history").default;
    return <RegistrationHistoryPage />;
  }

  private renderIndividualRegistration(): JSX.Element {
    const IndividualRegistrationPage = require("@/features/products/individual-registration").default;
    return <IndividualRegistrationPage />;
  }

  private renderProductsAdd(onNavigate: (page: string, id?: string) => void): JSX.Element {
    const ProductsAddPage = require("@/features/products/ProductsAddPage").default;
    return <ProductsAddPage onNavigate={onNavigate} />;
  }

  private renderProductEdit(productId: string, onNavigate: (page: string, id?: string) => void): JSX.Element {
    const ProductDetailPage = require("@/features/products/ProductDetailPage").default;
    return <ProductDetailPage productId={productId} onNavigate={onNavigate} />;
  }

  private renderProductsCsv(): JSX.Element {
    const ProductCsvUploadPage = require("@/features/products/ProductCsvUploadPage").default;
    return <ProductCsvUploadPage />;
  }

  private renderProductsImport(): JSX.Element {
    const ProductImportPage = require("@/features/products/ProductImportPage").default;
    return <ProductImportPage />;
  }

  private renderExternalProductImport(): JSX.Element {
    const ExternalProductImportPage = require("@/features/products/ExternalProductImportPage").default;
    return <ExternalProductImportPage />;
  }

  private renderOrdersList(): JSX.Element {
    const OrderList = require("@/features/orders/OrderList").default;
    return <OrderList />;
  }

  private renderOrdersAnalytics(): JSX.Element {
    const OrderAnalytics = require("@/features/orders/OrderAnalytics").default;
    return <OrderAnalytics orders={[]} />;
  }

  private renderOrdersSettings(): JSX.Element {
    const OrderSettings = require("@/features/orders/OrderSettings").default;
    return <OrderSettings onSave={(settings: any) => console.log("Settings saved:", settings)} />;
  }

  private renderCategories(): JSX.Element {
    const CategoriesManagementPage = require("@/features/categories/CategoriesManagementPage").default;
    return <CategoriesManagementPage />;
  }

  private renderMallsList(): JSX.Element {
    const MallsListPage = require("@/features/partners/MallsListPage").default;
    return <MallsListPage />;
  }

  private renderMallInfo(): JSX.Element {
    const MallInfoManagementPage = require("@/features/partners/MallInfoManagementPage").default;
    return <MallInfoManagementPage />;
  }

  private renderMallProducts(): JSX.Element {
    const MallProductsPage = require("@/features/partners/MallProductsPage").default;
    return <MallProductsPage />;
  }

  private renderCategoryMapping(): JSX.Element {
    const CategoryMappingPage = require("@/features/partners/CategoryMappingPage").default;
    return <CategoryMappingPage />;
  }

  private renderProductClassifications(): JSX.Element {
    const ProductCategoryPage = require("@/features/settings/ProductCategoryPage").default;
    return <ProductCategoryPage />;
  }

  private renderProductGroups(): JSX.Element {
    return <div>상품 그룹 관리 기능은 현재 준비 중입니다.</div>;
  }

  private renderIntegrations(): JSX.Element {
    const IntegrationPage = require("@/features/settings/integration").default;
    return <IntegrationPage />;
  }

  private renderIntegrationOrderDetail(): JSX.Element {
    return <div>통합 주문 상세 기능은 현재 준비 중입니다.</div>;
  }

  private renderBrands(): JSX.Element {
    const BasicMetadataSettings = require("@/features/settings/basic-metadata").default;
    return <BasicMetadataSettings initialTab="brands" />;
  }

  private renderBasicMetadata(): JSX.Element {
    const BasicMetadataSettings = require("@/features/settings/basic-metadata").default;
    return <BasicMetadataSettings initialTab="brands" />;
  }

  private renderProductYears(): JSX.Element {
    const BasicMetadataSettings = require("@/features/settings/basic-metadata").default;
    return <BasicMetadataSettings initialTab="years" />;
  }

  private renderProductSeasons(): JSX.Element {
    const BasicMetadataSettings = require("@/features/settings/basic-metadata").default;
    return <BasicMetadataSettings initialTab="seasons" />;
  }

  private renderBarcodes(): JSX.Element {
    return <div>바코드 관리 기능은 현재 준비 중입니다.</div>;
  }
}