
import { PrismaClient as PrismaMysql } from '../prisma/generated/mysql';
import { PrismaClient as PrismaClientMongo } from '../prisma/generated/mongodb';

export const prismaMysql = new PrismaMysql();
export const prismaMongo = new PrismaClientMongo();

export { Prisma as PrismaMysqlTypes } from '../prisma/generated/mysql';
export { Prisma as PrismaMongoTypes } from '../prisma/generated/mongodb';