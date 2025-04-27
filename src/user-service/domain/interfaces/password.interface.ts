export interface PasswordServiceInterface {
    hashPassword(password: string): Promise<string>; // Hashes a password using bcrypt
    comparePassword(password: string, hashedPassword: string): Promise<boolean>; // Compares a password with a hashed password
}