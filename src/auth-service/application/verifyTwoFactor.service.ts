import { TokenManagerInterface } from "../../shared/domain/interfaces/tokenManager.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { IRoleRepository } from "../../role-service/domain/interfaces/role.interface";

export class VerifyTwoFactorService {
    private userRepository: IUserRepository;
    private roleRepository: IRoleRepository;
    private tokenGenerator: TokenManagerInterface;

    constructor(
        userRepository: IUserRepository, 
        roleRepository: IRoleRepository, 
        tokenGenerator: TokenManagerInterface
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.tokenGenerator = tokenGenerator;
    }

    /**
     * Verifies a two-factor authentication code for a user and generates a token upon successful verification.
     *
     * @param userId - The unique identifier of the user attempting to verify the two-factor code.
     * @param code - The two-factor authentication code provided by the user.
     * @returns A promise that resolves to an object containing the generated token.
     * @throws {Error} If the user does not have a valid two-factor verification process initialized.
     * @throws {Error} If the provided code is invalid or has expired.
     * @throws {Error} If the user's role cannot be found.
     */
    async verifyTwoFactor(email: string, code: string): Promise<{ token: string }> {
        const user = await this.userRepository.getByEmail(email);

        if (!user) {
            throw new Error("User not found");
        }
        
        if (!user?.twoFactorCode || !user?.twoFactorExpires) {
            throw new Error("Invalid verification process");
        }

        const now = new Date();
        if (user.twoFactorCode !== code || now > user.twoFactorExpires) {
            throw new Error("Invalid or expired verification code");
        }

        await this.userRepository.clearTwoFactor(user.id!);
        const role =  await this.roleRepository.findById(user.roleId)

        if (!role) {
            throw new Error("Role not found");
        }

        const token = await this.tokenGenerator.generateToken({
            id: user.id!,
            name: user.fullname,
            role,
            email: user.email,
            cityId: user.cityId,
        }, {  expiresIn: "1h" });

        return { token };
    }
}
