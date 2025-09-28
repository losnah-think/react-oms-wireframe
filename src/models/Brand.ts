import { Brand as IBrand } from '../types/database';

export type { IBrand };

export class Brand implements IBrand {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public name: string;
  public nameEng?: string;
  public description?: string;
  public logo?: string;
  public website?: string;
  public status: 'active' | 'inactive';

  constructor(data: Partial<IBrand>) {
    this.id = data.id || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.name = data.name || '';
    this.nameEng = data.nameEng;
    this.description = data.description;
    this.logo = data.logo;
    this.website = data.website;
    this.status = data.status || 'active';
  }

  public updateName(newName: string): void {
    this.name = newName;
    this.updatedAt = new Date();
  }

  public updateStatus(status: 'active' | 'inactive'): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public isActive(): boolean {
    return this.status === 'active';
  }

  public getDisplayName(): string {
    return this.nameEng ? `${this.name} (${this.nameEng})` : this.name;
  }

  public toJSON(): IBrand {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      nameEng: this.nameEng,
      description: this.description,
      logo: this.logo,
      website: this.website,
      status: this.status
    };
  }
}