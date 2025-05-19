import { Role } from '../domain/entity/role';
import { Permission } from '../domain/entity/permission';
import { IRoleRepository } from '../domain/interfaces/role.interface';

export class RoleService {
    constructor(private readonly roleRepository: IRoleRepository) { }

    async delete(id: string): Promise<boolean> {
        const existing = await this.roleRepository.findById(id);
        if (!existing) return false;

        await this.roleRepository.delete(id);
        return true;
    }

    async create(data: Omit<Role, 'id'>): Promise<Role> {
        if (!data.name || !data.description) {
            throw new Error('Name and description are required');
        }

        if (data.name.length < 3) {
            throw new Error('Role name must be at least 3 characters long');
        }

        // Verificación simple de permisos embebidos
        const permissions = data.permissions ?? [];

        const role = await this.roleRepository.create({
            ...data,
            permissions,
        });

        return role;
    }

    async update(id: string, updates: Partial<Role>): Promise<Role | null> {
        const existing = await this.roleRepository.findById(id);
        if (!existing) return null;

        const updated = await this.roleRepository.update(id, updates);
        return updated;
    }

    async addPermission(roleId: string, permission: Permission): Promise<Role | null> {
        const role = await this.roleRepository.findById(roleId);
        if (!role) return null;

        const exists = role.permissions.some(
            (p) => p.name === permission.name && p.resource === permission.resource && p.action === permission.action
        );

        if (!exists) {
            role.permissions.push(permission);
            return await this.roleRepository.update(roleId, { permissions: role.permissions });
        }

        return role;
    }

    async removePermission(roleId: string, permissionName: string): Promise<Role | null> {
        const role = await this.roleRepository.findById(roleId);
        if (!role) return null;

        const updatedPermissions = role.permissions.filter(
            (p) => p.name !== permissionName
        );

        return await this.roleRepository.update(roleId, { permissions: updatedPermissions });
    }

    async addPermissions(id: string, permissions: Permission[]): Promise<Role | null> {
        const role = await this.roleRepository.findById(id);
        if (!role) return null;

        const updatedPermissions = [...(role.permissions || []), ...permissions];
        return await this.roleRepository.update(id, { permissions: updatedPermissions });
    }

    async removePermissions(id: string, permissionNames: string[]): Promise<Role | null> {
        const role = await this.roleRepository.findById(id);
        if (!role) return null;

        const updatedPermissions = (role.permissions || []).filter(
            p => !permissionNames.includes(p.name)
        );
        return await this.roleRepository.update(id, { permissions: updatedPermissions });
    }

}
