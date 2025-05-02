import { Route, Controller, Post, Body, SuccessResponse, Query, Request } from "tsoa";
import { UserService } from "../../application/user.service";
import { UserRepository } from "../repository/user.repository";
import { User } from "../../domain/entity/user";
import { EmailResetPasswordService } from "../../application/requestPassword.service";
import { TokenManager } from "../../../shared/infraestructure/tokenManager";
import { NodemailerEmailSender } from "../../../shared/infraestructure/nodemailerEmailSender";
import { ResetPasswordService } from "../../application/resetPassword.service";
import { PasswordService } from "../../../shared/infraestructure/bcryptHasher";
import { signInService } from '../../application/signInUser.service';
import { TwilioService } from "../../../shared/infraestructure/twilioService";
import { VerifyTwoFactorService } from '../../application/verifyTwoFactor.service';

interface VerificationResponse {
  message: string;
}

@Route('users')
export class UserController extends Controller {
  private readonly userService: UserService;
  private readonly requestPasswordService: EmailResetPasswordService;
  private readonly resetPasswordService: ResetPasswordService;
  private readonly signInService: signInService
  private readonly verifyTwoFactorService: VerifyTwoFactorService
  

  constructor() {
    super();
    const userRepository = new UserRepository();
    const emailSender = new NodemailerEmailSender();
    const token = new TokenManager();
    const passwordService = new PasswordService();
    const SmsService = new TwilioService()
    this.userService = new UserService(
      userRepository,
      passwordService,
      emailSender
    );
    this.requestPasswordService = new EmailResetPasswordService(
      userRepository,
      emailSender,
      token
    );
    this.resetPasswordService = new ResetPasswordService(userRepository, token);
    this.signInService = new signInService(userRepository, SmsService, passwordService)
    this.verifyTwoFactorService = new VerifyTwoFactorService(userRepository, token)
  }

  @SuccessResponse("201", "Created")
  @Post()
  public async createUser(
    @Body()
    requestBody: {
      fullname: string;
      email: string;
      current_password: string;
      roleId?: string;
      phone: string
    }
  ): Promise<User> {
    this.setStatus(201);
    const { fullname, email, current_password, roleId, phone } = requestBody;
    return await this.userService.createUser(
      fullname,
      email,
      current_password,
      phone,
      roleId,
    );
  }

  @SuccessResponse("200", "OK")
  @Post("forgot-password")
  public async forgotPassword(
    @Body() requestBody: { email: string }
  ): Promise<VerificationResponse> {
    try {
      this.setStatus(200);
      const { email } = requestBody;
      await this.requestPasswordService.sendRequestEmail(email);
      return {message: "Password reset email sent"}
    } catch (error) {
      throw new Error(`${error}`);
    }
  }
  @SuccessResponse("200", "OK")
  @Post("reset-password")
  public async resetPassword(
    @Body() requestBody: { newPassword: string },
    @Query("token") token: string
  ): Promise<VerificationResponse> {
    try {
      this.setStatus(200);
      const { newPassword } = requestBody;
      await this.resetPasswordService.resetPassword(token, newPassword);
      return {message: "Password reset successfully"}
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  @SuccessResponse("200", "OK")
  @Post("verify-email")
  public async verifyEmail(
    @Body() requestBody: { email: string; code: string }
  ): Promise<VerificationResponse> {
    this.setStatus(200);
    const { email, code } = requestBody;
    await this.userService.verifyEmail(email, code);
    return { message: "Code verified successfully. Your account has been activated." };
  }

  @SuccessResponse("200", "OK")
  @Post("signIn")
  public async signIn(@Body() requestBody: { email: string, current_password: string }): Promise<VerificationResponse> {
    this.setStatus(200);
    const { email, current_password } = requestBody;
    await this.signInService.singIn(email, current_password)
    return { message: "Verification code sent via SMS" }
  }

  @SuccessResponse("200", "OK")
  @Post("verify-code")
  public async verifyCodeSms(@Body() requestBody: { id: string, code: string }): Promise<{ token: string }> {
    this.setStatus(200);
    const { id, code } = requestBody;
    const { token } = await this.verifyTwoFactorService.execute(id, code);
    return { token };
  }


  @SuccessResponse("204", "No Content")
  @Post("change-password")
  public async changePassword(
    @Body() requestBody: { currentPassword: string; newPassword: string },
    @Request() req: Express.Request 
  ): Promise<void> {
    const email = (req as any).user?.email; 

    if (!email) {
      this.setStatus(401); // Unauthorized
      throw new Error("Usuario no autenticado.");
    }

    const { currentPassword, newPassword } = requestBody;
    await this.userService.changePassword(email, currentPassword, newPassword);
    this.setStatus(204); // No Content - la acción se completó exitosamente
  }

  

}
