import { Route, Controller, Get, Security, Tags } from 'tsoa';
import { UserService } from '../../application/user.service';
import { UserRepository } from '../repository/user.repository';
import { UserRole, User as UserType } from '../../../../types/auth/index';

@Route('users')
@Tags('User')
export class UserController extends Controller {
  private readonly userService: UserService;

  constructor() {
    super();

    const userRepository = new UserRepository();

    this.userService = new UserService(userRepository);
  }

  @Security('jwt', [UserRole.ADMINISTRADOR])
  @Get('all')
  public async getAllUsers(): Promise<Omit<UserType, 'current_password'>[]> {
    this.setStatus(200);
    const users = await this.userService.getAllUsers();
    return users;
  }

  @Security('jwt', [UserRole.ADMINISTRADOR])
  @Get('role/{role}')
  public async getUsersByRole(role: UserRole): Promise<Omit<UserType, 'current_password'>[]> {
    this.setStatus(200);
    const users = await this.userService.getUsersByRole(role);
    return users;
  }
}
