// Repository 패턴 - 데이터 액세스 추상화
export interface IRepository<T, TKey = string> {
  getAll(): Promise<T[]>;
  getById(id: TKey): Promise<T | null>;
  create(entity: Partial<T>): Promise<T>;
  update(id: TKey, entity: Partial<T>): Promise<T>;
  delete(id: TKey): Promise<boolean>;
  exists(id: TKey): Promise<boolean>;
}

// 제네릭 Repository 구현
export abstract class BaseRepository<T extends { id: string }, TKey = string> implements IRepository<T, TKey> {
  protected entities: T[] = [];

  async getAll(): Promise<T[]> {
    await this.delay(50);
    return [...this.entities];
  }

  async getById(id: TKey): Promise<T | null> {
    await this.delay(30);
    const entity = this.entities.find(e => e.id === id);
    return entity ? { ...entity } : null;
  }

  async create(entity: Partial<T>): Promise<T> {
    await this.delay(100);
    const newEntity = {
      ...entity,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as T;

    this.entities.push(newEntity);
    return { ...newEntity };
  }

  async update(id: TKey, entity: Partial<T>): Promise<T> {
    await this.delay(80);
    const index = this.entities.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Entity not found');
    }

    const updatedEntity = {
      ...this.entities[index],
      ...entity,
      id,
      updatedAt: new Date()
    } as T;

    this.entities[index] = updatedEntity;
    return { ...updatedEntity };
  }

  async delete(id: TKey): Promise<boolean> {
    await this.delay(60);
    const index = this.entities.findIndex(e => e.id === id);
    if (index === -1) {
      return false;
    }
    this.entities.splice(index, 1);
    return true;
  }

  async exists(id: TKey): Promise<boolean> {
    await this.delay(20);
    return this.entities.some(e => e.id === id);
  }

  protected abstract generateId(): string;

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Unit of Work 패턴 - 트랜잭션 관리
export interface IUnitOfWork {
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  dispose(): void;
}

export class UnitOfWork implements IUnitOfWork {
  private inTransaction: boolean = false;
  private repositories: Map<string, any> = new Map();

  async beginTransaction(): Promise<void> {
    if (this.inTransaction) {
      throw new Error('Transaction already in progress');
    }
    this.inTransaction = true;
    console.log('Transaction started');
  }

  async commit(): Promise<void> {
    if (!this.inTransaction) {
      throw new Error('No active transaction');
    }
    // 실제로는 여기서 모든 변경사항을 커밋
    console.log('Transaction committed');
    this.inTransaction = false;
  }

  async rollback(): Promise<void> {
    if (!this.inTransaction) {
      throw new Error('No active transaction');
    }
    // 실제로는 여기서 모든 변경사항을 롤백
    console.log('Transaction rolled back');
    this.inTransaction = false;
  }

  dispose(): void {
    this.repositories.clear();
    this.inTransaction = false;
  }

  registerRepository<T>(name: string, repository: IRepository<T>): void {
    this.repositories.set(name, repository);
  }

  getRepository<T>(name: string): IRepository<T> | undefined {
    return this.repositories.get(name);
  }
}