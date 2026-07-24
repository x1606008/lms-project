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
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        teacherGroups: { select: { id: true, name: true } },
        studentGroups: {
          select: {
            group: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ user });
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

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        role: body.role,
        isActive: body.isActive,
      },
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true },
    });

    return NextResponse.json({ user });
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
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "O'chirildi" });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
