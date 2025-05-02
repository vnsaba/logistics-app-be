import { IUserRepository } from '../../user-service/domain/interfaces/user.interface';
import { User } from '../../user-service/domain/entity/user';
import { PasswordService } from '../../shared/infraestructure/bcryptHasher';
import { EmailSenderInterface } from '../../shared/domain/interfaces/emailSender.interface';
import { generateVerificationCode } from '../../../lib/verification';
import { IRoleRepository } from "../../role-service/domain/interfaces/role.interface";


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
    phone: string,
  ): Promise<User> {

    const phoneRegex = /^3\d{9}$/; // El número debe comenzar con '3' y tener exactamente 10 dígitos
    if (!phoneRegex.test(phone)) {
      throw new Error('El número de teléfono debe tener 10 dígitos y comenzar con 3.');
    }
    phone = `+57${phone}`
    console.log("phone", phone)
    const existingUser = await this.userRepository.getByEmail(email);
    if (existingUser) {
      throw new Error('Ya existe un usuario con ese email');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]{8,64}$/;

    if (!passwordRegex.test(current_password)) {
      throw new Error(
        'Password must be 8-64 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
    }
    
    const passwordHash =
      await this.passwordService.hashPassword(current_password);

    const delivererRole = await this.roleRepository.findByName('REPARTIDOR');
    if (!delivererRole) {
      throw new Error('El rol "REPARTIDOR" no se encontró en la base de datos.');
    }
    const delivererRoleId = delivererRole.id;
    const newUser = new User(fullname, email, passwordHash, delivererRoleId, phone);
    newUser.status = 'PENDING';
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(
      verificationCodeExpires.getMinutes() + 15
    );
    newUser.verificationCode = verificationCode;
    newUser.verificationCodeExpires = verificationCodeExpires;

    let createdUserId: string | undefined; // Variable para almacenar el ID del usuario creado

    try {
      const createdUser = await this.userRepository.createUser(newUser);
      createdUserId = createdUser.id; // Guardamos el ID después de la creación exitosa
      await this.emailSender.sendEmail({
        to: email,
        subject: 'Verification code for your account',
        template: 'verification',
        context: { fullname, code: verificationCode },
      });
      return createdUser;
    } catch (error) {
      console.error('Error durante la creación o envío del correo:', error);
      if (createdUserId) {
        await this.userRepository.deleteUser(createdUserId);
      }
      throw new Error(
        'Error durante la creación del usuario o el envío del correo de verificación. Por favor, intenta de nuevo.'
      );
    }
  }
}
