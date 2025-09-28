import { Category, ICategory } from '../models/Category';
import { mockCategories } from '../data/mockCategories';

export interface ICategoryService {
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  createCategory(categoryData: Partial<ICategory>): Promise<Category>;
  updateCategory(id: string, categoryData: Partial<ICategory>): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
  searchCategories(query: string): Promise<Category[]>;
  getActiveCategories(): Promise<Category[]>;
  getCategoriesByParent(parentId: string | null): Promise<Category[]>;
  buildCategoryTree(): Promise<Category[]>;
}

export class CategoryService implements ICategoryService {
  private categories: Category[] = mockCategories.map(data => new Category({
    ...data,
    level: 1,
    sortOrder: parseInt(data.id.split('-')[1]) || 0
  }));

  async getAllCategories(): Promise<Category[]> {
    await this.delay(100);
    return [...this.categories];
  }

  async getCategoryById(id: string): Promise<Category | null> {
    await this.delay(50);
    const category = this.categories.find(c => c.id === id);
    return category ? new Category(category.toJSON()) : null;
  }

  async createCategory(categoryData: Partial<ICategory>): Promise<Category> {
    await this.delay(200);
    const newCategory = new Category({
      ...categoryData,
      id: `cat-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: string, categoryData: Partial<ICategory>): Promise<Category> {
    await this.delay(150);
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }

    const updatedCategory = new Category({
      ...this.categories[index].toJSON(),
      ...categoryData,
      id,
      updatedAt: new Date()
    });

    this.categories[index] = updatedCategory;
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.delay(100);
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      return false;
    }
    this.categories.splice(index, 1);
    return true;
  }

  async searchCategories(query: string): Promise<Category[]> {
    await this.delay(80);
    const lowercaseQuery = query.toLowerCase();
    return this.categories.filter(category =>
      category.name.toLowerCase().includes(lowercaseQuery) ||
      (category.nameEng && category.nameEng.toLowerCase().includes(lowercaseQuery)) ||
      (category.description && category.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getActiveCategories(): Promise<Category[]> {
    await this.delay(60);
    return this.categories.filter(category => category.isActive());
  }

  async getCategoriesByParent(parentId: string | null): Promise<Category[]> {
    await this.delay(60);
    return this.categories.filter(category => category.parentId === parentId);
  }

  async buildCategoryTree(): Promise<Category[]> {
    await this.delay(120);
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // 모든 카테고리를 맵에 저장
    this.categories.forEach(cat => {
      categoryMap.set(cat.id, new Category(cat.toJSON()));
    });

    // 부모-자식 관계 구축
    this.categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.addChild(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 추가 유틸리티 메서드들
  getCategoryNames(): string[] {
    return this.categories.map(c => c.name);
  }

  getCategoriesByLevel(level: number): Category[] {
    return this.categories.filter(c => c.level === level);
  }

  getRootCategories(): Category[] {
    return this.categories.filter(c => c.isRoot());
  }

  getLeafCategories(): Category[] {
    return this.categories.filter(c => c.isLeaf());
  }

  getTotalCategoryCount(): number {
    return this.categories.length;
  }

  getActiveCategoryCount(): number {
    return this.categories.filter(c => c.isActive()).length;
  }
}