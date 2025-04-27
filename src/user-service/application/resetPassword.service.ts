import { TokenManagerInterface } from "../../shared/domain/tokenManager.interface";
import { IUserRepository } from "../domain/interfaces/user.interface";
import bcrypt from "bcryptjs";

export class ResetPasswordService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly tokenManager: TokenManagerInterface,
    ) {}

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const email = this.tokenManager.verifyToken(token);
        if (!email) throw new Error('Invalid token');
        const user = await this.userRepository.getByEmail(email);
        const now = new Date();

        if (!user?.expiresTokenPasswordAt) {
            throw new Error('Token expiration date is missing');
        }
    
        if ( now > user?.expiresTokenPasswordAt) {
            throw new Error('Token expired');
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.userRepository.updatePassword(email, passwordHash);
        await this.userRepository.clearResetToken(email);
    }
}