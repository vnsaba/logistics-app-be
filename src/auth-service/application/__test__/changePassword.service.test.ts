/**
- Usuario no existe
- Contraseña actual incorrecta
- Nueva contraseña inválida
- Éxito completo
 */
import { ChangePasswordService } from '../changePassword.service';
import { IUserRepository } from '../../../user-service/domain/interfaces/user.interface';
import { PasswordServiceInterface } from '../../../shared/domain/interfaces/hashManager.interface';
import { HttpError } from '../../../shared/errors/HttpError';
import { User } from '../../../user-service/domain/entity/user';

describe('ChangePasswordService', () => {
    let userRepository: jest.Mocked<IUserRepository>;
    let passwordService: jest.Mocked<PasswordServiceInterface>;
    let changePasswordService: ChangePasswordService;
  
    // Creamos un usuario realista usando el constructor, con contraseña válida
    const mockUser = new User(
      'Juan Pérez',
      'test@example.com',
      'Abc12345!', // Cumple requisitos
      'role123',
      '3001234567',
      'user-1'
    );
  
    beforeEach(() => {
      userRepository = {
        getByEmail: jest.fn(),
        updatePassword: jest.fn(),
        // Métodos no usados en estas pruebas
        findById: jest.fn(),
        createUser: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
        updateResetPasswordToken: jest.fn(),
        clearResetToken: jest.fn(),
        updateTwoFactor: jest.fn(),
        clearTwoFactor: jest.fn(),
        getAllUsers: jest.fn(),
      } as unknown as jest.Mocked<IUserRepository>;
  
      passwordService = {
        comparePassword: jest.fn(),
        hashPassword: jest.fn(),
      } as jest.Mocked<PasswordServiceInterface>;
  
      changePasswordService = new ChangePasswordService(userRepository, passwordService);
    });
  
    it('debería lanzar error si el usuario no es encontrado', async () => {
      userRepository.getByEmail.mockResolvedValue(null);
  
      await expect(
        changePasswordService.changePassword('test@example.com', '123456', 'Nueva123!')
      ).rejects.toThrow(new HttpError('Usuario no encontrado.', 404));
    });
  
    it('debería lanzar error si la contraseña actual es incorrecta', async () => {
      userRepository.getByEmail.mockResolvedValue(mockUser);
      passwordService.comparePassword.mockResolvedValue(false);
  
      await expect(
        changePasswordService.changePassword('test@example.com', 'wrongpass', 'Nueva123!')
      ).rejects.toThrow(new HttpError('La contraseña actual es incorrecta.', 401));
    });
  
    it('debería lanzar error si la nueva contraseña no cumple requisitos', async () => {
      userRepository.getByEmail.mockResolvedValue(mockUser);
      passwordService.comparePassword.mockResolvedValue(true);
  
      const invalidPassword = 'abc123'; // no cumple requisitos
  
      await expect(
        changePasswordService.changePassword('test@example.com', 'Abc12345!', invalidPassword)
      ).rejects.toThrow(/La nueva contraseña debe tener entre 8 y 64 caracteres/);
    });
  
    it('debería actualizar la contraseña correctamente si todos los pasos son válidos', async () => {
      const newPassword = 'NuevaSegura123!';
      const hashedPassword = 'hashedNewPassword';
  
      userRepository.getByEmail.mockResolvedValue(mockUser);
      passwordService.comparePassword.mockResolvedValue(true);
      passwordService.hashPassword.mockResolvedValue(hashedPassword);
  
      await changePasswordService.changePassword(mockUser.email, 'Abc12345!', newPassword);
  
      expect(passwordService.hashPassword).toHaveBeenCalledWith(newPassword);
      expect(userRepository.updatePassword).toHaveBeenCalledWith(mockUser.email, hashedPassword);
    });
  });