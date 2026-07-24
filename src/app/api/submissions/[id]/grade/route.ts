import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gradeSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id } = await params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ submission });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Faqat o'qituvchilar baholay oladi" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = gradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { assignment: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission topilmadi" }, { status: 404 });
    }

    if (parsed.data.grade > submission.assignment.maxScore) {
      return NextResponse.json(
        { error: `Ball ${submission.assignment.maxScore} dan katta bo'lishi mumkin emas` },
        { status: 400 }
      );
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        grade: parsed.data.grade,
        feedback: parsed.data.feedback,
        status: "GRADED",
        gradedAt: new Date(),
      },
    });

    return NextResponse.json({ submission: updated });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
