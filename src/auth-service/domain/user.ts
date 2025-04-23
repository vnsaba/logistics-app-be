export class User {
  fullname: string;
  email: string;
  current_password: string;
  roleId: string;
  status: string;
  created_at: Date;
  updated_at: Date;

  constructor(
    fullname: string,
    email: string,
    current_password: string,
    status: string,
    roleId: string = 'userRoleId'
  ) {
    if (email) {
      email = email.toLowerCase().trim();
    }

    // Validate null/empty field
    if (!fullname || !email || !current_password) {
      throw new Error(
        'Los campos fullname, email y current_password son obligatorios.'
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('El formato del email es inválido.');
    }

    if (current_password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    this.fullname = fullname;
    this.email = email;
    this.current_password = current_password;
    this.roleId = roleId;
    this.status = status;
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}
