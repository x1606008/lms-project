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
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        students: {
          include: {
            student: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        assignments: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { submissions: true } },
          },
        },
        _count: { select: { students: true, assignments: true } },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ group });
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
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const group = await prisma.group.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        teacherId: body.teacherId,
      },
      include: {
        teacher: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ group });
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
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.group.delete({ where: { id } });

    return NextResponse.json({ message: "Guruh o'chirildi" });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
