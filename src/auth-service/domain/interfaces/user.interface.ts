import { User } from '../entity/user';

export interface IUserRepository {
  createUser(user: User): Promise<User>;
  getByEmail(email: string): Promise<User | null>;
  updateResetPasswordToken(email: string, token: string, expiresAt: Date): Promise<void>;
  updatePassword(email: string, newPassword: string): Promise<void>;
  clearResetToken(email: string): Promise<void>;
}
