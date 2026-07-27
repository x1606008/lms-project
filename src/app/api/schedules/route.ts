import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { classScheduleSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const where: Record<string, unknown> = {};
    if (groupId) where.groupId = groupId;
    const schedules = await prisma.classSchedule.findMany({ where, include: { group: { select: { id: true, name: true } } }, orderBy: { dayOfWeek: "asc" } });
    return NextResponse.json({ schedules });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role === "STUDENT") return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    const body = await request.json();
    const parsed = classScheduleSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const { groupId, dayOfWeek, startTime, endTime } = parsed.data;
    const existing = await prisma.classSchedule.findUnique({ where: { groupId_dayOfWeek: { groupId, dayOfWeek } } });
    if (existing) {
      const updated = await prisma.classSchedule.update({ where: { id: existing.id }, data: { startTime, endTime } });
      return NextResponse.json({ schedule: updated });
    }
    const schedule = await prisma.classSchedule.create({ data: { groupId, dayOfWeek, startTime, endTime } });
    return NextResponse.json({ schedule }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
