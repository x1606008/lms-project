import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { attendanceSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const date = searchParams.get("date");
    const role = (session.user as { role: string }).role;
    const userId = (session.user as { id: string }).id;

    const where: Record<string, unknown> = {};

    if (role === "STUDENT") {
      where.studentId = userId;
      if (groupId && groupId !== "all") where.groupId = groupId;
      if (date && date !== "all") where.date = new Date(date);
    } else {
      if (!groupId || !date) {
        return NextResponse.json(
          { error: "groupId va date kerak" },
          { status: 400 }
        );
      }
      where.groupId = groupId;
      where.date = new Date(date);
    }
    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ attendance });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = attendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { groupId, date, records } = parsed.data;
    const dateObj = new Date(date);

    for (const record of records) {
      await prisma.attendance.upsert({
        where: {
          groupId_studentId_date: {
            groupId,
            studentId: record.studentId,
            date: dateObj,
          },
        },
        update: { status: record.status },
        create: {
          groupId,
          studentId: record.studentId,
          date: dateObj,
          status: record.status,
        },
      });
    }

    return NextResponse.json({ message: "Davomat saqlandi" });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
