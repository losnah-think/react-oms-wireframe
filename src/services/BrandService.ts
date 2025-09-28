import { Brand, IBrand } from '../models/Brand';
import { mockBrands } from '../data/mockBrands';

export interface IBrandService {
  getAllBrands(): Promise<Brand[]>;
  getBrandById(id: string): Promise<Brand | null>;
  createBrand(brandData: Partial<IBrand>): Promise<Brand>;
  updateBrand(id: string, brandData: Partial<IBrand>): Promise<Brand>;
  deleteBrand(id: string): Promise<boolean>;
  searchBrands(query: string): Promise<Brand[]>;
  getActiveBrands(): Promise<Brand[]>;
}

export class BrandService implements IBrandService {
  private brands: Brand[] = mockBrands.map(data => new Brand(data));

  async getAllBrands(): Promise<Brand[]> {
    await this.delay(100);
    return [...this.brands];
  }

  async getBrandById(id: string): Promise<Brand | null> {
    await this.delay(50);
    const brand = this.brands.find(b => b.id === id);
    return brand ? new Brand(brand.toJSON()) : null;
  }

  async createBrand(brandData: Partial<IBrand>): Promise<Brand> {
    await this.delay(200);
    const newBrand = new Brand({
      ...brandData,
      id: `brand-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.brands.push(newBrand);
    return newBrand;
  }

  async updateBrand(id: string, brandData: Partial<IBrand>): Promise<Brand> {
    await this.delay(150);
    const index = this.brands.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Brand not found');
    }

    const updatedBrand = new Brand({
      ...this.brands[index].toJSON(),
      ...brandData,
      id,
      updatedAt: new Date()
    });

    this.brands[index] = updatedBrand;
    return updatedBrand;
  }

  async deleteBrand(id: string): Promise<boolean> {
    await this.delay(100);
    const index = this.brands.findIndex(b => b.id === id);
    if (index === -1) {
      return false;
    }
    this.brands.splice(index, 1);
    return true;
  }

  async searchBrands(query: string): Promise<Brand[]> {
    await this.delay(80);
    const lowercaseQuery = query.toLowerCase();
    return this.brands.filter(brand =>
      brand.name.toLowerCase().includes(lowercaseQuery) ||
      (brand.nameEng && brand.nameEng.toLowerCase().includes(lowercaseQuery)) ||
      (brand.description && brand.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getActiveBrands(): Promise<Brand[]> {
    await this.delay(60);
    return this.brands.filter(brand => brand.isActive());
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 추가 유틸리티 메서드들
  getBrandNames(): string[] {
    return this.brands.map(b => b.name);
  }

  getBrandsByStatus(status: 'active' | 'inactive'): Brand[] {
    return this.brands.filter(b => b.status === status);
  }

  getTotalBrandCount(): number {
    return this.brands.length;
  }

  getActiveBrandCount(): number {
    return this.brands.filter(b => b.isActive()).length;
  }
}