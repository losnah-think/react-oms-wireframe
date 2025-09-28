// Router import
import { Router } from './Router';

// NavigationService 클래스 - 네비게이션 서비스 관리
export class NavigationService {
  private static instance: NavigationService;
  private router: any;

  private constructor() {}

  public static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  public setRouter(router: any): void {
    this.router = router;
  }

  public navigateTo(page: string, productId?: string): void {
    const routerInstance = Router.getInstance();
    const basePath = routerInstance.getPath(page);
    const target = page === "products-detail" && productId
      ? `${basePath}/${productId}`
      : basePath;

    if (typeof window !== "undefined" && window.history?.pushState) {
      window.history.pushState({}, "", target);
    }

    if (this.router) {
      this.router.push(this.router.pathname, target, { shallow: true }).catch(() => {});
    }
  }
}