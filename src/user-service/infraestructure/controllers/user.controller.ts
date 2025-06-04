import { Route, Controller, Get, Security, Tags, Path, Response, SuccessResponse } from 'tsoa';
import { UserService } from '../../application/user.service';
import { UserRepository } from '../repository/user.repository';
import { UserRole, User as UserType } from '../../../../types/auth/index';

/**
 * Controlador para gestionar usuarios del sistema.
 */
@Route('users')
@Tags('User')
export class UserController extends Controller {
  private readonly userService: UserService;

  constructor() {
    super();
    const userRepository = new UserRepository();
    this.userService = new UserService(userRepository);
  }

  /**
   * Obtiene todos los usuarios del sistema.
   * Solo accesible para administradores.
   */
  @Security('jwt', [UserRole.ADMINISTRADOR])
  @Get('all')
  @SuccessResponse("200", "Usuarios obtenidos exitosamente")
  public async getAllUsers(): Promise<Omit<UserType, 'current_password'>[]> {
    const users = await this.userService.getAllUsers();
    return users;
  }

  /**
   * Obtiene usuarios por rol.
   * @param role Rol de los usuarios a consultar (ej: REPARTIDOR, CLIENTE).
   */
  @Security('jwt', [UserRole.ADMINISTRADOR])
  @Get('role/{role}')
  @Response("400", "Rol inválido")
  @SuccessResponse("200", "Usuarios por rol obtenidos exitosamente")
  public async getUsersByRole(@Path() role: UserRole): Promise<Omit<UserType, 'current_password'>[]> {
    // Validar rol manualmente si es posible recibirlo mal
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      this.setStatus(400);
      throw new Error('Invalid role');
    }

    const users = await this.userService.getUsersByRole(role);
    return users;
  }
}