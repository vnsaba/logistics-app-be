import { User } from '../../domain/entity/user';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { IUserRepository } from '../../domain/interfaces/user.interface';

export class UserRepository implements IUserRepository {


  public async createUser(userData: User): Promise<User> {
    return await prisma.user.create({
      data: {
        fullname: userData.fullname,
        email: userData.email,
        current_password: userData.current_password,
        roleId: userData.roleId,
        status: userData.status,
        created_at: new Date(),
        updated_at: new Date(),
        resetPasswordToken: null,
        expiresTokenPasswordAt: null,
        verificationCode: userData.verificationCode,
        verificationCodeExpires: userData.verificationCodeExpires,
      },
    })
  }

  public async getByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null
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
      }
    })
  }

  public async deleteUser(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }
  
  async updatePassword(email: string, newPassword: string): Promise<void> {
    await prisma.user.update({
      where: { email },
      data: {
        current_password: newPassword,
      }
    })
  }

  async clearResetToken(email: string): Promise<void> {
    await prisma.user.update({ where: { email }, data: { resetPasswordToken: null, expiresTokenPasswordAt: null } })
  }

  async updateResetPasswordToken(email: string, token: string, expiresAt: Date): Promise<void> {
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        expiresTokenPasswordAt: expiresAt,
      }
    })
  }
}
