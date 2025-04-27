import { Route, Controller, Post, Body, SuccessResponse, Query } from 'tsoa';
import { UserService } from '../../application/user.service';
import { UserRepository } from '../repository/user.repository';
import { User } from '../../domain/entity/user';
import { EmailResetPasswordService } from '../../application/requestPassword.service';
import { TokenManager } from '../../../shared/infraestructure/tokenManager';
import { NodemailerEmailSender } from '../../../shared/infraestructure/nodemailerEmailSender';
import { ResetPasswordService } from '../../application/resetPassword.service';
import { PasswordService } from '../../../shared/infraestructure/bcryptHasher';

@Route('users')
export class UserController extends Controller {
  private readonly userService: UserService;
  private readonly requestPasswordService: EmailResetPasswordService;
  private readonly resetPasswordService: ResetPasswordService;

  constructor() {
    super();
    const userRepository = new UserRepository();
    const emailSender = new NodemailerEmailSender();
    const token = new TokenManager()
    const passwordService = new PasswordService()
    this.userService = new UserService(userRepository, passwordService, emailSender);
    this.requestPasswordService = new EmailResetPasswordService(userRepository, emailSender, token);
    this.resetPasswordService = new ResetPasswordService(userRepository, token);
  }

  @SuccessResponse("201", "Created")
  @Post()
  public async createUser(
    @Body() requestBody: {
      fullname: string;
      email: string;
      current_password: string;
      roleId?: string;
    }
  ): Promise<User> {
    this.setStatus(201); 
    const { fullname, email, current_password, roleId } = requestBody;
    return await this.userService.createUser(
      fullname,
      email,
      current_password,
      roleId
    );
  }

  @SuccessResponse("200", "OK")
  @Post('forgot-password')
  public async forgotPassword(@Body() requestBody: { email: string }): Promise<void> {
    try {
      this.setStatus(200); 
      const { email } = requestBody;
      return await this.requestPasswordService.sendRequestEmail(email);
    } catch (error) {
      console.error('Error real en forgotPassword:', error); 
      throw new Error(`el error es ${error}`); 
    }
  }
  @SuccessResponse("200", "OK")
  @Post('reset-password')
  public async resetPassword(
    @Body() requestBody: { newPassword: string },
    @Query('token') token: string 
  ): Promise<void> {
    try {
      this.setStatus(200); 
      const { newPassword } = requestBody;
      return await this.resetPasswordService.resetPassword(token, newPassword);
    } catch (error) {
      console.error('Error real en resetPassword:', error);
      throw new Error(`el error es ${error}`);
    }
  }

}
