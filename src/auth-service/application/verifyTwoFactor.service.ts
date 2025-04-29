import { TokenManagerInterface } from "../../shared/domain/interfaces/tokenManager.interface";
import { IUserRepository } from "../domain/interfaces/user.interface";

export class VerifyTwoFactorService {
    private userRepository: IUserRepository;
    private tokenGenerator: TokenManagerInterface;

    constructor(userRepository: IUserRepository, tokenGenerator: TokenManagerInterface
    ) {
        this.userRepository = userRepository;
        this.tokenGenerator = tokenGenerator;
    }

    async execute(userId: string, code: string): Promise<{ token: string }> {
        const user = await this.userRepository.findById(userId);

        if (!user?.twoFactorCode || !user?.twoFactorExpires) {
            throw new Error("Invalid verification process");
        }

        const now = new Date();
        if (user.twoFactorCode !== code || now > user.twoFactorExpires) {
            throw new Error("Invalid or expired verification code");
        }

        await this.userRepository.clearTwoFactor(user.id!);
        const rol =  await this.userRepository.getRoleNameByUserId(user.roleId)

        if (!rol) {
            throw new Error("Role not found");
        }

        const token = await this.tokenGenerator.generateToken({
            id: user.id!,
            roleId: user.roleId,
            rolName: rol,
            email: user.email
        }, '1h');

        return { token };
    }
}
