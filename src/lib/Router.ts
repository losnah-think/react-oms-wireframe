// Router 클래스 - 라우팅 로직 관리
export class Router {
  private static instance: Router;
  private routes: Map<string, string> = new Map();

  private constructor() {
    this.initializeRoutes();
  }

  public static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  public static parsePathToPage(pathname: string): { page: string; id?: string } {
    const router = Router.getInstance();
    return router.parsePath(pathname);
  }

  private initializeRoutes(): void {
    this.routes.set("dashboard", "/");
    this.routes.set("products-list", "/products");
    this.routes.set("products-add", "/products/add");
    this.routes.set("products-csv", "/products/csv");
    this.routes.set("products-import", "/products/import");
    this.routes.set("products-detail", "/products");
    this.routes.set("orders-list", "/orders");
    this.routes.set("orders-settings", "/orders/settings");
    this.routes.set("malls-list", "/malls");
    this.routes.set("settings-product-classifications", "/settings/product-classifications");
    this.routes.set("settings-product-groups", "/settings/product-groups");
    this.routes.set("settings-integrations", "/settings/integration");
    this.routes.set("settings-basic-metadata", "/settings/basic-metadata");
    this.routes.set("settings-brands", "/settings/brands");
    this.routes.set("settings-product-years", "/settings/years");
    this.routes.set("settings-product-seasons", "/settings/seasons");
    this.routes.set("vendors-sales", "/vendors/sales");
    this.routes.set("vendors-fixed-addresses", "/vendors/fixed-addresses");
    this.routes.set("vendors-products", "/vendors/products");
    this.routes.set("vendors-info", "/vendors/info");
    this.routes.set("vendors-category-mapping", "/vendors/category-mapping");
  }

  public getPath(pageId: string): string {
    return this.routes.get(pageId) ?? `/${pageId.replace(/_/g, "/").replace(/\s+/g, "-")}`;
  }

  public parsePath(pathname: string): { page: string; id?: string } {
    const parts = pathname.replace(/^\//, "").split("/").filter(Boolean);
    if (parts.length === 0) return { page: "dashboard" };

    return this.parseProductRoutes(parts) ||
           this.parseOrderRoutes(parts) ||
           this.parseMallRoutes(parts) ||
           this.parseVendorsRoutes(parts) ||
           this.parseSettingsRoutes(parts) ||
           { page: "dashboard" };
  }

  private parseProductRoutes(parts: string[]): { page: string; id?: string } | null {
    if (parts[0] !== "products") return null;

    if (parts.length === 1) return { page: "products-list" };
    if (parts[1] === "csv") return { page: "products-csv" };
    if (parts[1] === "import") return { page: "products-import" };
    if (parts[1] === "registration-history") return { page: "products-registration-history" };
    if (parts[1] === "individual-registration") return { page: "products-individual-registration" };
    if (parts[1] === "external-import") return { page: "products-external-import" };
    if (parts[1] === "add") return { page: "products-add" };
    if (parts[1] === "edit") return { page: "products-edit" };

    return { page: "products-detail", id: parts[1] };
  }

  private parseOrderRoutes(parts: string[]): { page: string; id?: string } | null {
    if (parts[0] === "orders") return { page: "orders-list" };
    return null;
  }

  private parseMallRoutes(parts: string[]): { page: string; id?: string } | null {
    if (parts[0] === "malls") return { page: "malls-list" };
    return null;
  }

  private parseVendorsRoutes(parts: string[]): { page: string; id?: string } | null {
    if (parts[0] !== "vendors") return null;

    const sub = parts[1] ?? "";
    if (sub === "sales" || sub === "") return { page: "vendors-sales" };
    if (sub === "fixed-addresses") return { page: "vendors-fixed-addresses" };
    if (sub === "products") return { page: "vendors-products" };
    if (sub === "info") return { page: "vendors-info" };
    if (sub === "category-mapping") {
      return { page: "vendors-category-mapping" };
    }
    return { page: "vendors-sales" };
  }

  private parseSettingsRoutes(parts: string[]): { page: string; id?: string } | null {
    if (parts[0] !== "settings") return null;

    const sub = parts[1] ?? "";
    if (["product-classifications", "category", "product-category"].includes(sub)) {
      return { page: "settings-product-classifications" };
    }
    if (["product-groups", "product-group"].includes(sub)) {
      return { page: "settings-product-groups" };
    }
    if (sub === "integrations") return { page: "settings-integrations" };
    if (sub === "basic-metadata") return { page: "settings-basic-metadata" };
    if (sub === "brands") return { page: "settings-brands" };
    if (sub === "years") return { page: "settings-product-years" };
    if (sub === "seasons") return { page: "settings-product-seasons" };
    if (sub === "barcodes") return { page: "settings-barcodes" };

    return { page: "settings-integrations" };
  }
}
