import { IUserRepository } from '../domain/interfaces/user.interface';
import { User } from '../domain/entity/user';
import { PasswordService } from '../domain/service/password.service';
import { EmailSenderInterface } from 'src/shared/domain/emailSender.interface';
import { generateVerificationCode } from '../../../lib/verification';

export class UserService {
  private userRepository: IUserRepository;
  private passwordService: PasswordService;
  private emailSender: EmailSenderInterface

  constructor(userRepository: IUserRepository, passwordService: PasswordService, emailSender: EmailSenderInterface) {
    this.userRepository = userRepository;
    this.passwordService = passwordService
    this.emailSender = emailSender
  }

  async createUser(
    fullname: string,
    email: string,
    current_password: string,
    status: string,
    roleId?: string
  ): Promise<User> {
    const user = this.userRepository.getByEmail(email);
    if (!user) {
      throw new Error('Ya existe un usuario con ese email');
    }
    const passwordHash = await this.passwordService.hashPassword(current_password);

    const newUser = new User(
      fullname,
      email,
      passwordHash,
      status,
      roleId
    );
    

    const verificationCode = generateVerificationCode();
    await this.emailSender.sendEmail({
      to: email,
      subject: "Verification code for your account",
      template: "verification",
      context: { fullname, code: verificationCode },
    });
    return await this.userRepository.createUser(newUser);
  }
}

