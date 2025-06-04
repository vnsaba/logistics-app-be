import { Role } from '../../domain/entity/role';
import { Permission } from '../../domain/entity/permission';
import { prismaMongo } from "../../../db-instances";
import { IRoleRepository } from '../../domain/interfaces/role.interface';

export class RoleRepository implements IRoleRepository {
  async findById(id: string): Promise<Role | null> {
    return await prismaMongo.role.findUnique({ where: { id } });
  }

  async getAll(): Promise<Role[]> {
    return await prismaMongo.role.findMany();
  }

  async findByName(name: string): Promise<Role | null> {
    return await prismaMongo.role.findUnique({ where: { name } });
  }

  async create(data: { name: string; description: string }): Promise<Role> {
    return await prismaMongo.role.create({ data });
  }

  async update(id: string, data: { name?: string; description?: string }): Promise<Role> {
    return await prismaMongo.role.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prismaMongo.role.delete({ where: { id } });
  }

  // 🟢 Agregar un permiso a un rol
  async addPermission(roleId: string, permission: Permission): Promise<Role> {
    return await prismaMongo.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          push: permission, // MongoDB-style array push
        },
      },
    });
  }

  // 🔴 Eliminar un permiso de un rol por su ID
  async removePermission(roleId: string, permissionId: string): Promise<Role> {
    const role = await prismaMongo.role.findUnique({ where: { id: roleId } });

    if (!role) throw new Error('Role not found');

    const updatedPermissions = role.permissions.filter(p => p.id !== permissionId);

    return await prismaMongo.role.update({
      where: { id: roleId },
      data: {
        permissions: updatedPermissions,
      },
    });
  }

  // 📄 Obtener los permisos de un rol
  async getPermissions(roleId: string): Promise<Permission[]> {
    const role = await prismaMongo.role.findUnique({ where: { id: roleId } });
    if (!role) throw new Error('Role not found');
    return role.permissions || [];
  }
}
