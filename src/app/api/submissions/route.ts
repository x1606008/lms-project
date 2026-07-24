import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { submissionSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const role = (session.user as { role: string }).role;
    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    const where: Record<string, unknown> = {};
    if (assignmentId) where.assignmentId = assignmentId;

    if (role === "TEACHER") {
      const teacherGroups = await prisma.group.findMany({
        where: { teacherId: userId },
        select: { id: true },
      });
      const teacherAssignments = await prisma.assignment.findMany({
        where: { groupId: { in: teacherGroups.map((g) => g.id) } },
        select: { id: true },
      });
      where.assignmentId = {
        in: teacherAssignments.map((a) => a.id),
        ...(assignmentId ? { equals: assignmentId } : {}),
      };
    } else if (role === "STUDENT") {
      where.studentId = userId;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        assignment: {
          select: { id: true, title: true, maxScore: true, groupId: true },
        },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "STUDENT") {
      return NextResponse.json({ error: "Faqat o'quvchilar vazifa topshira oladi" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const userId = (session.user as { id: string }).id;
    const { assignmentId, content, fileUrl, fileName } = parsed.data;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Vazifa topilmadi" }, { status: 404 });
    }

    const now = new Date();
    if (now > assignment.dueDate) {
      return NextResponse.json(
        { error: "Vazifa muddati o'tgan" },
        { status: 400 }
      );
    }

    const existing = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId: userId } },
    });

    if (existing) {
      const updated = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          content,
          fileUrl,
          fileName,
          status: "PENDING",
          submittedAt: new Date(),
        },
      });
      return NextResponse.json({ submission: updated });
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: userId,
        content,
        fileUrl,
        fileName,
      },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
