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
import { UserRole} from '../../../../types/auth/index';
import { CreateRoleService } from "../../application/create-role.service";
import { DeleteRoleService } from "../../application/delete-role.service";
import { UpdateRoleService } from "../../application/update-role.service";
import { RoleRepository } from "../repository/role.repository";

@Route('roles')
@Tags('Roles')
export class RoleController extends Controller {
  private readonly createRoleService: CreateRoleService;
  private readonly deleteRoleService: DeleteRoleService;
  private readonly updateRoleService: UpdateRoleService;
  private readonly roleRepository: RoleRepository;

  constructor() {
    super();
    this.roleRepository = new RoleRepository(); 
    this.createRoleService = new CreateRoleService(this.roleRepository); 
    this.deleteRoleService = new DeleteRoleService(this.roleRepository); 
    this.updateRoleService = new UpdateRoleService(this.roleRepository);
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
    const createdRole = await this.createRoleService.execute(roleData); // Usando el servicio de creación
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

    const updatedRole = await this.updateRoleService.execute(id, data); 
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
    await this.deleteRoleService.execute(id); // Usando el servicio de eliminación
    this.setStatus(200);
    return { message: 'Role deleted successfully' };
  }
}
