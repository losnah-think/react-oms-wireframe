// src/features/products/types/index.ts
export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  cost: number;
  stock: number;
  status: ProductStatus;
  category: string[];
  brand: string;
  image?: string;
  variants: ProductVariant[];
  metadata: ProductMetadata;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'discontinued';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  status: VariantStatus;
  barcode?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export type VariantStatus = 'active' | 'inactive' | 'out_of_stock';

export interface ProductMetadata {
  season: string;
  year: string;
  designer: string;
  supplier: string;
  registrant: string;
  tags: string[];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  status?: ProductStatus;
  supplier?: string;
  designer?: string;
  registrant?: string;
  year?: string;
  season?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
}

export interface ProductSort {
  field: keyof Product;
  direction: 'asc' | 'desc';
}

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
  discontinued: number;
  totalValue: number;
  lowStock: number;
}

export interface ImportProduct {
  name: string;
  code: string;
  price: number;
  cost: number;
  category: string[];
  brand: string;
  variants: Omit<ProductVariant, 'id' | 'createdAt' | 'updatedAt'>[];
  metadata: ProductMetadata;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface CreateProductData {
  name: string;
  code: string;
  price: number;
  cost: number;
  category: string[];
  brand: string;
  variants: Omit<ProductVariant, 'id' | 'createdAt' | 'updatedAt'>[];
  metadata: ProductMetadata;
}

export interface UpdateProductData {
  name?: string;
  code?: string;
  price?: number;
  cost?: number;
  category?: string[];
  brand?: string;
  status?: ProductStatus;
  variants?: ProductVariant[];
  metadata?: Partial<ProductMetadata>;
}

export interface ProductFormData {
  name: string;
  code: string;
  price: string;
  cost: string;
  category: string[];
  brand: string;
  season: string;
  year: string;
  designer: string;
  supplier: string;
  registrant: string;
  tags: string[];
  variants: ProductVariantFormData[];
}

export interface ProductVariantFormData {
  name: string;
  sku: string;
  price: string;
  cost: string;
  stock: string;
  barcode: string;
  location: string;
}

export interface ProductTableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  render?: (value: any, record: Product) => React.ReactNode;
}

export interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onView?: (product: Product) => void;
}

export interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

export interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
}

// 옵션 관련 타입들
export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  status: VariantStatus;
  barcode?: string;
  location?: string;
  attributes: OptionAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface OptionAttribute {
  name: string;
  value: string;
}

export interface OptionFormData {
  name: string;
  sku: string;
  price: string;
  cost: string;
  stock: string;
  barcode: string;
  location: string;
  attributes: OptionAttribute[];
}

export interface OptionEditPageProps {
  productId: string;
  optionId?: string;
  mode: 'create' | 'edit';
  onSave: (data: OptionFormData) => Promise<void>;
  onCancel: () => void;
}

export interface OptionBulkEditProps {
  productId: string;
  options: ProductOption[];
  onSave: (updates: Partial<ProductOption>[]) => Promise<void>;
  onCancel: () => void;
}
