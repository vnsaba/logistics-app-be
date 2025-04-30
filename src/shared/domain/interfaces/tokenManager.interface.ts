import { SignOptions } from "jsonwebtoken";

export interface TokenManagerInterface {
    generateToken(payload: Record<string, unknown>, options: SignOptions): string;
    verifyToken<T extends object = Record<string, unknown>>(token: string): T;       
}