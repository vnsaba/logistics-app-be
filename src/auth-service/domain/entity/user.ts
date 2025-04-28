
export class User {
  id?: string;
  fullname: string;
  email: string;
  current_password: string;
  roleId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'; 
  created_at: Date;
  updated_at: Date;
  resetPasswordToken: string | null;
  expiresTokenPasswordAt: Date | null;
  verificationCode: string | null;
  verificationCodeExpires: Date | null;

  constructor(
    fullname: string,
    email: string,
    current_password: string,
    roleId: string = "userRoleId",
    id?: string
  ) {
    if (email) {
      email = email.toLowerCase().trim();
    }

    // Validate null/empty field
    if (!fullname || !email || !current_password) {
      throw new Error(
        "Los campos fullname, email y current_password son obligatorios."
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("El formato del email es inválido.");
    }

    if (current_password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }
    this.fullname = fullname;
    this.email = email;
    this.current_password = current_password;
    this.roleId = roleId;
    this.status = "PENDING"; 
    this.created_at = new Date();
    this.updated_at = new Date();
    this.resetPasswordToken = null;
    this.expiresTokenPasswordAt = null;
    this.verificationCode = null;
    this.verificationCodeExpires = null;
    if (id) {
      this.id = id;
    }
  }
}
