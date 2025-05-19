import { User } from '../entity/user';
import { User as UserType } from '../../../../types/auth/index'
import { DeliveryInfo } from './deliveryInfo.interface';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  createUser(user: User): Promise<User>;
  updateUser(user: User): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  updateResetPasswordToken(email: string, token: string): Promise<void>;
  updatePassword(email: string, newPassword: string): Promise<void>;
  clearResetToken(email: string): Promise<void>;
  updateTwoFactor(id: string, code: string, expires: Date): Promise<void>
  clearTwoFactor(id: string): Promise<void>;
  getAllUsers(): Promise<Omit<UserType, 'current_password'>[]>
  // findByDeliveryId(id: string): Promise<User | null>;
  findByClientId(id: string): Promise<User | null>;
  getAllDeliveries(isAvaliable: boolean): Promise<DeliveryInfo[]>;
  //obtener la informacion de usuario, email, id y role y nombre completo y el numero de telefono
  
}
