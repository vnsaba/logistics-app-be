
export interface TokenManagerInterface {
    generateToken(payload: { id?: string; roleId: string, rolName:string, email: string }, expiresIn: string): Promise<string>;   
    verifyToken(token: string): { id: string; roleId: string; email: string };         
}