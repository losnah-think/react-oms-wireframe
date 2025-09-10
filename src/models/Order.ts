import { Order as IOrder, OrderItem as IOrderItem, OrderStatus } from '../types/database';

// 기존 타입들을 database.ts에서 import
export type { IOrder, IOrderItem };
export { OrderStatus };

export class Order implements IOrder {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public orderNumber: string;
  public customerId?: string;
  public customerName: string;
  public customerPhone?: string;
  public customerEmail?: string;
  public items: IOrderItem[];
  public totalAmount: number;
  public status: OrderStatus;
  public shippingAddress?: string;
  public shippingMethod?: string;
  public trackingNumber?: string;
  public paymentMethod?: string;
  public paymentStatus?: 'pending' | 'paid' | 'cancelled' | 'refunded';
  public notes?: string;
  public mallId?: string;

  constructor(data: Partial<IOrder>) {
    this.id = data.id || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.orderNumber = data.orderNumber || this.generateOrderNumber();
    this.customerId = data.customerId;
    this.customerName = data.customerName || '';
    this.customerPhone = data.customerPhone;
    this.customerEmail = data.customerEmail;
    this.items = data.items || [];
    this.totalAmount = data.totalAmount || 0;
    this.status = data.status || OrderStatus.PENDING;
    this.shippingAddress = data.shippingAddress;
    this.shippingMethod = data.shippingMethod;
    this.trackingNumber = data.trackingNumber;
    this.paymentMethod = data.paymentMethod;
    this.paymentStatus = data.paymentStatus || 'pending';
    this.notes = data.notes;
    this.mallId = data.mallId;
    
    if (this.totalAmount === 0) {
      this.calculateTotal();
    }
  }

  private generateOrderNumber(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `ORD-${dateStr}-${randomStr}`;
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
