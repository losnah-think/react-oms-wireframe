import { Vendor, IVendor } from '../models/Vendor';
import { mockVendors } from '../data/mockVendors';

export interface IVendorService {
  getAllVendors(): Promise<Vendor[]>;
  getVendorById(id: string): Promise<Vendor | null>;
  createVendor(vendorData: Partial<IVendor>): Promise<Vendor>;
  updateVendor(id: string, vendorData: Partial<IVendor>): Promise<Vendor>;
  deleteVendor(id: string): Promise<boolean>;
  searchVendors(query: string): Promise<Vendor[]>;
  getActiveVendors(): Promise<Vendor[]>;
  getVendorsByType(type: '판매처' | '공급처'): Promise<Vendor[]>;
}

export class VendorService implements IVendorService {
  private vendors: Vendor[] = mockVendors.map(data => new Vendor({
    id: data.id,
    name: data.name,
    type: '판매처', // mock 데이터에서는 모두 판매처로 가정
    businessNumber: `BUS-${data.id}`,
    representative: data.settings?.manager as string || '담당자',
    phone: '010-0000-0000',
    email: `contact@${data.code.toLowerCase()}.com`,
    address: '서울시 강남구',
    status: data.is_active ? 'active' : 'inactive',
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }));

  async getAllVendors(): Promise<Vendor[]> {
    await this.delay(100);
    return [...this.vendors];
  }

  async getVendorById(id: string): Promise<Vendor | null> {
    await this.delay(50);
    const vendor = this.vendors.find(v => v.id === id);
    return vendor ? new Vendor(vendor.toJSON()) : null;
  }

  async createVendor(vendorData: Partial<IVendor>): Promise<Vendor> {
    await this.delay(200);
    const newVendor = new Vendor({
      ...vendorData,
      id: `vendor-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.vendors.push(newVendor);
    return newVendor;
  }

  async updateVendor(id: string, vendorData: Partial<IVendor>): Promise<Vendor> {
    await this.delay(150);
    const index = this.vendors.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('Vendor not found');
    }

    const updatedVendor = new Vendor({
      ...this.vendors[index].toJSON(),
      ...vendorData,
      id,
      updatedAt: new Date()
    });

    this.vendors[index] = updatedVendor;
    return updatedVendor;
  }

  async deleteVendor(id: string): Promise<boolean> {
    await this.delay(100);
    const index = this.vendors.findIndex(v => v.id === id);
    if (index === -1) {
      return false;
    }
    this.vendors.splice(index, 1);
    return true;
  }

  async searchVendors(query: string): Promise<Vendor[]> {
    await this.delay(80);
    const lowercaseQuery = query.toLowerCase();
    return this.vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(lowercaseQuery) ||
      vendor.representative.toLowerCase().includes(lowercaseQuery) ||
      vendor.email.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getActiveVendors(): Promise<Vendor[]> {
    await this.delay(60);
    return this.vendors.filter(vendor => vendor.isActive());
  }

  async getVendorsByType(type: '판매처' | '공급처'): Promise<Vendor[]> {
    await this.delay(60);
    return this.vendors.filter(vendor => vendor.type === type);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 추가 유틸리티 메서드들
  getVendorNames(): string[] {
    return this.vendors.map(v => v.name);
  }

  getVendorsByStatus(status: 'active' | 'inactive'): Vendor[] {
    return this.vendors.filter(v => v.status === status);
  }

  getTotalVendorCount(): number {
    return this.vendors.length;
  }

  getActiveVendorCount(): number {
    return this.vendors.filter(v => v.isActive()).length;
  }

  getSuppliers(): Vendor[] {
    return this.vendors.filter(v => v.isSupplier());
  }

  getSellers(): Vendor[] {
    return this.vendors.filter(v => v.isSeller());
  }
}