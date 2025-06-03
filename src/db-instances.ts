import path from 'path'

// Ruta absoluta al cliente MySQL
const mysqlClientPath = path.resolve(__dirname, '../../prisma/generated/mysql')
const mongoClientPath = path.resolve(__dirname, '../../prisma/generated/mongodb')

const { PrismaClient: MySQLClient } = require(mysqlClientPath)
const { PrismaClient: MongoClient } = require(mongoClientPath)

export const prismaMysql = new MySQLClient()
export const prismaMongo = new MongoClient()
