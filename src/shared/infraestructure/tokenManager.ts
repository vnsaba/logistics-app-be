import { TokenManagerInterface } from "../domain/tokenManager.interface";
import { UserRepository } from '../../user-service/infraestructure/Repository/user.repository';

const jwt = require('jsonwebtoken');

export class TokenManager implements TokenManagerInterface {
    private userRepository: UserRepository; // Repositorio de usuarios

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository; // Inicializa el repositorio de usuarios
    }

    async generateToken(email: string): Promise<string> { // Genera un token para el usuario
        try {
            const user = await this.userRepository.getByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }
    
            const token = jwt.sign({ id: user.id, roleId: user.roleId, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('Token generated:', token); // Log del token generado
            return token;
        }catch (error) {
            console.error('Error generating token:', error);
            throw new Error('Token generation failed');
        }
    }

    verifyToken(token: string): string | null { // Verifica el token y devuelve el email asociado
        try {
            const payload  = jwt.verify(token, process.env.JWT_SECRET) as { id: string, roleId: string, email: string };
            return payload.email; 
        } catch (error) {
            console.error('Invalid or expired token:', error);
            return null
        }
    }

}