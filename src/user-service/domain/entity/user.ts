export class User {
  id?: string;
  created_at: Date;
  updated_at: Date;
  fullname: string;
  phone: string;
  email: string;
  current_password: string;
  roleId: string;
  latitude: number | null;
  longitude: number | null;
  isAvaliable: boolean | null;
  activeOrders: number | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  resetPasswordToken: string | null;
  verificationCode: string | null;
  verificationCodeExpires: Date | null;
  twoFactorCode: string | null;
  twoFactorExpires: Date | null;

  constructor(
    fullname: string,
    email: string,
    current_password: string,
    roleId: string = 'userRoleId',
    phone: string,
    id?: string
  ) {
    if (email) {
      email = email.toLowerCase().trim();
    }

    // // Validate null/empty field
    // if (!fullname || !email || !current_password) {
    //   throw new Error(
    //     'Los campos fullname, email y current_password son obligatorios.'
    //   );
    // }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   throw new Error('El formato del email es inválido.');
    // }

    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]{8,64}$/;

    // if (!passwordRegex.test(current_password)) {
    //   throw new Error(
    //     'Password must be 8-64 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.'
    //   );
    // }

    // if (current_password.length < 6) {
    //   throw new Error('La contraseña debe tener al menos 6 caracteres.');
    // }
    this.fullname = fullname;
    this.email = email;
    this.current_password = current_password;
    this.roleId = roleId;
    this.status = 'PENDING';
    this.phone = phone;
    this.created_at = new Date();
    this.updated_at = new Date();
    this.resetPasswordToken = null;
    this.verificationCode = null;
    this.verificationCodeExpires = null;
    this.twoFactorCode = null;
    this.twoFactorExpires = null;
    this.latitude = null;
    this.longitude = null;
    this.activeOrders = null;
    this.isAvaliable = false;
    if (id) {
      this.id = id;
    }
  }
}
