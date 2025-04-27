
export interface TokenManagerInterface {
    generateToken(email: string): Promise<string>;   // Genera un token para el usuario
    verifyToken(token: string): string | null;     // Verifica el token y devuelve el email asociado       
}