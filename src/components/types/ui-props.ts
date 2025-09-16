export interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string; // ISO date
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  shipping: {
    address: string;
    company?: string;
    trackingNumber?: string;
  };
  items: OrderItem[];
  status: OrderSummary['status'];
  totalAmount: number;
  events?: Array<{ id: string; type: string; message: string; createdAt: string }>;
}

export interface ProductSummary {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  optionValues: Record<string, string>;
  stock: number;
}

export interface ProductDetail {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  barcode?: string;
  images?: string[];
  variants?: ProductVariant[];
  categories?: string[];
  brand?: string;
  dimensions?: { width?: number; height?: number; depth?: number; weight?: number };
}

export interface MallInfo {
  id: string;
  name: string;
  connected: boolean;
  lastSync?: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

// Props for common components
export interface OrderTableProps {
  orders: OrderSummary[];
  total: number;
  loading?: boolean;
  onSelect?: (ids: string[]) => void;
  onRowClick?: (id: string) => void;
}

export interface ProductTableProps {
  products: ProductSummary[];
  total: number;
  loading?: boolean;
  onRowClick?: (id: string) => void;
}

export interface UserListProps {
  users: UserInfo[];
  total: number;
  loading?: boolean;
  onEdit?: (id: string) => void;
}
