import { Vendor as IVendor } from '../types/database';

export type { IVendor };

export class Vendor implements IVendor {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public name: string;
  public type: '판매처' | '공급처';
  public businessNumber: string;
  public representative: string;
  public phone: string;
  public email: string;
  public address: string;
  public status: 'active' | 'inactive';

  // API 연동 정보
  public apiKey?: string;
  public password?: string;
  public apiUrl?: string;

  public lastLoginDate?: Date;

  constructor(data: Partial<IVendor>) {
    this.id = data.id || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.name = data.name || '';
    this.type = data.type || '공급처';
    this.businessNumber = data.businessNumber || '';
    this.representative = data.representative || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.address = data.address || '';
    this.status = data.status || 'active';
    this.apiKey = data.apiKey;
    this.password = data.password;
    this.apiUrl = data.apiUrl;
    this.lastLoginDate = data.lastLoginDate;
  }

  public updateContactInfo(phone: string, email: string): void {
    this.phone = phone;
    this.email = email;
    this.updatedAt = new Date();
  }

  public updateStatus(status: 'active' | 'inactive'): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public updateApiCredentials(apiKey?: string, password?: string, apiUrl?: string): void {
    this.apiKey = apiKey;
    this.password = password;
    this.apiUrl = apiUrl;
    this.updatedAt = new Date();
  }

  public isActive(): boolean {
    return this.status === 'active';
  }

  public isSupplier(): boolean {
    return this.type === '공급처';
  }

  public isSeller(): boolean {
    return this.type === '판매처';
  }

  public updateLastLogin(): void {
    this.lastLoginDate = new Date();
  }

  public getDisplayName(): string {
    return `${this.name} (${this.type})`;
  }

  public getContactInfo(): { phone: string; email: string; representative: string } {
    return {
      phone: this.phone,
      email: this.email,
      representative: this.representative
    };
  }

  public toJSON(): IVendor {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      type: this.type,
      businessNumber: this.businessNumber,
      representative: this.representative,
      phone: this.phone,
      email: this.email,
      address: this.address,
      status: this.status,
      apiKey: this.apiKey,
      password: this.password,
      apiUrl: this.apiUrl,
      lastLoginDate: this.lastLoginDate
    };
  }
}