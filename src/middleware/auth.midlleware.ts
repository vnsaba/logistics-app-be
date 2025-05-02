import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../types/express';

dotenv.config();

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error("JWT_SECRET no está definido en el archivo .env");
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // "Bearer [token]"

    if (token) {
      try {
        const decoded = jwt.verify(token, secretKey as string) as UserPayload; 

        req.user = decoded; // TypeScript sabe que 'req.user' puede existir y tiene la estructura de UserPayload
        next();
        return;
      } catch (err) {
        console.error('Error al verificar el token:', err);
        return res.status(401).json({ message: 'Token inválido.' });
      }
    } else {
      return res.status(401).json({ message: 'Token no proporcionado.' });
    }
  } else {
    return res.status(401).json({ message: 'Cabecera de autorización no encontrada.' });
  }
}