import { SignUpService } from '../signUp.service';
import { IUserRepository } from '../../../user-service/domain/interfaces/user.interface';
import { PasswordService } from '../../../shared/infraestructure/bcryptHasher';
import { EmailSenderInterface } from '../../../shared/domain/interfaces/emailSender.interface';
import { IRoleRepository } from '../../../role-service/domain/interfaces/role.interface';

describe('SignUpService', () => {
  let signUpService: SignUpService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;
  let mockEmailSender: jest.Mocked<EmailSenderInterface>;
  let mockRoleRepository: jest.Mocked<IRoleRepository>;

  beforeEach(() => {
    mockUserRepository = {
      getByEmail: jest.fn(),
      createUser: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    mockPasswordService = {
      hashPassword: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;

    mockEmailSender = {
      sendEmail: jest.fn(),
    } as unknown as jest.Mocked<EmailSenderInterface>;

    mockRoleRepository = {
      findByName: jest.fn(),
    } as unknown as jest.Mocked<IRoleRepository>;

    signUpService = new SignUpService(
      mockUserRepository,
      mockPasswordService,
      mockEmailSender,
      mockRoleRepository
    );
  });

  it('debería lanzar un error si el teléfono no es válido', async () => {
    await expect(
      signUpService.signUp('John Doe', 'john@example.com', 'Password123!', '123456789')
    ).rejects.toThrow('El número de teléfono debe tener 10 dígitos y comenzar con 3.');
  });
});