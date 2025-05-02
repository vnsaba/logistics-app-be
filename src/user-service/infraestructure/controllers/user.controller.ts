import { Route, Controller, Get, Security } from 'tsoa';
import { UserService } from '../../application/user.service';
import { UserRepository } from '../repository/user.repository';
import { UserRole, User as UserType } from '../../../../types/auth/index';

@Route('users')
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
}
