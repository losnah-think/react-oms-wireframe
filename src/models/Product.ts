export interface IProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Product implements IProduct {
  public id: string;
  public name: string;
  public price: number;
  public stock: number;
  public category: string;
  public description?: string;
  public imageUrl?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<IProduct>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.price = data.price || 0;
    this.stock = data.stock || 0;
    this.category = data.category || '';
    this.description = data.description;
    this.imageUrl = data.imageUrl;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  public isInStock(): boolean {
    return this.stock > 0;
  }

  public getFormattedPrice(): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(this.price);
  }

  public updateStock(quantity: number): void {
    this.stock = Math.max(0, this.stock + quantity);
    this.updatedAt = new Date();
  }

  public toJSON(): IProduct {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      stock: this.stock,
      category: this.category,
      description: this.description,
      imageUrl: this.imageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
