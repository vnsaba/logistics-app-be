import { TokenManagerInterface } from "../../shared/domain/tokenManager.interface";
import { IUserRepository } from "../domain/interfaces/user.interface";
import { PasswordServiceInterface } from "../domain/interfaces/password.interface";
import { PasswordService } from "../domain/service/password.service";

export class ResetPasswordService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly tokenManager: TokenManagerInterface,
        private readonly passwordService: PasswordServiceInterface = new PasswordService() // Instancia de PasswordServiceInterface
    ) { }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const payload = this.tokenManager.verifyToken(token);
        if (!payload) throw new Error('Invalid token');
        const user = await this.userRepository.getByEmail(payload.email);

        if (this.tokenManager.isTokenExpired(token)) {
            throw new Error('Token expired');
        }

        if (!user) {
            throw new Error('User not found');
        }

        const passwordHash = await this.passwordService.hashPassword(newPassword); // Hash de la nueva contraseña
        await this.userRepository.updatePassword(user?.email, passwordHash);
        await this.userRepository.clearResetToken(user?.email); // Limpiar el token de restablecimiento de contraseña
    }
}