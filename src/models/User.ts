export interface IUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: Date;
  lastLogin?: Date;
}

export class User implements IUser {
  public id: string;
  public username: string;
  public email: string;
  public role: 'admin' | 'manager' | 'user';
  public createdAt: Date;
  public lastLogin?: Date;

  constructor(data: Partial<IUser>) {
    this.id = data.id || '';
    this.username = data.username || '';
    this.email = data.email || '';
    this.role = data.role || 'user';
    this.createdAt = data.createdAt || new Date();
    this.lastLogin = data.lastLogin;
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
