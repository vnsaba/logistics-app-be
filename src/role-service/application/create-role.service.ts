import { Role } from '../domain/entity/role';
import { IRoleRepository } from '../domain/interfaces/role.interface';

export class CreateRoleService {

  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(data: Omit<Role, 'id'>): Promise<Role> {
    if (!data.name || !data.description) {
      throw new Error('Name and description are required');
    }

    if (data.name.length < 3) {
      throw new Error('Role name must be at least 3 characters long');
    }

    const role = await this.roleRepository.create(data);
    return role;
  }
}
