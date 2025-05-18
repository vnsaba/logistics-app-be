// src/types/express.d.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';
import { Request as ExpressRequest } from "express";

export interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id?: string;
    email?: string;
    // otros campos si los necesitas
  };
}

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