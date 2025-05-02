import {
  Route,
  Controller,
  Post,
  Body,
  SuccessResponse,
  Request,
  Middlewares,
  Query,
} from "tsoa";
import { UserRepository } from "../../../user-service/infraestructure/repository/user.repository";
import { User } from "../../../user-service/domain/entity/user";
import { EmailResetPasswordService } from "../../application/requestPassword.service";
import { TokenManager } from "../../../shared/infraestructure/tokenManager";
import { NodemailerEmailSender } from "../../../shared/infraestructure/nodemailerEmailSender";
import { ResetPasswordService } from "../../application/resetPassword.service";
import { PasswordService } from "../../../shared/infraestructure/bcryptHasher";
import { SignInService } from "../../application/signIn.service";
import { TwilioService } from "../../../shared/infraestructure/twilioService";
import { VerifyTwoFactorService } from "../../application/verifyTwoFactor.service";
import { SignUpService } from "../../../auth-service/application/signUp.service";
import { VerifyEmailService } from "../../../auth-service/application/verifyEmail.service";
import { RoleRepository } from "../../../role-service/infraestructure/repository/role.repository";
import { ChangePasswordService } from "../../application/changePassword.service";
import { Request as ExpressRequest } from "express";
import { authMiddleware } from "../../../middleware/auth.midlleware";
import { AdminSignUpService } from "../../application/AdminSignUp.service";

interface VerificationResponse {
  message: string;
}

@Route("auth")
export class AuthController extends Controller {
  private readonly signUpService: SignUpService;
  private readonly requestPasswordService: EmailResetPasswordService;
  private readonly resetPasswordService: ResetPasswordService;
  private readonly signInService: SignInService;
  private readonly verifyTwoFactorService: VerifyTwoFactorService;
  private readonly verifyEmailService: VerifyEmailService;
  private readonly changePasswordService: ChangePasswordService;
  private readonly adminSignUpService: AdminSignUpService;

  constructor() {
    super();

    const userRepository = new UserRepository();
    const roleRepository = new RoleRepository();
    const emailSender = new NodemailerEmailSender();
    const token = new TokenManager();
    const passwordService = new PasswordService();
    const SmsService = new TwilioService();

    this.signUpService = new SignUpService(
      userRepository,
      passwordService,
      emailSender,
      roleRepository 
    );

    this.requestPasswordService = new EmailResetPasswordService(
      userRepository,
      emailSender,
      token
    );

    this.resetPasswordService = new ResetPasswordService(userRepository, token);

    this.signInService = new SignInService(
      userRepository,
      SmsService,
      passwordService
    );

    this.verifyTwoFactorService = new VerifyTwoFactorService(
      userRepository,
      roleRepository,
      token
    );

    this.verifyEmailService = new VerifyEmailService(userRepository);
    this.changePasswordService = new ChangePasswordService(
      userRepository,
      passwordService
    );
    this.adminSignUpService = new AdminSignUpService(
      userRepository,
      passwordService
    );
  }

  @SuccessResponse("201", "Created")
  @Post("register")
  public async createUser(
    @Body()
    requestBody: {
      fullname: string;
      email: string;
      current_password: string;
      phone: string;
    }
  ): Promise<User> {
    this.setStatus(201);
    const { fullname, email, current_password, phone } = requestBody;
    return await this.signUpService.signUp(
      fullname,
      email,
      current_password,
      phone
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
      return { message: "Password reset email sent" };
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
      return { message: "Password reset successfully" };
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
    await this.verifyEmailService.verifyEmail(email, code);
    return {
      message: "Code verified successfully.",
    };
  }

  @SuccessResponse("200", "OK")
  @Post("signIn")
  public async signIn(
    @Body() requestBody: { email: string; current_password: string }
  ): Promise<VerificationResponse> {
    this.setStatus(200);
    const { email, current_password } = requestBody;
    await this.signInService.singIn(email, current_password);
    return { message: "Verification code sent via SMS" };
  }

  @SuccessResponse("200", "OK")
  @Post("verify-code")
  public async verifyCodeSms(
    @Body() requestBody: { id: string; code: string }
  ): Promise<{ token: string }> {
    this.setStatus(200);
    const { id, code } = requestBody;
    console.log("ID:", id);
    console.log("Code:", code);
    const { token } = await this.verifyTwoFactorService.verifyTwoFactor(
      id,
      code
    );
    return { token };
  }

  @SuccessResponse("204", "No Content")
  @Post("change-password")
  @Middlewares([authMiddleware]) // Aplica el middleware dentro de un array
  public async changePassword(
    @Body() requestBody: { currentPassword: string; newPassword: string },
    @Request() req: ExpressRequest
  ): Promise<void> {
    const userEmail = req.user?.email;
    console.log("userEmail", userEmail);

    if (!userEmail) {
      this.setStatus(401);
      throw new Error(
        "Usuario no autenticado (información del usuario no encontrada en el token)."
      );
    }

    const { currentPassword, newPassword } = requestBody;
    await this.changePasswordService.changePassword(
      userEmail,
      currentPassword,
      newPassword
    );
    this.setStatus(204);
  }

  // TODO: Poner middleware de autenticación
  @SuccessResponse("201", "Created")
  @Post("admin/register") // Nueva ruta para el registro por el administrador
  public async createAdminUser(
    @Body()
    requestBody: {
      fullname: string;
      email: string;
      password: string; 
      roleId: string; 
      phone: string;
    }
  ): Promise<User> {
    this.setStatus(201);

    // Por ahora, omitimos la verificación del rol del usuario autenticado
    const { fullname, email, password, roleId, phone } = requestBody;

    // Llamamos al servicio para registrar al usuario
    return await this.adminSignUpService.signUp(
      fullname,
      email,
      password,
      roleId,
      phone
    );
  }
}
