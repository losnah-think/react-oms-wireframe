import { Category as ICategory } from '../types/database';

export type { ICategory };

export class Category implements ICategory {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public name: string;
  public nameEng?: string;
  public description?: string;
  public parentId?: string | null;
  public level: number;
  public sortOrder: number;
  public status: 'active' | 'inactive';
  public icon?: string;
  public slug?: string;
  public seoTitle?: string;
  public seoDescription?: string;

  // 런타임에서 계산되는 속성들
  private _children: Category[] = [];
  private _parent?: Category;

  constructor(data: Partial<ICategory>) {
    this.id = data.id || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.name = data.name || '';
    this.nameEng = data.nameEng;
    this.description = data.description;
    this.parentId = data.parentId;
    this.level = data.level || 1;
    this.sortOrder = data.sortOrder || 0;
    this.status = data.status || 'active';
    this.icon = data.icon;
    this.slug = data.slug;
    this.seoTitle = data.seoTitle;
    this.seoDescription = data.seoDescription;
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

  public isRoot(): boolean {
    return this.level === 1 || !this.parentId;
  }

  public isLeaf(): boolean {
    return this._children.length === 0;
  }

  public getFullPath(): string {
    if (this.isRoot()) {
      return this.name;
    }
    // 실제 구현에서는 부모 카테고리를 찾아서 전체 경로를 만들어야 함
    return this.name; // 간단한 구현
  }

  public getDisplayName(): string {
    return this.nameEng ? `${this.name} (${this.nameEng})` : this.name;
  }

  public addChild(child: Category): void {
    if (!this._children.find(c => c.id === child.id)) {
      this._children.push(child);
      child._parent = this;
    }
  }

  public removeChild(childId: string): void {
    this._children = this._children.filter(c => c.id !== childId);
  }

  public getChildren(): Category[] {
    return [...this._children];
  }

  public getParent(): Category | undefined {
    return this._parent;
  }

  public getDescendants(): Category[] {
    const descendants: Category[] = [];
    const stack = [...this._children];

    while (stack.length > 0) {
      const current = stack.pop()!;
      descendants.push(current);
      stack.push(...current._children);
    }

    return descendants;
  }

  public toJSON(): ICategory {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      nameEng: this.nameEng,
      description: this.description,
      parentId: this.parentId,
      level: this.level,
      sortOrder: this.sortOrder,
      status: this.status,
      icon: this.icon,
      slug: this.slug,
      seoTitle: this.seoTitle,
      seoDescription: this.seoDescription
    };
  }
}