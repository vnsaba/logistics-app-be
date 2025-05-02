// src/types/express.d.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';

interface UserPayload {
  email?: string;
  id?: string;
  // Añade aquí cualquier otra propiedad que tengas en tu payload del token
}

declare module 'express' {
  interface Request {
    user?: UserPayload;
  }
}