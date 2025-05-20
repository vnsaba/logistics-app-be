import { HttpError } from "../../shared/errors/HttpError";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { User } from "../../user-service/domain/entity/user";
import { PasswordService } from "../../shared/infraestructure/bcryptHasher";
import { EmailSenderInterface } from "../../shared/domain/interfaces/emailSender.interface";
import { generateVerificationCode } from "../../../lib/verification";
import { IRoleRepository } from "../../role-service/domain/interfaces/role.interface";
import { ValidationError } from "../../shared/domain/interfaces/validationError";

export class SignUpService {
  private userRepository: IUserRepository;
  private passwordService: PasswordService;
  private emailSender: EmailSenderInterface;
  private roleRepository: IRoleRepository;

  constructor(
    userRepository: IUserRepository,
    passwordService: PasswordService,
    emailSender: EmailSenderInterface,
    roleRepository: IRoleRepository
  ) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.emailSender = emailSender;
    this.roleRepository = roleRepository;
  }
  async signUp(
    fullname: string,
    email: string,
    current_password: string,
    phone: string
  ): Promise<User> {
    const errors: ValidationError[] = [];

    phone = `+57${phone}`;

    if (!/^\d{10}$/.test(phone) || !phone.startsWith('3')) {
      throw new HttpError("El número de teléfono debe tener 10 dígitos y comenzar con 3.", 400);
    }


    const existingUser = await this.userRepository.getByEmail(email);
    if (existingUser) {
      errors.push({
        field: "email",
        message: "Ya existe un usuario con ese email.",
      });
    }

    const passwordHash =
      await this.passwordService.hashPassword(current_password);

    const clientRole = await this.roleRepository.findByName("CLIENTE");
    if (!clientRole) {
      throw new HttpError(
        'El rol "CLIENTE" no se encontró en la base de datos.',
        500
      );
    }



    const clientRolId = clientRole.id;
    const newUser = new User(
      fullname,
      email,
      passwordHash,
      clientRolId,
      phone
    );
    newUser.status = "PENDING";

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(
      verificationCodeExpires.getMinutes() + 15
    );
    newUser.verificationCode = verificationCode;
    newUser.verificationCodeExpires = verificationCodeExpires;

    let createdUserId: string | undefined;

    try {
      const createdUser = await this.userRepository.createUser(newUser);
      createdUserId = createdUser.id;
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
      throw new HttpError(
        "Error durante la creación del usuario o el envío del correo de verificación. Por favor, intenta de nuevo.",
        500
      );
    }
  }
}
