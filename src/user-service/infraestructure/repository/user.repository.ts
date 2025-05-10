import { User } from '../../domain/entity/user';
import { User as UserType } from '../../../../types/auth/index';
import { PrismaClient } from '../../../../prisma/generated/mongodb';
const prisma = new PrismaClient();

import { IUserRepository } from '../../domain/interfaces/user.interface';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  }

  public async createUser(userData: User): Promise<User> {
    return await prisma.user.create({
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    return user;
  }

  public async updateUser(user: User): Promise<User> {
    return await prisma.user.update({
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
    await prisma.user.delete({ where: { id } });
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    await prisma.user.update({
      where: { email },
      data: {
        current_password: newPassword,
      },
    });
  }

  async clearResetToken(email: string): Promise<void> {
    await prisma.user.update({
      where: { email },
      data: { resetPasswordToken: null },
    });
  }

  async updateResetPasswordToken(email: string, token: string): Promise<void> {
    await prisma.user.update({
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
    await prisma.user.update({
      where: { id },
      data: {
        twoFactorCode: code,
        twoFactorExpires: expires,
      },
    });
  }

  async clearTwoFactor(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        twoFactorCode: null,
        twoFactorExpires: null,
      },
    });
  }

  public async getAllUsers(): Promise<Omit<UserType, 'current_password'>[]> {
    const users = await prisma.user.findMany({
      omit: {
        current_password: true,
      },
      include: {
        role: true,
      },
    });

    return users;
  }
}
