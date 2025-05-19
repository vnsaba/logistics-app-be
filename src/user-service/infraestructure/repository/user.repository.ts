import { User } from '../../domain/entity/user';
import { User as UserType } from '../../../../types/auth/index';
import { prismaMongo } from "../../../../prisma/index";

import { IUserRepository } from '../../domain/interfaces/user.interface';
import { DeliveryInfo } from '../../domain/interfaces/deliveryInfo.interface';

export class UserRepository implements IUserRepository {

  async findById(id: string): Promise<User | null> {
    const user = await prismaMongo.user.findUnique({ where: { id } });
    return user;
  }

  public async createUser(userData: User): Promise<User> {
    return await prismaMongo.user.create({
      data: {
        fullname: userData.fullname,
        email: userData.email,
        current_password: userData.current_password,
        phone: userData.phone,
        roleId: userData.roleId,
        status: userData.status,
        created_at: new Date(),
        updated_at: new Date(),
        resetPasswordToken: null,
        twoFactorCode: null,
        twoFactorExpires: null,
        verificationCode: userData.verificationCode,
        verificationCodeExpires: userData.verificationCodeExpires,
      },
    });
  }

  public async getByEmail(email: string): Promise<User | null> {
    const user = await prismaMongo.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    return user;
  }

  public async updateUser(user: User): Promise<User> {
    return await prismaMongo.user.update({
      where: { email: user.email },
      data: {
        fullname: user.fullname,
        current_password: user.current_password,
        roleId: user.roleId,
        status: user.status,
        updated_at: new Date(),
      },
    });
  }

  public async deleteUser(id: string): Promise<void> {
    await prismaMongo.user.delete({ where: { id } });
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    await prismaMongo.user.update({
      where: { email },
      data: {
        current_password: newPassword,
      },
    });
  }

  async clearResetToken(email: string): Promise<void> {
    await prismaMongo.user.update({
      where: { email },
      data: { resetPasswordToken: null },
    });
  }

  async updateResetPasswordToken(email: string, token: string): Promise<void> {
    await prismaMongo.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
      },
    });
  }

  async updateTwoFactor(
    id: string,
    code: string,
    expires: Date
  ): Promise<void> {
    await prismaMongo.user.update({
      where: { id },
      data: {
        twoFactorCode: code,
        twoFactorExpires: expires,
      },
    });
  }

  async clearTwoFactor(id: string): Promise<void> {
    await prismaMongo.user.update({
      where: { id },
      data: {
        twoFactorCode: null,
        twoFactorExpires: null,
      },
    });
  }

  public async getAllUsers(): Promise<Omit<UserType, 'current_password'>[]> {
    const users = await prismaMongo.user.findMany({
      omit: {
        current_password: true,
      },
      include: {
        role: true,
      },
    });

    return users;
  }

  // public async findByDeliveryId(id: string): Promise<User | null> {
  //   const user = await prismaMongo.user.findUnique({
  //     where: { id },
  //     include: {
  //       role: true,
  //     },
  //   });

  //   // Validar que el usuario existe y que su rol es 'delivery'
  //   if (!user || !user.role || user.role.name !== 'delivery') {
  //     return null;
  //   }
  //   return user;
  // }

  public async findByClientId(id: string): Promise<User | null> {
    const user = await prismaMongo.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user || !user.role || user.role.name !== 'CLIENTE') {
      return null;
    }
    return user;
  }

  public async getAllDeliveries(isAvaliable: boolean): Promise<DeliveryInfo[]> {
    const users = await prismaMongo.user.findMany({
      where: {
        role: {
          name: 'REPARTIDOR',
        },
        isAvaliable: isAvaliable,
      },
    });
    return users;
  }

}