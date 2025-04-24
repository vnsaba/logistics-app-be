import { User } from '../domain/user';
import { prisma } from '../../../prisma/index';
import { IUserRepository } from '../domain/interfaces/user.interface';
import { hash } from 'bcryptjs';
import { sendEmail } from '../../../lib/email';
import { generateVerificationCode } from '../../../lib/verification';

export class UserRepository implements IUserRepository {
  public async createUser(userData: User): Promise<User> {
    const { email, current_password, fullname } = userData;

    const existinguser = await prisma.user.findUnique({
      where: { email },
    });

    if (existinguser) {
      throw new Error('Ya existe un usuario con ese email');
    }

    const hashedPassword = await hash(current_password, 10);

    const newUser = await prisma.user.create({
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

    const verificationCode = generateVerificationCode();

    const emailSent = await sendEmail({
      to: email,
      subject: 'Código de verificación para tu cuenta',
      template: 'verification',
      context: { fullname, code: verificationCode },
    });

    if (!emailSent) {
      // Si falla el envío del correo, eliminamos el usuario creado
      await prisma.user.delete({
        where: { email },
      });
    }

    return newUser;
  }
}
