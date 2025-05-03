import { TokenManagerInterface } from "../../shared/domain/interfaces/tokenManager.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { PasswordServiceInterface } from "../../shared/domain/interfaces/hashManager.interface";
import { PasswordService } from "../../shared/infraestructure/bcryptHasher";

export class ResetPasswordService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly tokenManager: TokenManagerInterface,
        private readonly passwordService: PasswordServiceInterface = new PasswordService() // Instancia de PasswordServiceInterface
    ) { }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const payload = this.tokenManager.verifyToken<{ email: string }>(token);
        if (!payload) throw new Error('Invalid token');
        const user = await this.userRepository.getByEmail(payload.email);

        if (!user) {
            throw new Error('User not found');
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]{8,64}$/;

        if (!passwordRegex.test(newPassword)) {
            throw new Error(
                'Password must be 8-64 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.'
            );
        }
        const passwordHash = await this.passwordService.hashPassword(newPassword); // Hash de la nueva contraseña
        await this.userRepository.updatePassword(user?.email, passwordHash);
        await this.userRepository.clearResetToken(user?.email); // Limpiar el token de restablecimiento de contraseña
    }
}