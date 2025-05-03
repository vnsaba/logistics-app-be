import { PasswordServiceInterface } from "../../shared/domain/interfaces/hashManager.interface";
import { IUserRepository } from '../../user-service/domain/interfaces/user.interface';
import { HttpError } from '../../shared/errors/HttpError';

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
      throw new HttpError('Usuario no encontrado.', 404);
    }

    const isCurrentPasswordValid = await this.passwordService.comparePassword(
      currentPassword,
      user.current_password
    );

    if (!isCurrentPasswordValid) {
      throw new HttpError('La contraseña actual es incorrecta.', 401);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]{8,64}$/;

    if (!passwordRegex.test(newPassword)) {
      throw new HttpError(
        'La nueva contraseña debe tener entre 8 y 64 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.',
        400
      );
    }

    const hashedPassword = await this.passwordService.hashPassword(newPassword);
    await this.userRepository.updatePassword(user.email, hashedPassword);
  }
}