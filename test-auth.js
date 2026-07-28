const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  const users = await prisma.user.findMany({ select: { name: true, email: true, role: true, password: true } });
  console.log('Users count:', users.length);
  
  for (const u of users) {
    const pw = u.role === 'ADMIN' ? 'admin123' : u.role === 'TEACHER' ? 'teacher123' : u.role === 'SUPER_ADMIN' ? 'superadmin123' : 'student123';
    const match = await bcrypt.compare(pw, u.password);
    console.log(`${u.email} (${u.role}) - password '${pw}' match: ${match}`);
  }
  
  await prisma.$disconnect();
})();
