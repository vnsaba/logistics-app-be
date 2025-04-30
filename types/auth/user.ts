export interface User {
  id: string;
  fullname: string;
  email: string;
  current_password: string;
  roleId: string;
  phone: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  resetPasswordToken: string | null;
  verificationCode: string | null;
  verificationCodeExpires: Date | null;
  twoFactorCode: string | null;
  twoFactorExpires: Date | null;
}
