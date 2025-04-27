import { IUserRepository } from '../domain/interfaces/user.interface';
import { EmailSenderInterface } from '../../shared/domain/emailSender.interface';
import {TokenManagerInterface} from '../../shared/domain/tokenManager.interface';
import { expiresAt } from '../../../lib/verification';

export class EmailResetPasswordService {
    private userRepository: IUserRepository;
    private emailSender: EmailSenderInterface;
    private token: TokenManagerInterface; // Token para el restablecimiento de contraseña
    
    constructor(userRepository: IUserRepository, emailSender: EmailSenderInterface, token: TokenManagerInterface ) {
        this.userRepository = userRepository;
        this.emailSender = emailSender;
        this.token = token; // Generar el token al instanciar la clase
    }

    async sendRequestEmail(email: string): Promise<void> {
        const user = await this.userRepository.getByEmail(email);
        const token = await this.token.generateToken(email); 
        if (!user) {
            throw new Error('User not found');
        }   
        console.log("fecha de terminacion", expiresAt()) // Verifica la fecha de expiración
        await this.userRepository.updateResetPasswordToken(user.email, token, expiresAt() ); // Generar el token aquí
        await this.emailSender.sendResetPasswordLink(email, token); 
      
    }
}

