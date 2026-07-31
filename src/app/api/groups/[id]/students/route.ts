import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id } = await params;
    const groupStudents = await prisma.groupStudent.findMany({
      where: { groupId: id },
      include: {
        student: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return NextResponse.json({ students: groupStudents });
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
    if (!session || (session.user as { role: string }).role !== "ADMIN" && (session.user as { role: string }).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.groupStudent.findUnique({
      where: { groupId_studentId: { groupId: id, studentId: body.studentId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu o'quvchi allaqachon guruhda" },
        { status: 409 }
      );
    }

    const groupStudent = await prisma.groupStudent.create({
      data: { groupId: id, studentId: body.studentId },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ groupStudent }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN" && (session.user as { role: string }).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await prisma.groupStudent.delete({
      where: { groupId_studentId: { groupId: id, studentId: body.studentId } },
    });

    return NextResponse.json({ message: "O'quvchi guruhdan o'chirildi" });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
