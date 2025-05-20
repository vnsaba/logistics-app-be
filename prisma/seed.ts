import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const now = new Date()

  // 1. Permisos por rol (serán embebidos dentro del rol)
  const permissionsByRole = {
    Administrador: [
      { id: 'perm-1', name: 'manage_users', resource: 'users', action: 'manage' },
      { id: 'perm-2', name: 'manage_roles', resource: 'roles', action: 'manage' },
      { id: 'perm-3', name: 'update_settings', resource: 'settings', action: 'update' },
    ],
    Gerente: [
      { id: 'perm-4', name: 'view_reports', resource: 'reports', action: 'view' },
      { id: 'perm-5', name: 'update_inventory', resource: 'inventory', action: 'update' },
    ],
    Despachador: [
      { id: 'perm-6', name: 'create_shipments', resource: 'shipments', action: 'create' },
      { id: 'perm-7', name: 'update_shipments', resource: 'shipments', action: 'update' },
    ],
    Repartidor: [
      { id: 'perm-8', name: 'view_deliveries', resource: 'deliveries', action: 'view' },
      { id: 'perm-9', name: 'update_deliveries', resource: 'deliveries', action: 'update' },
    ],
    CLIENTE: [
      { id: 'perm-8', name: 'view_deliveries', resource: 'deliveries', action: 'view' },
      { id: 'perm-9', name: 'update_deliveries', resource: 'deliveries', action: 'update' },
    ],
  }

  // 2. Crear los roles con los permisos embebidos
  const roles = await Promise.all(
    Object.entries(permissionsByRole).map(async ([name, permissions]) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: {
          name,
          description: `Rol de ${name.toLowerCase()}`,
          permissions,
        },
      })
    )
  )

  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]))

  // 3. Usuarios con sus respectivos roles
  const usersData = [
    {
      fullname: 'Admin User',
      email: 'admin@example.com',
      current_password: 'admin123',
      roleId: roleMap['Administrador'],
    },
    {
      fullname: 'Gerente User',
      email: 'gerente@example.com',
      current_password: 'gerente123',
      roleId: roleMap['Gerente'],
    },
    {
      fullname: 'Despachador User',
      email: 'despachador@example.com',
      current_password: 'despacho123',
      roleId: roleMap['Despachador'],
    },
    {
      fullname: 'Repartidor User',
      email: 'repartidor@example.com',
      current_password: 'reparto123',
      roleId: roleMap['Repartidor'],
    },
  ]

  await Promise.all(
    usersData.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          ...user,
          status: 'active',
          created_at: now,
          updated_at: now,
        },
      })
    )
  )

  console.log(' Seed con permisos embebidos completado.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
