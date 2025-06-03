// src/prisma/index.ts
import { PrismaClient as MySQLClient } from '../prisma/generated/mysql'
import { PrismaClient as MongoClient } from '../prisma/generated/mongodb'

export const prismaMysql = new MySQLClient()
export const prismaMongo = new MongoClient()