import { Role } from '../domain/entity/role';
import { IRoleRepository } from '../domain/interfaces/role.interface';

export class UpdateRoleService {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string, updates: Partial<Role>): Promise<Role | null> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) return null;

    const updated = await this.roleRepository.update(id, updates);
    return updated;
  }
}
