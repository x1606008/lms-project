import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        group: { select: { id: true, name: true } },
        submissions: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Vazifa topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        maxScore: body.maxScore,
        isPublished: body.isPublished,
      },
      include: {
        group: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ assignment });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.assignment.delete({ where: { id } });

    return NextResponse.json({ message: "Vazifa o'chirildi" });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
