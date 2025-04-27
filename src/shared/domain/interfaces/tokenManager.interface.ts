
export interface TokenManagerInterface {
    generateToken(payload: { id?: string; roleId: string, email: string }, expiresIn: string): Promise<string>;   // Genera un token para el usuario
    isTokenExpired(token: string): boolean | null; // Verifica si el token ha expirado
    verifyToken(token: string): { id: string; roleId: string; email: string };     // Verifica el token y devuelve el email asociado       
}