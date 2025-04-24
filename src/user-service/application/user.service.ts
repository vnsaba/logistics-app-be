import { IUserRepository } from '../domain/interfaces/user.interface';
import { User } from '../domain/user';

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async createUser(
    fullname: string,
    email: string,
    current_password: string,
    status: string,
    roleId?: string
  ): Promise<User> {
    const user = new User(fullname, email, current_password, status, roleId);
    return await this.userRepository.createUser(user);
  }
}
