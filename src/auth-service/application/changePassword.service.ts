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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]{8,64}$/;

    if (!passwordRegex.test(newPassword)) {
      throw new Error(
        'Password must be 8-64 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
    }
    
    const hashedPassword = await this.passwordService.hashPassword(newPassword);
    await this.userRepository.updatePassword(user.email, hashedPassword);
  }
}