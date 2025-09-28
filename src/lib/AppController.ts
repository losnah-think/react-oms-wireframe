// AppController 클래스 - 애플리케이션 상태 관리
export class AppController {
  private static instance: AppController;
  private currentPage: string = "dashboard";
  private selectedProductId: string = "";
  private navigationService: any;

  private constructor() {}

  public static getInstance(): AppController {
    if (!AppController.instance) {
      AppController.instance = new AppController();
    }
    return AppController.instance;
  }

  public setNavigationService(navigationService: any): void {
    this.navigationService = navigationService;
  }

  public getCurrentPage(): string {
    return this.currentPage;
  }

  public getSelectedProductId(): string {
    return this.selectedProductId;
  }

  public navigateTo(page: string, productId?: string): void {
    this.currentPage = page;
    this.selectedProductId = productId || "";
    if (this.navigationService) {
      this.navigationService.navigateTo(page, productId);
    }
  }

  public initialize(): void {
    // 초기화 로직
    this.currentPage = "dashboard";
    this.selectedProductId = "";
  }

  public reset(): void {
    this.currentPage = "dashboard";
    this.selectedProductId = "";
  }
}