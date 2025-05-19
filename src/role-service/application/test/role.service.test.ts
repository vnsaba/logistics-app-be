import { RoleService } from '../../application/role.service';
import { IRoleRepository } from '../../domain/interfaces/role.interface';
import { Role } from '../../domain/entity/role';
import { Permission } from '../../domain/entity/permission';

const mockRepository: jest.Mocked<IRoleRepository> = {
    findById: jest.fn(),
    getAll: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

// const roleService = new RoleService(mockRepo);
let roleService: RoleService;

beforeEach(() => {
    jest.clearAllMocks();
    roleService = new RoleService(mockRepository);
});

const mockRole: Role = {
    id: 'role-1',
    name: 'ADMIN',
    description: 'Administrador',
    permissions: [
        { id: 'perm-1', name: 'READ_USER', resource: 'user', action: 'read' }
    ]
};

describe('RoleService - Permisos', () => {
    // const mockRole: Role = {
    //     id: 'role-1',
    //     name: 'ADMIN',
    //     description: 'Administrador',
    //     permissions: [
    //         { id: 'perm-1', name: 'READ_USER', resource: 'user', action: 'read' }
    //     ]
    // };

    const newPermissions: Permission[] = [
        { id: 'perm-2', name: 'WRITE_USER', resource: 'user', action: 'write' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('addPermissions debe agregar permisos nuevos a un rol existente', async () => {
        mockRepository.findById.mockResolvedValueOnce(mockRole);
        mockRepository.update.mockResolvedValueOnce({
            ...mockRole,
            permissions: [...mockRole.permissions, ...newPermissions]
        });

        const updated = await roleService.addPermissions('role-1', newPermissions);

        expect(mockRepository.findById).toHaveBeenCalledWith('role-1');
        expect(mockRepository.update).toHaveBeenCalledWith('role-1', {
            permissions: [...mockRole.permissions, ...newPermissions]
        });
        expect(updated?.permissions.length).toBe(2);
    });

    test('removePermissions debe quitar permisos por nombre de un rol existente', async () => {
        mockRepository.findById.mockResolvedValueOnce({
            ...mockRole,
            permissions: [...mockRole.permissions, ...newPermissions]
        });

        mockRepository.update.mockResolvedValueOnce({
            ...mockRole,
            permissions: mockRole.permissions // solo deja el primero
        });

        const updated = await roleService.removePermissions('role-1', ['WRITE_USER']);

        expect(mockRepository.findById).toHaveBeenCalledWith('role-1');
        expect(mockRepository.update).toHaveBeenCalledWith('role-1', {
            permissions: mockRole.permissions
        });
        expect(updated?.permissions.length).toBe(1);
        expect(updated?.permissions[0].name).toBe('READ_USER');
    });

    test('addPermissions debe retornar null si el rol no existe', async () => {
        mockRepository.findById.mockResolvedValueOnce(null);
        const result = await roleService.addPermissions('no-role', newPermissions);
        expect(result).toBeNull();
    });

    test('removePermissions debe retornar null si el rol no existe', async () => {
        mockRepository.findById.mockResolvedValueOnce(null);
        const result = await roleService.removePermissions('no-role', ['READ_USER']);
        expect(result).toBeNull();
    });
});
describe('RoleService - create', () => {
    it('debería crear un rol con datos válidos', async () => {
        const input = { name: 'ADMIN', description: 'Admin role', permissions: [] };
        const createdRole = { ...input, id: 'new-id' };
        mockRepository.create.mockResolvedValueOnce(createdRole);

        const result = await roleService.create(input);

        expect(mockRepository.create).toHaveBeenCalledWith(input);
        expect(result).toEqual(createdRole);
    });

    it('debería lanzar error si faltan datos', async () => {
        await expect(roleService.create({ name: '', description: '', permissions: [] }))
            .rejects
            .toThrow('Name and description are required');
    });

    it('debería lanzar error si el nombre es muy corto', async () => {
        await expect(roleService.create({ name: 'ad', description: '...', permissions: [] }))
            .rejects
            .toThrow('Role name must be at least 3 characters long');
    });
});

describe('RoleService - update', () => {
    it('debería actualizar un rol existente', async () => {
        const updates = { name: 'NEW_NAME' };
        mockRepository.findById.mockResolvedValueOnce(mockRole);
        mockRepository.update.mockResolvedValueOnce({ ...mockRole, ...updates });

        const result = await roleService.update(mockRole.id!, updates);

        expect(mockRepository.findById).toHaveBeenCalledWith(mockRole.id);
        expect(mockRepository.update).toHaveBeenCalledWith(mockRole.id, updates);
        expect(result?.name).toBe('NEW_NAME');
    });

    it('debería retornar null si el rol no existe', async () => {
        mockRepository.findById.mockResolvedValueOnce(null);

        const result = await roleService.update('nonexistent-id', { name: 'X' });

        expect(result).toBeNull();
    });
});

describe('RoleService - delete', () => {
    it('debería eliminar un rol existente', async () => {
        mockRepository.findById.mockResolvedValueOnce(mockRole);
        mockRepository.delete.mockResolvedValueOnce();

        const result = await roleService.delete(mockRole.id!);

        expect(mockRepository.findById).toHaveBeenCalledWith(mockRole.id);
        expect(mockRepository.delete).toHaveBeenCalledWith(mockRole.id);
        expect(result).toBe(true);
    });

    it('debería retornar false si el rol no existe', async () => {
        mockRepository.findById.mockResolvedValueOnce(null);

        const result = await roleService.delete('nonexistent-id');

        expect(result).toBe(false);
    });
});