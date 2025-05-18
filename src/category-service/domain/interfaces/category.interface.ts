import { Category } from '../entity/category';

export interface ICategoryRepository {
  findById(id: number): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  create(category: Category): Promise<Category>;
  update(id: number, data: Partial<Category>): Promise<Category>;
  delete(id: number): Promise<void>;
  findAll(): Promise<Category[]>;
}
