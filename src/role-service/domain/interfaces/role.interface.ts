import { Role } from '../entity/role';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  getAll(): Promise<Role[]>;
  findByName(name: string): Promise<Role | null>;
  create(role: Omit<Role, 'id'>): Promise<Role>;
  update(id: string, updates: Partial<Role>): Promise<Role>;
  delete(id: string): Promise<void>;
}
