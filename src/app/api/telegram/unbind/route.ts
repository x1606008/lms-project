import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const role = (session.user as { role: string }).role;
    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const targetUserId = body.userId as string | undefined;

    let uid = userId;
    if (targetUserId && ["ADMIN", "SUPER_ADMIN"].includes(role)) {
      uid = targetUserId;
    } else if (targetUserId && targetUserId !== userId) {
      return NextResponse.json({ error: "Boshqa foydalanuvchini bog'lashni bekor qilib bo'lmaydi" }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: uid },
      data: { telegramChatId: null, telegramUsername: null },
    });

    return NextResponse.json({ message: "Telegram bog'lash bekor qilindi" });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
