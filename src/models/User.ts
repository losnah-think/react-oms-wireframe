import { User as IUser } from '../types/database';

export type { IUser };

export class User implements IUser {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public username: string;
  public email: string;
  public role: 'admin' | 'manager' | 'user';
  public lastLogin?: Date;
  public isActive: boolean;

  constructor(data: Partial<IUser>) {
    this.id = data.id || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.username = data.username || '';
    this.email = data.email || '';
    this.role = data.role || 'user';
    this.lastLogin = data.lastLogin;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  public isAdmin(): boolean {
    return this.role === 'admin';
  }

  public isManager(): boolean {
    return this.role === 'manager';
  }

  public canManageOrders(): boolean {
    return this.role === 'admin' || this.role === 'manager';
  }

  public updateLastLogin(): void {
    this.lastLogin = new Date();
  }
}
