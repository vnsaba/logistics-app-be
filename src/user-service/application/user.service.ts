import { IUserRepository } from "../domain/interfaces/user.interface";
import { User as UserType } from "../../../types/auth/index";

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getAllUsers(): Promise<Omit<UserType, "current_password">[]> {
    const users = await this.userRepository.getAllUsers();

    return users;
  }

  async getUsersByRole(
    roleName: string
  ): Promise<Omit<UserType, "current_password">[]> {
    const users = await this.userRepository.getUsersByRole(roleName);

    return users;
  }
}
