import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { groupSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const role = (session.user as { role: string }).role;
    const userId = (session.user as { id: string }).id;

    let groups;

    if (role === "ADMIN") {
      groups = await prisma.group.findMany({
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          _count: { select: { students: true, assignments: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "TEACHER") {
      groups = await prisma.group.findMany({
        where: { teacherId: userId },
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          _count: { select: { students: true, assignments: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      const studentGroups = await prisma.groupStudent.findMany({
        where: { studentId: userId },
        include: {
          group: {
            include: {
              teacher: { select: { id: true, name: true, email: true } },
              _count: { select: { students: true, assignments: true } },
            },
          },
        },
      });
      groups = studentGroups.map((sg) => sg.group);
    }

    return NextResponse.json({ groups });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = groupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: parsed.data,
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { students: true } },
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
