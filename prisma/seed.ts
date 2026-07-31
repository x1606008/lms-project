import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Seed boshlanmoqda...");

  const superAdminPassword = await bcrypt.hash("superadmin123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@lms.uz" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@lms.uz",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
      phone: "+998900000000",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@lms.uz" },
    update: {},
    create: {
      name: "Tizim Administratori",
      email: "admin@lms.uz",
      password: adminPassword,
      role: "ADMIN",
      phone: "+998901234567",
    },
  });

  console.log("✅ Administratorlar yaratildi");

  const totalUsers = await prisma.user.count();

  console.log("\n📊 SEED NATIJALARI:");
  console.log(`   Foydalanuvchilar:   ${totalUsers}`);

  console.log("\n🔑 TEST LOGINLAR:");
  console.log(`   Super Admin: superadmin@lms.uz / superadmin123 (${superAdmin.id})`);
  console.log(`   Admin:       admin@lms.uz      / admin123      (${admin.id})`);
}

main()
  .catch((e) => {
    console.error("❌ Seed xatolik:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
