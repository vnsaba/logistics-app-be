import { TokenManagerInterface } from "../../shared/domain/interfaces/tokenManager.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";

export class VerifyTwoFactorService {
    private userRepository: IUserRepository;
    private tokenGenerator: TokenManagerInterface;

    constructor(userRepository: IUserRepository, tokenGenerator: TokenManagerInterface
    ) {
        this.userRepository = userRepository;
        this.tokenGenerator = tokenGenerator;
    }

    async verifyTwoFactor(userId: string, code: string): Promise<{ token: string }> {
        const user = await this.userRepository.findById(userId);
        
        if (!user?.twoFactorCode || !user?.twoFactorExpires) {
            throw new Error("Invalid verification process");
        }

        const now = new Date();
        if (user.twoFactorCode !== code || now > user.twoFactorExpires) {
            throw new Error("Invalid or expired verification code");
        }

        await this.userRepository.clearTwoFactor(user.id!);
        const role =  await this.userRepository.getRoleNameByUserId(user.roleId)

        if (!role) {
            throw new Error("Role not found");
        }

        const token = await this.tokenGenerator.generateToken({
            id: user.id!,
            role,
            email: user.email
        }, {  expiresIn: "1h" });

        return { token };
    }
}
