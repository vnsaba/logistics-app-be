/**
- Usuario no encontrado.
- Código de verificación incorrecto.
- Código expirado.
- Verificación exitosa (flujo correcto).
 */

import { VerifyEmailService } from '../../../auth-service/application/verifyEmail.service';
import { IUserRepository } from '../../../user-service/domain/interfaces/user.interface';
import { User } from '../../../user-service/domain/entity/user';

describe('VerifyEmailService', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let verifyEmailService: VerifyEmailService;

  const validCode = '123456';

  // Fecha futura para que no esté expirado
  const futureDate = new Date(Date.now() + 1000 * 60 * 10); // 10 min en el futuro

  let mockUser: User;

  beforeEach(() => {
    userRepository = {
      getByEmail: jest.fn(),
      updateUser: jest.fn(),
      // métodos no usados aquí
      findById: jest.fn(),
      createUser: jest.fn(),
      updatePassword: jest.fn(),
      deleteUser: jest.fn(),
      updateResetPasswordToken: jest.fn(),
      clearResetToken: jest.fn(),
      updateTwoFactor: jest.fn(),
      clearTwoFactor: jest.fn(),
      getAllUsers: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    verifyEmailService = new VerifyEmailService(userRepository);

    mockUser = new User(
      'Ana Gómez',
      'ana@example.com',
      'Abc12345!',
      'userRoleId',
      '3007654321',
      'user-99'
    );

    mockUser.verificationCode = validCode;
    mockUser.verificationCodeExpires = futureDate;
  });

  it('debería lanzar error si el usuario no existe', async () => {
    userRepository.getByEmail.mockResolvedValue(null);

    await expect(
      verifyEmailService.verifyEmail('noexiste@example.com', validCode)
    ).rejects.toThrow('Usuario no encontrado');
  });

  it('debería lanzar error si el código es incorrecto', async () => {
    mockUser.verificationCode = '999999';
    userRepository.getByEmail.mockResolvedValue(mockUser);

    await expect(
      verifyEmailService.verifyEmail(mockUser.email, validCode)
    ).rejects.toThrow('Código de verificación inválido');
  });

  it('debería lanzar error si el código ha expirado', async () => {
    mockUser.verificationCodeExpires = new Date(Date.now() - 1000); // ya expiró
    userRepository.getByEmail.mockResolvedValue(mockUser);

    await expect(
      verifyEmailService.verifyEmail(mockUser.email, mockUser.verificationCode!)
    ).rejects.toThrow('El código de verificación ha expirado');
  });

  it('debería verificar correctamente si el código es válido y no ha expirado', async () => {
    userRepository.getByEmail.mockResolvedValue(mockUser);

    await verifyEmailService.verifyEmail(mockUser.email, validCode);

    expect(userRepository.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: mockUser.email,
        verificationCode: null,
        verificationCodeExpires: null,
      })
    );
  });
});
