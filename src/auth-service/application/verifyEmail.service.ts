import { IUserRepository } from '../../user-service/domain/interfaces/user.interface';

export class VerifyEmailService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    const user = await this.userRepository.getByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    if (user.verificationCode !== code.toString()) {
      throw new Error('Código de verificación inválido');
    }

    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      throw new Error('El código de verificación ha expirado');
    }

    user.status = 'ACTIVE';
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await this.userRepository.updateUser(user);
  }
}
