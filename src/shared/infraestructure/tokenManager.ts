import { TokenManagerInterface } from "../domain/interfaces/tokenManager.interface";

const jwt = require('jsonwebtoken');

export class TokenManager implements TokenManagerInterface {

    async generateToken(payload: { id: string; roleId: string, email: string }, expiresIn: string = "1h"): Promise<string> { // Genera un token para el usuario
        try {
            return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn }); // Genera un token con una expiración de 1 hora
        } catch (error) {
            console.error('Error generating token:', error);
            throw new Error('Error generating token');
        }
    }

    verifyToken(token: string): { id: string; roleId: string; email: string } { // Verifica el token y devuelve el email asociado
        try {
            return jwt.verify(token, process.env.JWT_SECRET) as { id: string, roleId: string, email: string };

        } catch (error) {
            console.error('Invalid or expired token:', error);
            throw new Error('Invalid or expired token'); // Lanza un error si el token es inválido o ha expirado}

        }
    }

    isTokenExpired(token?: string | null): boolean {
        try {
            const decoded = jwt.decode(token) as { exp: number };
            if (!decoded || !decoded.exp) {
                throw new Error("Invalid token: missing expiration");
            }
            const now = Math.floor(Date.now() / 1000); // Current time in seconds
            return now > decoded.exp; // Returns true if the token has expired
        } catch (error) {
            console.error("Error verifying token expiration:", error);
            throw new Error("Error verifying token expiration");
        }
    }

}