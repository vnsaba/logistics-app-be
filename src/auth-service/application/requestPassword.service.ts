import { IUserRepository } from '../domain/interfaces/user.interface';
import { EmailSenderInterface } from '../../shared/domain/interfaces/emailSender.interface';
import { TokenManagerInterface } from '../../shared/domain/interfaces/tokenManager.interface';
import { expiresAt } from '../../../lib/verification';

export class EmailResetPasswordService {
    private userRepository: IUserRepository;
    private emailSender: EmailSenderInterface;
    private token: TokenManagerInterface; // Token para el restablecimiento de contraseña

    constructor(userRepository: IUserRepository, emailSender: EmailSenderInterface, token: TokenManagerInterface) {
        this.userRepository = userRepository;
        this.emailSender = emailSender;
        this.token = token; // Generar el token al instanciar la clase
    }

    async sendRequestEmail(email: string): Promise<void> {
        const user = await this.userRepository.getByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const token = await this.token.generateToken({ id: user.id, roleId: user?.roleId, email: user?.email }, "1h"); // Generar el token con el ID del usuario y su rolh
        if (!token) {
            throw new Error('Error generating token');
        }
        await this.userRepository.updateResetPasswordToken(user.email, token, expiresAt());
        const resetLink = ` http://localhost:${process.env.PORT}/users/reset-password?token=${token}`;
        await this.emailSender.sendEmail({
            to: email,
            subject: "Reset Password",
            template: "resetPasswordEmail",
            context: { resetLink },
        });
    }
}

