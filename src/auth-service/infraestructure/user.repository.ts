import { User } from '../domain/user';
import { prisma } from '../../../prisma/index';
import { IUserRepository } from '../domain/interfaces/user.interface';
import { hash } from 'bcryptjs';

export class UserRepository implements IUserRepository {
  public async createUser(userData: User): Promise<User> {
    const { email, current_password } = userData;

    const existinguser = await prisma.user.findUnique({
      where: { email },
    });

    if (existinguser) {
      throw new Error('Ya existe un usuario con ese email');
    }

    const hashedPassword = await hash(current_password, 10);

    return await prisma.user.create({
      data: {
        fullname: userData.fullname,
        email,
        current_password: hashedPassword,
        roleId: userData.roleId,
        status: userData.status,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
}
