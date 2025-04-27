import bcrypt from 'bcryptjs';
import { PasswordServiceInterface } from '../interfaces/password.interface';

export class PasswordService implements PasswordServiceInterface {
    
    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

}