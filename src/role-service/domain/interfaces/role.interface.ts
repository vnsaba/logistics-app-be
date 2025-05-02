import { Role } from '../entity/role';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  getAll(): Promise<Role[]>;
  findByName(name: string): Promise<Role | null>;
}
