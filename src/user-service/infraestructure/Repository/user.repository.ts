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
