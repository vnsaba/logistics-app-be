import { TokenManagerInterface } from "../domain/interfaces/tokenManager.interface";
import jwt, { SignOptions } from 'jsonwebtoken'
const { JWT_SECRET } = process.env;

export class TokenManager implements TokenManagerInterface {

    generateToken(payload: Record<string, unknown>, options: SignOptions): string{
        try {
            return jwt.sign(payload, JWT_SECRET!, { ...options });
        } catch (error) {
            console.error('Error generating token:', error);
            throw new Error('Error generating token');
        }
    }

    verifyToken<T extends object = Record<string, unknown>>(token: string): T | null {
        try {
            return jwt.verify(token, JWT_SECRET!) as T;
        } catch (error) {
            console.error('Error verifying token:', error);
            throw new Error('Invalid or expired token' );
        }
    }
}