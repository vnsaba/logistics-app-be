import { IRoleRepository } from '../domain/interfaces/role.interface';

export class DeleteRoleService {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<boolean> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) return false;

    await this.roleRepository.delete(id);
    return true;
  }
}
