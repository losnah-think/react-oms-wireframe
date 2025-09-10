export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface IOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder {
  id: string;
  customerId: string;
  customerName: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress?: string;
  notes?: string;
}

export class Order implements IOrder {
  public id: string;
  public customerId: string;
  public customerName: string;
  public items: IOrderItem[];
  public totalAmount: number;
  public status: OrderStatus;
  public createdAt: Date;
  public updatedAt: Date;
  public shippingAddress?: string;
  public notes?: string;

  constructor(data: Partial<IOrder>) {
    this.id = data.id || '';
    this.customerId = data.customerId || '';
    this.customerName = data.customerName || '';
    this.items = data.items || [];
    this.totalAmount = data.totalAmount || 0;
    this.status = data.status || OrderStatus.PENDING;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.shippingAddress = data.shippingAddress;
    this.notes = data.notes;
  }

  public addItem(item: IOrderItem): void {
    const existingItemIndex = this.items.findIndex(i => i.productId === item.productId);
    
    if (existingItemIndex >= 0) {
      this.items[existingItemIndex].quantity += item.quantity;
      this.items[existingItemIndex].totalPrice = 
        this.items[existingItemIndex].quantity * this.items[existingItemIndex].unitPrice;
    } else {
      this.items.push(item);
    }
    
    this.calculateTotal();
    this.updatedAt = new Date();
  }

  public removeItem(productId: string): void {
    this.items = this.items.filter(item => item.productId !== productId);
    this.calculateTotal();
    this.updatedAt = new Date();
  }

  public updateStatus(status: OrderStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  private calculateTotal(): void {
    this.totalAmount = this.items.reduce((total, item) => total + item.totalPrice, 0);
  }

  public getFormattedTotal(): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(this.totalAmount);
  }

  public getStatusBadgeColor(): string {
    switch (this.status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PROCESSING:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.SHIPPED:
        return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
