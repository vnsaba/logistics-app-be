import { User } from '../../domain/entity/user';
import { User as UserType } from '../../../../types/auth/index';
import { prismaMongo } from "../../../../prisma/index";
import { IUserRepository } from '../../domain/interfaces/user.interface';

export class UserRepository implements IUserRepository {

  async findById(id: string): Promise<User | null> {
    const user = await prismaMongo.user.findUnique({ where: { id } });
    return user;
  }

  public async createMany(users: User[]): Promise<(User | null)[]> {
    return await Promise.all(
      users.map(async (user) => {
        try {
          return await this.createUser(user);
        } catch (e) {
          console.error(`Error inserting user ${user.email}:`, e);
          return null;
        }
      })
    );
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
        created_at: userData.created_at ?? new Date(),
        updated_at: userData.updated_at ?? new Date(),
        resetPasswordToken: userData.resetPasswordToken ?? null,
        verificationCode: userData.verificationCode ?? null,
        verificationCodeExpires: userData.verificationCodeExpires ?? null,
        twoFactorCode: userData.twoFactorCode ?? null,
        twoFactorExpires: userData.twoFactorExpires ?? null,
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

  async findByEmails(emails: string[]): Promise<User[]> {
    return await prismaMongo.user.findMany({
      where: {
        email: { in: emails },
      },
    });
  }

  //filtrar todos los repartidores de una tienda en una ciudad y departamento especifico
  async findByDeliveries(cityId: string, storeId: string): Promise<User[]> {
    return await prismaMongo.user.findMany({
      where: {
        role: {
          name: 'REPARTIDOR',
        },
        cityId: cityId,
        storeId: storeId,
      },
    });
  }

}
