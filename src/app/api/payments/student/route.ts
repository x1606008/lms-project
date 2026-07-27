import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const paymentId = searchParams.get("paymentId");
    const role = (session.user as { role: string }).role;
    const userId = (session.user as { id: string }).id;

    if (role === "STUDENT") {
      const studentGroups = await prisma.groupStudent.findMany({
        where: { studentId: userId },
        include: { group: { include: { payments: true, _count: { select: { students: true } } } } },
      });

      const result = studentGroups.map((sg) => {
        const group = sg.group;
        const latestPayment = group.payments.length > 0
          ? group.payments.sort((a, b) => b.year - a.year || b.month - a.month)[0]
          : null;

        return {
          groupId: group.id,
          groupName: group.name,
          studentCount: group._count.students,
          payment: latestPayment ? {
            id: latestPayment.id,
            amount: latestPayment.amount,
            perDay: latestPayment.perDay,
            month: latestPayment.month,
            year: latestPayment.year,
          } : null,
        };
      });

      return NextResponse.json({ payments: result });
    }

    if (role === "TEACHER") {
      const where: Record<string, unknown> = { group: { teacherId: userId } };
      if (groupId) where.groupId = groupId;
      if (paymentId) where.id = paymentId;

      const payments = await prisma.monthlyPayment.findMany({
        where,
        include: {
          group: {
            include: {
              students: { include: { student: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
              schedules: true,
            },
          },
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      });

      const enriched = await Promise.all(payments.map(async (p) => {
        const studentPayments = await Promise.all(
          p.group.students.map(async (gs) => {
            const attendance = await prisma.attendance.findMany({
              where: { groupId: p.groupId, studentId: gs.student.id },
            });
            const monthAttendances = attendance.filter((a) => {
              const d = new Date(a.date);
              return d.getMonth() + 1 === p.month && d.getFullYear() === p.year;
            });
            const daysAttended = monthAttendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
            const totalOwed = p.perDay * daysAttended;
            return {
              student: gs.student,
              daysAttended,
              totalDays: monthAttendances.length,
              totalOwed,
            };
          })
        );
        return { ...p, studentPayments };
      }));

      return NextResponse.json({ payments: enriched });
    }

    const where: Record<string, unknown> = {};
    if (groupId) where.groupId = groupId;
    if (paymentId) where.id = paymentId;

    const payments = await prisma.monthlyPayment.findMany({
      where,
      include: {
        group: {
          include: {
            students: { include: { student: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
            schedules: true,
          },
        },
        creator: { select: { name: true } },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const enriched = await Promise.all(payments.map(async (p) => {
      const studentPayments = await Promise.all(
        p.group.students.map(async (gs) => {
          const attendance = await prisma.attendance.findMany({
            where: { groupId: p.groupId, studentId: gs.student.id },
          });
          const monthAttendances = attendance.filter((a) => {
            const d = new Date(a.date);
            return d.getMonth() + 1 === p.month && d.getFullYear() === p.year;
          });
          const daysAttended = monthAttendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
          const totalOwed = p.perDay * daysAttended;
          return {
            student: gs.student,
            daysAttended,
            totalDays: monthAttendances.length,
            totalOwed,
          };
        })
      );
      return { ...p, studentPayments };
    }));

    return NextResponse.json({ payments: enriched });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
