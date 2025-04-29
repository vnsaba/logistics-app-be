import { IUserRepository } from "../domain/interfaces/user.interface";
import { User } from "../domain/entity/user";
import { PasswordService } from "../../shared/infraestructure/bcryptHasher";
import { EmailSenderInterface } from "../../shared/domain/interfaces/emailSender.interface";
import { generateVerificationCode } from "../../../lib/verification";

export class UserService {
  private userRepository: IUserRepository;
  private passwordService: PasswordService;
  private emailSender: EmailSenderInterface;

  constructor(
    userRepository: IUserRepository,
    passwordService: PasswordService,
    emailSender: EmailSenderInterface
  ) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.emailSender = emailSender;
  }

  async createUser(
    fullname: string,
    email: string,
    current_password: string,
    phone: string, 
    roleId?: string
  ): Promise<User> {
    const existingUser = await this.userRepository.getByEmail(email);
    if (existingUser) {
      throw new Error("Ya existe un usuario con ese email");
    }
    const passwordHash = await this.passwordService.hashPassword(
      current_password
    );

    const newUser = new User(fullname, email, passwordHash, roleId, phone);
    newUser.status = "PENDING";
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(verificationCodeExpires.getMinutes() + 15);
    newUser.verificationCode = verificationCode;
    newUser.verificationCodeExpires = verificationCodeExpires;

    let createdUserId: string | undefined; // Variable para almacenar el ID del usuario creado

    try {
      const createdUser = await this.userRepository.createUser(newUser);
      createdUserId = createdUser.id; // Guardamos el ID después de la creación exitosa
      await this.emailSender.sendEmail({
        to: email,
        subject: "Verification code for your account",
        template: "verification",
        context: { fullname, code: verificationCode },
      });
      return createdUser;
    } catch (error) {
      console.error("Error durante la creación o envío del correo:", error);
      if (createdUserId) {
        await this.userRepository.deleteUser(createdUserId);
      } 
      throw new Error("Error durante la creación del usuario o el envío del correo de verificación. Por favor, intenta de nuevo.");
    }
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    const user = await this.userRepository.getByEmail(email);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    if (user.verificationCode !== code.toString()) {
      throw new Error("Código de verificación inválido");
    }

    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      throw new Error("El código de verificación ha expirado");
    }

    user.status = "ACTIVE";
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await this.userRepository.updateUser(user); 
  }
}
