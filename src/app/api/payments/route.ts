import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { monthlyPaymentSchema } from "@/lib/validations";

function countClassDays(schedules: { dayOfWeek: number }[], month: number, year: number): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const jsDay = date.getDay();
    const mappedDay = jsDay === 0 ? 6 : jsDay - 1;
    if (schedules.some((s) => s.dayOfWeek === mappedDay)) count++;
  }
  return count;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const where: Record<string, unknown> = {};
    if (groupId) where.groupId = groupId;
    const payments = await prisma.monthlyPayment.findMany({ where, include: { group: { select: { id: true, name: true } } }, orderBy: [{ year: "desc" }, { month: "desc" }] });
    return NextResponse.json({ payments });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role === "STUDENT") return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    const body = await request.json();
    const parsed = monthlyPaymentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const { groupId, amount, month, year } = parsed.data;
    const userId = (session.user as { id: string }).id;
    const schedules = await prisma.classSchedule.findMany({ where: { groupId } });
    if (schedules.length === 0) return NextResponse.json({ error: "Avval dars jadvalini belgilang" }, { status: 400 });
    const classDays = countClassDays(schedules, month, year);
    if (classDays === 0) return NextResponse.json({ error: "Bu oyda dars kunlari yo'q" }, { status: 400 });
    const perDay = Math.round(amount / classDays);
    const existing = await prisma.monthlyPayment.findUnique({ where: { groupId_month_year: { groupId, month, year } } });
    if (existing) {
      const updated = await prisma.monthlyPayment.update({ where: { id: existing.id }, data: { amount, perDay } });
      return NextResponse.json({ payment: updated, classDays });
    }
    const payment = await prisma.monthlyPayment.create({ data: { groupId, amount, month, year, perDay, createdBy: userId } });
    return NextResponse.json({ payment, classDays }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
