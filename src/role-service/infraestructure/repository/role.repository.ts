import { Role } from '../../domain/entity/role';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { IRoleRepository } from '../../domain/interfaces/user.interface';

export class RoleRepository implements IRoleRepository {
  async findById(id: string): Promise<Role | null> {
    const user = await prisma.role.findUnique({ where: { id } });
    return user;
  }

  async getAll(): Promise<Role[]> {
    const roles = await prisma.role.findMany();

    return roles;
  }
}
