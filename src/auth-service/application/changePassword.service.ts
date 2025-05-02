import { PasswordServiceInterface } from "../../shared/domain/interfaces/hashManager.interface";
import { IUserRepository } from '../../user-service/domain/interfaces/user.interface';

export class ChangePasswordService {
  private readonly userRepository: IUserRepository;
  private readonly passwordService: PasswordServiceInterface;

  constructor(userRepository: IUserRepository, passwordService: PasswordServiceInterface) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async changePassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.getByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    const isCurrentPasswordValid = await this.passwordService.comparePassword(
      currentPassword,
      user.current_password
    );

    if (!isCurrentPasswordValid) {
      throw new Error('La contraseña actual es incorrecta.');
    }

    if (newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
    }

    const hashedPassword = await this.passwordService.hashPassword(newPassword);
    await this.userRepository.updatePassword(user.email, hashedPassword);
  }
}