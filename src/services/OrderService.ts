import { Order, IOrder, OrderStatus } from '../models/Order';

export interface IOrderService {
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(orderData: Partial<IOrder>): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;
  getOrdersByStatus(status: OrderStatus): Promise<Order[]>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  searchOrders(query: string): Promise<Order[]>;
}

export class OrderService implements IOrderService {
  private orders: Order[] = [
    new Order({
      id: '1',
      customerId: 'cust-001',
      customerName: '김철수',
      items: [
        {
          productId: '1',
          productName: '스마트폰 케이스',
          quantity: 2,
          unitPrice: 25000,
          totalPrice: 50000
        },
        {
          productId: '2',
          productName: '무선 이어폰',
          quantity: 1,
          unitPrice: 89000,
          totalPrice: 89000
        }
      ],
      totalAmount: 139000,
      status: OrderStatus.CONFIRMED,
      shippingAddress: '서울시 강남구 테헤란로 123',
      createdAt: new Date('2024-01-15')
    }),
    new Order({
      id: '2',
      customerId: 'cust-002',
      customerName: '박영희',
      items: [
        {
          productId: '3',
          productName: '노트북 스탠드',
          quantity: 1,
          unitPrice: 45000,
          totalPrice: 45000
        }
      ],
      totalAmount: 45000,
      status: OrderStatus.PENDING,
      shippingAddress: '부산시 해운대구 센텀시티 456',
      createdAt: new Date('2024-01-16')
    }),
    new Order({
      id: '3',
      customerId: 'cust-003',
      customerName: '이민수',
      items: [
        {
          productId: '4',
          productName: '마우스 패드',
          quantity: 3,
          unitPrice: 15000,
          totalPrice: 45000
        }
      ],
      totalAmount: 45000,
      status: OrderStatus.SHIPPED,
      shippingAddress: '대구시 중구 동성로 789',
      createdAt: new Date('2024-01-14')
    })
  ];

  async getAllOrders(): Promise<Order[]> {
    await this.delay(100);
    return [...this.orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getOrderById(id: string): Promise<Order | null> {
    await this.delay(50);
    const order = this.orders.find(o => o.id === id);
    return order ? new Order(order) : null;
  }

  async createOrder(orderData: Partial<IOrder>): Promise<Order> {
    await this.delay(200);
    const newOrder = new Order({
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.orders.push(newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.delay(150);
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }
    order.updateStatus(status);
    return order;
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    await this.delay(80);
    return this.orders.filter(order => order.status === status);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    await this.delay(60);
    return this.orders.filter(order => order.customerId === customerId);
  }

  async searchOrders(query: string): Promise<Order[]> {
    await this.delay(80);
    const lowercaseQuery = query.toLowerCase();
    return this.orders.filter(order => 
      order.id.toLowerCase().includes(lowercaseQuery) ||
      order.customerName.toLowerCase().includes(lowercaseQuery) ||
      order.customerId.toLowerCase().includes(lowercaseQuery)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Additional utility methods
  getTotalRevenue(): number {
    return this.orders
      .filter(order => order.status === OrderStatus.DELIVERED)
      .reduce((total, order) => total + order.totalAmount, 0);
  }

  getPendingOrdersCount(): number {
    return this.orders.filter(order => order.status === OrderStatus.PENDING).length;
  }

  getOrdersCountByStatus(): Record<OrderStatus, number> {
    const statusCounts = {} as Record<OrderStatus, number>;
    
    Object.values(OrderStatus).forEach(status => {
      statusCounts[status] = this.orders.filter(order => order.status === status).length;
    });
    
    return statusCounts;
  }

  getAverageOrderValue(): number {
    if (this.orders.length === 0) return 0;
    const total = this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    return total / this.orders.length;
  }
}
