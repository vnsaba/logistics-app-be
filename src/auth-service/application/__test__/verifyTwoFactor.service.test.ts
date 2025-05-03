/**
- Usuario no encontrado o sin código
- Código inválido o expirado 
- Rol no encontrado 
- Todo correcto → debe retornar el token generado
 */ 
import { VerifyTwoFactorService } from '../../../auth-service/application/verifyTwoFactor.service';
import { IUserRepository } from '../../../user-service/domain/interfaces/user.interface';
import { IRoleRepository } from '../../../role-service/domain/interfaces/role.interface';
import { TokenManagerInterface } from '../../../shared/domain/interfaces/tokenManager.interface';
import { User } from '../../../user-service/domain/entity/user';
import { Role } from '../../..//role-service/domain/entity/role';

describe('VerifyTwoFactorService', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let tokenGenerator: jest.Mocked<TokenManagerInterface>;

  let verifyTwoFactorService: VerifyTwoFactorService;

  let mockUser: User;

  const userId = 'user-123';
  const validCode = '654321';
  const validToken: string = 'mocked.jwt.token';
  const mockRole = new Role(
    'USER',
    'Standard user role',
    [
      {
        id: 'perm-1',
        name: 'Read Profile',
        action: 'read',
        resource: 'profile'
      },
      {
        id: 'perm-2',
        name: 'Update Settings',
        action: 'update',
        resource: 'settings'
      }
    ],
    'role-1'
  );
  const futureDate = new Date(Date.now() + 60 * 1000); // 1 min en el futuro

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      clearTwoFactor: jest.fn(),
      getByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      updateResetPasswordToken: jest.fn(),
      updatePassword: jest.fn(),
      deleteUser: jest.fn(),
      updateTwoFactor: jest.fn(),
      getAllUsers: jest.fn(),
      clearResetToken: jest.fn()
    } as unknown as jest.Mocked<IUserRepository>;

    roleRepository = {
      findById: jest.fn()
    } as unknown as jest.Mocked<IRoleRepository>;

    tokenGenerator = {
      generateToken: jest.fn()
    } as unknown as jest.Mocked<TokenManagerInterface>;

    verifyTwoFactorService = new VerifyTwoFactorService(
      userRepository,
      roleRepository,
      tokenGenerator
    );

    mockUser = new User(
      'Ana Gómez',
      'ana@example.com',
      'Abc12345!',
      'role-1',
      '3011234567',
      userId
    );
    mockUser.twoFactorCode = validCode;
    mockUser.twoFactorExpires = futureDate;
  });

  it('debería lanzar error si el usuario no existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      verifyTwoFactorService.verifyTwoFactor(userId, validCode)
    ).rejects.toThrow('Invalid verification process');
  });

  it('debería lanzar error si el código es incorrecto', async () => {
    mockUser.twoFactorCode = '000000';
    userRepository.findById.mockResolvedValue(mockUser);

    await expect(
      verifyTwoFactorService.verifyTwoFactor(userId, validCode)
    ).rejects.toThrow('Invalid or expired verification code');
  });

  it('debería lanzar error si el código está expirado', async () => {
    mockUser.twoFactorExpires = new Date(Date.now() - 1000); // ya expirado
    userRepository.findById.mockResolvedValue(mockUser);

    await expect(
      verifyTwoFactorService.verifyTwoFactor(userId, validCode)
    ).rejects.toThrow('Invalid or expired verification code');
  });

  it('debería lanzar error si el rol no se encuentra', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    roleRepository.findById.mockResolvedValue(null);

    await expect(
      verifyTwoFactorService.verifyTwoFactor(userId, validCode)
    ).rejects.toThrow('Role not found');
  });

  it('debería devolver un token si todo es válido', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    roleRepository.findById.mockResolvedValue(mockRole);
    tokenGenerator.generateToken.mockReturnValue(validToken);

    const result = await verifyTwoFactorService.verifyTwoFactor(userId, validCode);

    expect(userRepository.clearTwoFactor).toHaveBeenCalledWith(userId);
    expect(roleRepository.findById).toHaveBeenCalledWith(mockUser.roleId);
    expect(tokenGenerator.generateToken).toHaveBeenCalledWith(
      {
        id: userId,
        role: mockRole,
        email: mockUser.email
      },
      { expiresIn: '1h' }
    );
    expect(result).toEqual({ token: validToken });
  });
});
