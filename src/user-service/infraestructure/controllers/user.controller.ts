import { Route, Controller, Post, Body, SuccessResponse } from 'tsoa';
import { UserService } from '../../application/user.service';
import { UserRepository } from '../user.repository';
import { User } from '../../domain/user';

@Route('users')
export class UserController extends Controller {
  private readonly userService: UserService;

  constructor() {
    super();
    const userRepository = new UserRepository();
    this.userService = new UserService(userRepository);
  }

  @SuccessResponse("201", "Created") 
  @Post()
  public async createUser(
    @Body() requestBody: {
      fullname: string;
      email: string;
      current_password: string;
      status: string;
      roleId?: string;
    }
  ): Promise<User> {
    this.setStatus(201); // set return status 201
    const { fullname, email, current_password, status, roleId } = requestBody;
    return await this.userService.createUser(
      fullname,
      email,
      current_password,
      status,
      roleId
    );
  }
}
