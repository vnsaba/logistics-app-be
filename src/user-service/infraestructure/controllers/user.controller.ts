import { Route, Controller, Get, Security, Tags } from 'tsoa';
import { UserService } from '../../application/user.service';
import { UserRepository } from '../repository/user.repository';
import { UserRole, User as UserType } from '../../../../types/auth/index';
import { CityRepository } from '../../../city-service/infraestructure/repository/city.repository';
import { UserDto } from '../../application/dtos/users.dto';


@Route('users')
@Tags('User')
export class UserController extends Controller {
  private readonly userService: UserService;
  private readonly cityRepository: CityRepository;

  constructor() {
    super();
    this.cityRepository = new CityRepository();
    const userRepository = new UserRepository();

    this.userService = new UserService(userRepository, this.cityRepository);
  }

  // @Security('jwt', [UserRole.ADMINISTRADOR])
  @Get()
  public async getAllUsers(): Promise<UserDto[]> {
    this.setStatus(200);
    const users = await this.userService.getAll();
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
