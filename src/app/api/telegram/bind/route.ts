import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const role = (session.user as { role: string }).role;
    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const targetUserId = body.userId as string | undefined;

    if (role === "STUDENT") {
      if (targetUserId && targetUserId !== userId) {
        return NextResponse.json({ error: "Boshqa foydalanuvchi uchun token yaratib bo'lmaydi" }, { status: 403 });
      }
    } else if (!["ADMIN", "SUPER_ADMIN", "TEACHER"].includes(role)) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const uid = role === "STUDENT" ? userId : (targetUserId || userId);

    await prisma.telegramBindingToken.updateMany({
      where: { userId: uid, used: false },
      data: { used: true },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const bindingToken = await prisma.telegramBindingToken.create({
      data: {
        token,
        userId: uid,
        expiresAt,
      },
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "YOUR_BOT_USERNAME";
    const startUrl = `https://t.me/${botUsername}?start=${bindingToken.token}`;

    return NextResponse.json({
      token: bindingToken.token,
      startUrl,
      expiresAt: bindingToken.expiresAt,
      message: "Token yaratildi. Telegram botga /start <token> yuboring yoki havolaga bosing.",
    });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const role = (session.user as { role: string }).role;

    let targetUserId = userId;
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    if (queryUserId && ["ADMIN", "SUPER_ADMIN", "TEACHER"].includes(role)) {
      targetUserId = queryUserId;
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { telegramChatId: true, telegramUsername: true },
    });

    return NextResponse.json({
      telegramChatId: user?.telegramChatId || null,
      telegramUsername: user?.telegramUsername || null,
      isBound: !!user?.telegramChatId,
    });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
