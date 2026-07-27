import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assignmentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const role = (session.user as { role: string }).role;
    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    const where: Record<string, unknown> = {};
    if (groupId) where.groupId = groupId;

    if (role === "TEACHER") {
      const teacherGroups = await prisma.group.findMany({
        where: { teacherId: userId },
        select: { id: true },
      });
      const teacherGroupIds = teacherGroups.map((g) => g.id);
      if (groupId && teacherGroupIds.includes(groupId)) {
        where.groupId = groupId;
      } else if (groupId) {
        where.groupId = "__NONE__";
      } else {
        where.groupId = { in: teacherGroupIds };
      }
    } else if (role === "STUDENT") {
      const studentGroupIds = await prisma.groupStudent.findMany({
        where: { studentId: userId },
        select: { groupId: true },
      });
      where.groupId = { in: studentGroupIds.map((sg) => sg.groupId) };
      where.isPublished = true;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        group: { select: { id: true, name: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assignments });
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
    const parsed = assignmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        dueDate: new Date(parsed.data.dueDate),
        maxScore: parsed.data.maxScore,
        groupId: parsed.data.groupId,
        isPublished: parsed.data.isPublished ?? false,
      },
      include: {
        group: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
