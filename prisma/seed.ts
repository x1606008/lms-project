import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function randomStatus(): string {
  const statuses = ["PRESENT", "PRESENT", "PRESENT", "ABSENT", "LATE"];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

async function main() {
  console.log("🔄 Seed boshlanmoqda...");

  const superAdminPassword = await bcrypt.hash("superadmin123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

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

  const teacher1 = await prisma.user.upsert({
    where: { email: "karimov@lms.uz" },
    update: {},
    create: {
      name: "Karimov Sardor",
      email: "karimov@lms.uz",
      password: teacherPassword,
      role: "TEACHER",
      phone: "+998902345678",
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: "aliyeva@lms.uz" },
    update: {},
    create: {
      name: "Aliyeva Nilufar",
      email: "aliyeva@lms.uz",
      password: teacherPassword,
      role: "TEACHER",
      phone: "+998903456789",
    },
  });

  const studentData = [
    { name: "Abdullayev Jasur", email: "jasur@lms.uz" },
    { name: "Rahimova Dildora", email: "dildora@lms.uz" },
    { name: "Toshmatov Bobur", email: "bobur@lms.uz" },
    { name: "Nazarova Sabohat", email: "sabohat@lms.uz" },
    { name: "Mirzayev Akbar", email: "akbar@lms.uz" },
    { name: "Hamrayeva Malika", email: "malika@lms.uz" },
    { name: "Ergashev Timur", email: "timur@lms.uz" },
    { name: "Sultanova Gulsara", email: "gulsara@lms.uz" },
  ];

  const students = [];
  for (const s of studentData) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        password: studentPassword,
        role: "STUDENT",
      },
    });
    students.push(student);
  }

  console.log("✅ Foydalanuvchilar yaratildi (11 ta)");

  const group1 = await prisma.group.upsert({
    where: { id: "group-math-101" },
    update: {},
    create: {
      id: "group-math-101",
      name: "Matematika-101",
      description: "10-sinf Matematika kursi — Algebra va Geometriya",
      teacherId: teacher1.id,
    },
  });

  const group2 = await prisma.group.upsert({
    where: { id: "group-physics-11a" },
    update: {},
    create: {
      id: "group-physics-11a",
      name: "Fizika-11A",
      description: "11-sinf Fizika kursi — Meksanika va Elektrodinamika",
      teacherId: teacher2.id,
    },
  });

  console.log("✅ Guruhlar yaratildi (2 ta)");

  for (let i = 0; i < 5; i++) {
    await prisma.groupStudent.upsert({
      where: { groupId_studentId: { groupId: group1.id, studentId: students[i].id } },
      update: {},
      create: { groupId: group1.id, studentId: students[i].id },
    });
  }

  for (let i = 5; i < 8; i++) {
    await prisma.groupStudent.upsert({
      where: { groupId_studentId: { groupId: group2.id, studentId: students[i].id } },
      update: {},
      create: { groupId: group2.id, studentId: students[i].id },
    });
  }

  console.log("✅ O'quvchilar guruhlarga biriktirildi");

  const assignment1 = await prisma.assignment.create({
    data: {
      title: "1-topshiriq: Algebraik ifodalar",
      description:
        "Quyidagi kvadrat tenglamalarni yeching:\n1) x² + 5x + 6 = 0\n2) 2x² - 3x - 2 = 0\n3) x² - 9 = 0\n\nJavoblarni to'liq yechim bilan yozing.",
      dueDate: new Date("2026-08-01"),
      maxScore: 100,
      groupId: group1.id,
      isPublished: true,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: "2-topshiriq: Kvadrat tenglamalar",
      description:
        "Diskriminant orasida yeching:\n1) x² - 4x + 4 = 0\n2) 3x² + 2x - 1 = 0\n3) x² + x - 6 = 0\n\nHar bir masolada D ni hisoblang.",
      dueDate: new Date("2026-08-10"),
      maxScore: 100,
      groupId: group1.id,
      isPublished: true,
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      title: "Fizika - Nyuton qonunlari",
      description:
        "Nyutonning ikkinchi qonunini tushuntiring (F = ma).\nQuyidagi masalalarni yeching:\n1) 5 kg massa 10 m/s² tezlanish bilan harakatlansa, kuch necha N?\n2) 20 N kuch ta'sirida 4 kg massali jism necha m/s² tezlanadi?",
      dueDate: new Date("2026-08-05"),
      maxScore: 100,
      groupId: group2.id,
      isPublished: true,
    },
  });

  console.log("✅ Vazifalar yaratildi (3 ta)");

  const today = new Date();
  let attCount = 0;
  for (let dayOffset = 0; dayOffset < 15; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (let i = 0; i < 5; i++) {
      try {
        await prisma.attendance.create({
          data: {
            date,
            status: randomStatus(),
            groupId: group1.id,
            studentId: students[i].id,
          },
        });
        attCount++;
      } catch {
        // duplicate — skip
      }
    }
  }

  console.log(`✅ Davomat yozuvlari yaratildi (${attCount} ta)`);

  try {
    await prisma.submission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: students[0].id,
        content:
          "1) x² + 5x + 6 = 0\n   (x+2)(x+3) = 0\n   x = -2, x = -3\n\n2) 2x² - 3x - 2 = 0\n   (2x+1)(x-2) = 0\n   x = -0.5, x = 2\n\n3) x² - 9 = 0\n   (x+3)(x-3) = 0\n   x = -3, x = 3",
        status: "GRADED",
        grade: 95,
        feedback: "Ajoyib ish! Barcha javoblar to'g'ri va yechimlar to'liq yozilgan.",
        gradedAt: new Date(),
      },
    });

    await prisma.submission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: students[1].id,
        content:
          "1) (x+2)(x+3) = 0 => x = -2, x = -3\n2) (2x+1)(x-2) = 0 => x = 2, x = -0.5",
        status: "GRADED",
        grade: 78,
        feedback: "2-masola to'g'ri, lekin 3-masolani yechmadingiz. Qayta urinib ko'ring.",
        gradedAt: new Date(),
      },
    });

    await prisma.submission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: students[2].id,
        content: "x = -2, x = -3, x = 2, x = -0.5, x = -3, x = 3",
        status: "PENDING",
      },
    });

    await prisma.submission.create({
      data: {
        assignmentId: assignment3.id,
        studentId: students[5].id,
        content:
          "Nyutonning ikkinchi qonuni: F = ma\n\n1) F = 5 * 10 = 50 N\n2) a = F/m = 20/4 = 5 m/s²",
        status: "PENDING",
      },
    });
  } catch {
    // submissions already exist
  }

  console.log("✅ Submissions yaratildi (4 ta)");

  const totalUsers = await prisma.user.count();
  const totalGroups = await prisma.group.count();
  const totalAssignments = await prisma.assignment.count();
  const totalSubmissions = await prisma.submission.count();
  const totalAttendance = await prisma.attendance.count();

  console.log("\n📊 SEED NATIJALARI:");
  console.log(`   Foydalanuvchilar:   ${totalUsers}`);
  console.log(`   Guruhlar:           ${totalGroups}`);
  console.log(`   Vazifalar:          ${totalAssignments}`);
  console.log(`   Submissions:        ${totalSubmissions}`);
  console.log(`   Davomat yozuvlari:  ${totalAttendance}`);

  console.log("\n🔑 TEST LOGINLAR:");
  console.log("   Super Admin: superadmin@lms.uz / superadmin123");
  console.log("   Admin:       admin@lms.uz      / admin123");
  console.log("   O'qituvchi:  karimov@lms.uz    / teacher123");
  console.log("   O'quvchi:    jasur@lms.uz      / student123");
}

main()
  .catch((e) => {
    console.error("❌ Seed xatolik:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
