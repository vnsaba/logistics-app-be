import { TokenManagerInterface } from "../domain/interfaces/tokenManager.interface";

const jwt = require('jsonwebtoken');

export class TokenManager implements TokenManagerInterface {

    async generateToken(payload: { id: string; roleId: string, rolName: string, email: string }, expiresIn: string = "1h"): Promise<string> {
        try {
            return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
        } catch (error) {
            console.error('Error generating token:', error);
            throw new Error('Error generating token');
        }
    }

    verifyToken(token: string): { id: string; roleId:string;  rolName: string; email: string } {
        try {
            return jwt.verify(token, process.env.JWT_SECRET) as { id: string, roleId: string,  rolName: string;  email: string };

        } catch (error) {
            console.error('Invalid or expired token:', error);
            throw new Error('Invalid or expired token');

        }
    }

}