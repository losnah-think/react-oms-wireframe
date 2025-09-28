import { Router } from '../lib/Router';

// Window 인터페이스 확장
declare global {
  interface Window {
    appController?: {
      setCurrentPage: (page: string) => void;
      setSelectedProductId: (id: string) => void;
    };
    nextRouter?: {
      push: (pathname: string, as?: string, options?: any) => Promise<boolean>;
      pathname: string;
    };
  }
}

export interface NavigationOptions {
  page: string;
  productId?: string;
}

export class NavigationService {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  public navigate(options: NavigationOptions): void {
    const { page, productId } = options;
    this.updateAppState(page, productId);
    this.updateBrowserHistory(page, productId);
  }

  private updateAppState(page: string, productId?: string): void {
    // 이 부분은 AppController에서 처리
    if (window.appController) {
      window.appController.setCurrentPage(page);
      if (productId) {
        window.appController.setSelectedProductId(productId);
      }
    }
  }

  private updateBrowserHistory(page: string, productId?: string): void {
    try {
      const basePath = this.router.getPath(page);
      const target = page === "products-detail" && productId
        ? `${basePath}/${productId}`
        : basePath;

      if (typeof window !== "undefined" && window.history?.pushState) {
        window.history.pushState({}, "", target);
      }

      // Next.js router 동기화
      if (window.nextRouter) {
        window.nextRouter.push(window.nextRouter.pathname, target, { shallow: true }).catch(() => {});
      }
    } catch (e) {
      // ignore
    }
  }

  public static initializeGlobalNavigation(router: Router): NavigationService {
    const service = new NavigationService(router);

    // 전역 네비게이션 함수 설정
    (window as any).navigateTo = (page: string, productId?: string) => {
      service.navigate({ page, productId });
    };

    return service;
  }
}