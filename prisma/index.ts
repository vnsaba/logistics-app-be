// import { PrismaClient } from '@prisma/client'
// export * from '@prisma/client'
// export const prisma = new PrismaClient()


import { PrismaClient as PrismaMysql } from '../prisma/generated/mysql';
import { PrismaClient as PrismaClientMongo } from '../prisma/generated/mongodb';

// Exportar instancias de PrismaClient para MySQL y MongoDB
export const prismaMysql = new PrismaMysql();
export const prismaMongo = new PrismaClientMongo();

// Exportar explícitamente lo necesario de cada módulo
export { Prisma as PrismaMysqlTypes } from '../prisma/generated/mysql';
export { Prisma as PrismaMongoTypes } from '../prisma/generated/mongodb';