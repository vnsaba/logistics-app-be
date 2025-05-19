import { IUserRepository } from '../../user-service/domain/interfaces/user.interface';
import { EmailSenderInterface } from '../../shared/domain/interfaces/emailSender.interface';
import { TokenManagerInterface } from '../../shared/domain/interfaces/tokenManager.interface';

export class EmailResetPasswordService {
    private userRepository: IUserRepository;
    private emailSender: EmailSenderInterface;
    private token: TokenManagerInterface; 

    constructor(
        userRepository: IUserRepository, 
        emailSender: EmailSenderInterface, 
        token: TokenManagerInterface
    ) {
        this.userRepository = userRepository;
        this.emailSender = emailSender;
        this.token = token; 
    }

    async sendRequestEmail(email: string): Promise<void> {
        const user = await this.userRepository.getByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        const token = this.token.generateToken(
            {
                id: user.id,
                email: user?.email,
            },
            { expiresIn: '1h' }
        ); 

        if (!token) {
            throw new Error('Error generating token');
        }

        const { FRONT_PORT, FRONT_HOST } = process.env;
        
        await this.userRepository.updateResetPasswordToken(user.email, token);
        const resetLink = `http://${FRONT_HOST}:${FRONT_PORT}/reset-password?token=${token}`;
        await this.emailSender.sendEmail({
            to: email,
            subject: "Reset Password",
            template: "resetPasswordEmail",
            context: { resetLink },
        });
    }
}

