import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
) {
  if (securityName === 'jwt') {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Promise.reject(new Error('No bearer token provided'));
    }

    const token = authHeader.split(' ')[1];

    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
        if (err || !decoded) {
          return reject(new Error('Invalid token'));
        }

        // Check wether decoded is an object
        const payload =
          typeof decoded === 'string' ? null : (decoded as JwtPayload);

        if (!payload || !payload.role) {
          return reject(new Error('Incomplete token'));
        }

        if (!scopes?.includes(payload.role)) {
          return reject(new Error('You can not access this resource'));
        }

        resolve(payload);
      });
    });
  }

  return Promise.reject(
    new Error(`Unsupported security scheme: ${securityName}`)
  );
}
