import { ResetPasswordService } from '../resetPassword.service';
import { IUserRepository } from '../../../user-service/domain/interfaces/user.interface';
import { TokenManagerInterface } from '../../../shared/domain/interfaces/tokenManager.interface';
import { PasswordServiceInterface } from '../../../shared/domain/interfaces/hashManager.interface';
import { User } from '../../../user-service/domain/entity/user';

describe('ResetPasswordService', () => {
  let service: ResetPasswordService;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockTokenManager: jest.Mocked<TokenManagerInterface>;
  let mockPasswordService: jest.Mocked<PasswordServiceInterface>;

  const mockUser: User = {
    id: 'userId',
    fullname: 'Test User',
    email: 'test@example.com',
    current_password: 'oldHashedPassword', // Contraseña ya hasheada
    roleId: 'roleId',
    phone: '123456789',
    status: 'ACTIVE',
    created_at: new Date(),
    updated_at: new Date(),
    resetPasswordToken: null,
    verificationCode: null,
    verificationCodeExpires: null,
    twoFactorCode: null,
    twoFactorExpires: null,
  };

  const validTokenPayload = { email: mockUser.email };
  const validNewPassword = 'NewSecurePass1!';
  const hashedPassword = 'hashedNewSecurePass1!';

  beforeEach(() => {
  mockUserRepo = {
    getByEmail: jest.fn(),
    updatePassword: jest.fn(),
    clearResetToken: jest.fn(),
    findById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    updateResetPasswordToken: jest.fn(),
    updateTwoFactor: jest.fn(),
    clearTwoFactor: jest.fn(),
    getAllUsers: jest.fn(),
    // Agrega los que faltan según tu interfaz:
    createMany: jest.fn(),
    findByEmails: jest.fn(),
    getEmailById: jest.fn(),
  } as jest.Mocked<IUserRepository>;
  // ...
});
    mockTokenManager = {
      verifyToken: jest.fn(),
      generateToken: jest.fn(), // Mock necesario para la interfaz
    } as jest.Mocked<TokenManagerInterface>;

    mockPasswordService = {
      hashPassword: jest.fn(),
      comparePassword: jest.fn(), // Mock necesario para la interfaz
    } as jest.Mocked<PasswordServiceInterface>;

    service = new ResetPasswordService(mockUserRepo, mockTokenManager, mockPasswordService);
  });

  it('debería lanzar un error si el token es inválido', async () => {
    mockTokenManager.verifyToken.mockReturnValue(null);

    await expect(service.resetPassword('invalid-token', validNewPassword))
      .rejects
      .toThrow('Invalid token');
  });

  it('debería lanzar un error si el usuario no existe para el email en el token', async () => {
    mockTokenManager.verifyToken.mockReturnValue(validTokenPayload);
    mockUserRepo.getByEmail.mockResolvedValue(null);

    await expect(service.resetPassword('valid-token', validNewPassword))
      .rejects
      .toThrow('User not found');
  });

  it('debería lanzar un error si la nueva contraseña no cumple con los requisitos', async () => {
    mockTokenManager.verifyToken.mockReturnValue(validTokenPayload);
    mockUserRepo.getByEmail.mockResolvedValue(mockUser);

    const invalidNewPassword = 'short';

    await expect(service.resetPassword('valid-token', invalidNewPassword))
      .rejects
      .toThrow(/Password must be 8-64 characters long/);
  });

  it('debería actualizar la contraseña del usuario y limpiar el token si todo es válido', async () => {
    mockTokenManager.verifyToken.mockReturnValue(validTokenPayload);
    mockUserRepo.getByEmail.mockResolvedValue(mockUser);
    mockPasswordService.hashPassword.mockResolvedValue(hashedPassword);

    await service.resetPassword('valid-token', validNewPassword);

    expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(validNewPassword);
    expect(mockUserRepo.updatePassword).toHaveBeenCalledWith(mockUser.email, hashedPassword);
    expect(mockUserRepo.clearResetToken).toHaveBeenCalledWith(mockUser.email);
  });
});