import {
  Route,
  Controller,
  Post,
  Body,
  SuccessResponse,
  Tags,
  Security,
  Get,
  Path,
  Put,
  Delete,
} from "tsoa";
import { Role } from '../../domain/entity/role';
import { UserRole } from '../../../../types/auth/index';
import { RoleService } from "../../application/role.service";
import { RoleRepository } from "../repository/role.repository";

@Route('roles')
@Tags('Roles')
export class RoleController extends Controller {
  private readonly roleService: RoleService;
  private readonly roleRepository: RoleRepository;

  constructor() {
    super();
    this.roleRepository = new RoleRepository();
    this.roleService = new RoleService(this.roleRepository);
  }


  @Security('jwt', [UserRole.ADMINISTRADOR])
  @Get()
  public async getAll(): Promise<Role[]> {
    this.setStatus(200);
    const roles = await this.roleRepository.getAll();
    return roles;
  }


  @Security('jwt', [UserRole.ADMINISTRADOR])
  @Get('{id}')
  public async getById(@Path() id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      this.setStatus(404);
      throw new Error('Role not found');
    }
    this.setStatus(200);
    return role;
  }


  @Security('jwt', [UserRole.ADMINISTRADOR])
  @SuccessResponse('201', 'Role created successfully')
  @Post()
  public async create(@Body() roleData: Omit<Role, 'id'>): Promise<Role> {
    const createdRole = await this.roleService.create(roleData); // Usando el servicio de creación
    this.setStatus(201);
    return createdRole;
  }


  @Security('jwt', [UserRole.ADMINISTRADOR])
  @Put('{id}')
  public async update(@Path() id: string, @Body() data: Partial<Role>): Promise<Role> {
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      this.setStatus(404);
      throw new Error('Role not found');
    }

    const updatedRole = await this.roleService.update(id, data);
    if (!updatedRole) {
      this.setStatus(500);
      throw new Error('Failed to update role');
    }

    this.setStatus(200);
    return updatedRole;
  }

  @Security('jwt', [UserRole.ADMINISTRADOR])
  @Delete('{id}')
  public async delete(@Path() id: string): Promise<{ message: string }> {
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      this.setStatus(404);
      throw new Error('Role not found');
    }
    await this.roleService.delete(id); // Usando el servicio de eliminación
    this.setStatus(200);
    return { message: 'Role deleted successfully' };
  }
  @Security('jwt', [UserRole.ADMINISTRADOR])
  @Post('{id}/permissions')
  public async addPermissions(
    @Path() id: string,
    @Body() permissions: { name: string; resource: string; action: string }[]
  ): Promise<Role> {
    // Generate a unique id for each permission (using crypto or uuid, or fallback to Date.now for demo)
    const permissionsWithId = permissions.map(p => ({
      ...p,
      id: `${p.name}-${p.resource}-${p.action}-${Date.now()}-${Math.random()}`
    }));
    const role = await this.roleService.addPermissions(id, permissionsWithId);
    if (!role) {
      this.setStatus(404);
      throw new Error('Role not found');
    }
    this.setStatus(200);
    return role;
  }
  @Security('jwt', [UserRole.ADMINISTRADOR])
  @Delete('{id}/permissions')
  public async removePermissions(
    @Path() id: string,
    @Body() permissionNames: string[]
  ): Promise<Role> {
    const role = await this.roleService.removePermissions(id, permissionNames);
    if (!role) {
      this.setStatus(404);
      throw new Error('Role not found');
    }
    this.setStatus(200);
    return role;
  }


}
