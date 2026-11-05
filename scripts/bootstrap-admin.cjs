const { hash } = require('bcryptjs');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');

const PERMISSIONS = [
  ['visitors.view', 'Visitors', 'View visitor records, appointments, and live visits'],
  ['visitors.register', 'Visitors', 'Register visitors and appointments'],
  ['visitors.checkin', 'Visitors', 'Check visitors in and notify hosts'],
  ['visitors.checkout', 'Visitors', 'Check visitors out and record card returns'],
  ['visitors.card.print', 'Visitors', 'Issue temporary visitor cards and QR codes'],
  ['visitors.approve', 'Visitors', 'Approve or deny restricted visits'],
  ['visitors.manage', 'Visitors', 'Edit visit details and correct check-out records'],
  ['visitors.export', 'Visitors', 'Export the visitor register'],
  ['staff.view', 'Staff', 'View the staff directory and staff activity'],
  ['staff.manage', 'Staff', 'Create, update, deactivate, and reassign staff roles'],
  ['staff.export', 'Staff', 'Export the staff directory'],
  ['roles.manage', 'Security', 'Manage roles, permissions, and role assignments'],
  ['departments.manage', 'Organization', 'Manage departments and meeting rooms'],
  ['organization.view', 'Organization', 'View departments, staff names, and meeting rooms'],
  ['rooms.manage', 'Organization', 'Manage meeting rooms and assignments'],
  ['cards.configure', 'Visitors', 'Configure visitor ID card templates and print settings'],
  ['audit.view', 'Security', 'View system audit history'],
  ['attendance.view', 'Staff', 'View staff attendance records'],
  ['attendance.manage', 'Staff', 'Record and correct staff attendance'],
  ['finance.view', 'Finance', 'View authorized financial information'],
  ['finance.manage', 'Finance', 'Manage invoices, payments, and expenses'],
  ['finance.approve', 'Finance', 'Approve operational expenses'],
  ['finance.export', 'Finance', 'Export financial reports'],
  ['field.view', 'Surveying', 'View assigned land parcels and field projects'],
  ['field.manage', 'Surveying', 'Submit field work, survey measurements, and reports'],
  ['field.approve', 'Surveying', 'Approve submitted field reports'],
  ['reports.view', 'Reports', 'View operational reports'],
  ['reports.export', 'Reports', 'Export operational reports'],
  ['settings.manage', 'Settings', 'Manage organization and system settings'],
  ['notifications.manage', 'Settings', 'Configure, test, and review notifications']
];

const ALL = PERMISSIONS.map(([key]) => key);

const ROLE_DEFINITIONS = [
  {
    key: 'SUPER_ADMIN',
    name: 'Super Admin / Admin',
    description: 'Full system administration, security, finance, operations, and settings.',
    permissions: ALL,
    isSystem: true
  },
  {
    key: 'OFFICE_MANAGER',
    name: 'Office Manager',
    description: 'Daily office operations, staff oversight, visitor lifecycle, rooms, and reports.',
    permissions: [
      'visitors.view', 'visitors.register', 'visitors.checkin', 'visitors.checkout',
      'visitors.card.print', 'visitors.approve', 'visitors.manage', 'visitors.export',
      'staff.view', 'staff.export', 'organization.view', 'rooms.manage', 'cards.configure',
      'attendance.view', 'attendance.manage', 'reports.view', 'reports.export',
      'notifications.manage'
    ],
    isSystem: true
  },
  {
    key: 'ACCOUNTANT',
    name: 'Accountant',
    description: 'Invoices, payments, expenses, and financial reporting. No visitor or security access.',
    permissions: ['finance.view', 'finance.manage', 'finance.export', 'reports.view', 'reports.export', 'organization.view'],
    isSystem: true
  },
  {
    key: 'SURVEYOR',
    name: 'Surveyor',
    description: 'Assigned land parcels, field tasks, survey measurements, and field reports.',
    permissions: ['field.view', 'field.manage', 'organization.view'],
    isSystem: true
  },
  {
    key: 'RECEPTIONIST',
    name: 'Receptionist',
    description: 'Front desk visitor registration, check-in, check-out, and temporary cards.',
    permissions: [
      'visitors.view', 'visitors.register', 'visitors.checkin', 'visitors.checkout',
      'visitors.card.print', 'organization.view'
    ],
    isSystem: true
  },
  {
    key: 'VISITOR',
    name: 'Visitor',
    description: 'External visitor account with no office administration access.',
    permissions: [],
    isSystem: true
  }
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const email = String(process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || '';
  if (!connectionString) throw new Error('Set DATABASE_URL before bootstrapping.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Set a valid BOOTSTRAP_ADMIN_EMAIL.');
  if (password && password.length < 12) throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.');
  if (!password) throw new Error('Set BOOTSTRAP_ADMIN_PASSWORD (at least 12 characters) for the initial administrator.');
  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.$transaction(async (tx) => {
      for (const [key, module, description] of PERMISSIONS) {
        await tx.permission.upsert({
          where: { key },
          update: { module, description, action: key.slice(key.indexOf('.') + 1) },
          create: { key, module, description, action: key.slice(key.indexOf('.') + 1) }
        });
      }
      for (const definition of ROLE_DEFINITIONS) {
        const role = await tx.role.upsert({
          where: { key: definition.key },
          update: { name: definition.name, description: definition.description, isSystem: definition.isSystem },
          create: { key: definition.key, name: definition.name, description: definition.description, isSystem: definition.isSystem }
        });
        await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
        for (const permissionKey of definition.permissions) {
          const permission = await tx.permission.findUniqueOrThrow({ where: { key: permissionKey }, select: { id: true } });
          await tx.rolePermission.create({ data: { roleId: role.id, permissionId: permission.id } });
        }
      }
      const adminRole = await tx.role.findUniqueOrThrow({ where: { key: 'SUPER_ADMIN' }, select: { id: true } });
      const existing = await tx.user.findUnique({ where: { email }, select: { id: true } });
      if (existing) {
        await tx.userRole.upsert({
          where: { userId_roleId: { userId: existing.id, roleId: adminRole.id } },
          update: {},
          create: { userId: existing.id, roleId: adminRole.id }
        });
        console.log('Administrator already exists; system roles and permissions were synchronized.');
      } else {
        const user = await tx.user.create({
          data: {
            name: process.env.BOOTSTRAP_ADMIN_NAME || 'Workspace Administrator',
            email,
            passwordHash: await hash(password, 12),
            jobTitle: 'System Administrator',
            roles: { create: { roleId: adminRole.id } }
          },
          select: { id: true }
        });
        await tx.auditEvent.create({
          data: { actorId: user.id, action: 'system.bootstrap_admin_created', entityType: 'User', entityId: user.id }
        });
        console.log('Initial administrator, system roles, and permissions created.');
      }
    });
    console.log('Remove BOOTSTRAP_ADMIN_PASSWORD from the environment after this command.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Administrator bootstrap failed:', error.message);
  process.exitCode = 1;
});
