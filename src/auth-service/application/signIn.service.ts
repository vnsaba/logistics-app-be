import { SmsSender } from '../../shared/domain/interfaces/SmsSender.interface';
import { IUserRepository } from '../..//user-service/domain/interfaces/user.interface';
import { PasswordServiceInterface } from '../..//shared/domain/interfaces/hashManager.interface';
import { PasswordService } from '../../shared/infraestructure/bcryptHasher';
import { generateVerificationCode, expiresAt } from '../../../lib/verification';

export class SignInService {
  private UserRepository: IUserRepository;
  private SMS: SmsSender;
  private passwordService: PasswordServiceInterface;

  constructor(
    userRepository: IUserRepository,
    sms: SmsSender,
    passwordService: PasswordService
  ) {
    this.UserRepository = userRepository;
    this.SMS = sms;
    this.passwordService = passwordService;
  }

  async singIn(email: string, password: string): Promise<void> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const user = await this.UserRepository.getByEmail(
      email.toLowerCase().trim()
    );
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.current_password
    );
    if (!isPasswordValid) {
      throw new Error('Incorrect password');
    }

    const code = generateVerificationCode();
    const expires = expiresAt();

    await this.UserRepository.updateTwoFactor(user.id!, code, expires);
    await this.SMS.sendSMS(user.phone, code);
  }
}
