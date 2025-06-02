import { User } from '../entity/user';
import { User as UserType } from '../../../../types/auth/index'

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  createUser(user: User): Promise<User>;
  updateUser(user: User): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  updateResetPasswordToken(email: string, token: string): Promise<void>;
  updatePassword(email: string, newPassword: string): Promise<void>;
  clearResetToken(email: string): Promise<void>;
  updateTwoFactor(id: string, code: string, expires: Date): Promise<void>;
  clearTwoFactor(id: string): Promise<void>;
  getAllUsers(): Promise<Omit<UserType, 'current_password'>[]>
  findByClientId(id: string): Promise<User | null>;
  getAllUsers(): Promise<Omit<UserType, "current_password">[]>;
  createMany(users: User[]): Promise<(User | null)[]>;
  findByEmails(emails: string[]): Promise<User[]>;
  findByDeliveries(cityId: string, storeId: string): Promise<User[]> // no sirve, borrar
  getAllCouriersWithLocation(): Promise<any[]>
  getUsersByRole(role: string): Promise<Omit<UserType, "current_password">[]>;
  updateOrdersToday(id: string, ordersToday: number): Promise<void>;
}
