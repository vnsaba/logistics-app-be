import { IUserRepository } from '../../user-service/domain/interfaces/user.interface';
import { User } from '../../user-service/domain/entity/user';
import { PasswordService } from '../../shared/infraestructure/bcryptHasher';

export class AdminSignUpService {
  private userRepository: IUserRepository;
  private passwordService: PasswordService;

  constructor(userRepository: IUserRepository, passwordService: PasswordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async signUp(
    fullname: string,
    email: string,
    password: string, // El admin proporciona la contraseña
    roleId: string, // El admin especifica el rol
    phone: string
  ): Promise<User> {
    const existingUser = await this.userRepository.getByEmail(email);
    if (existingUser) {
      throw new Error('Ya existe un usuario con ese email');
    }

    const passwordHash = await this.passwordService.hashPassword(password);

    const newUser = new User(fullname, email, passwordHash, roleId, phone);
    newUser.status = 'ACTIVE'; // El admin activa la cuenta directamente

    try {
      const createdUser = await this.userRepository.createUser(newUser);
      return createdUser;
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      throw new Error(
        'Error al crear el usuario. Por favor, intenta de nuevo.'
      );
    }
  }
}