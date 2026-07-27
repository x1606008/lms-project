import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(chatId: number, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || body.callback_query?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text: string = message.text || "";
    const telegramUsername = message.from?.username || null;

    if (!text.startsWith("/start ")) {
      await sendMessage(chatId, "Assalomu alaykum! LMS platformasiga bog'lanish uchun /start <token> buyrug'ini yuboring.");
      return NextResponse.json({ ok: true });
    }

    const token = text.slice(7).trim();
    if (!token || token.length < 10) {
      await sendMessage(chatId, "Noto'g'ri token. Iltimos, to'g'ri token yuboring.");
      return NextResponse.json({ ok: true });
    }

    const bindingToken = await prisma.telegramBindingToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!bindingToken) {
      await sendMessage(chatId, "Token topilmadi. Iltimos, yangi token oling.");
      return NextResponse.json({ ok: true });
    }

    if (bindingToken.used) {
      await sendMessage(chatId, "Bu token allaqachon ishlatilgan. Yangi token olishingiz kerak.");
      return NextResponse.json({ ok: true });
    }

    if (new Date() > bindingToken.expiresAt) {
      await sendMessage(chatId, "Token muddati tugagan. Yangi token oling.");
      return NextResponse.json({ ok: true });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        telegramChatId: String(chatId),
        id: { not: bindingToken.userId },
      },
    });

    if (existingUser) {
      await sendMessage(chatId, "Bu Telegram akkaunt boshqa foydalanuvchi bilan bog'langan.");
      return NextResponse.json({ ok: true });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: bindingToken.userId },
        data: {
          telegramChatId: String(chatId),
          telegramUsername,
        },
      }),
      prisma.telegramBindingToken.update({
        where: { id: bindingToken.id },
        data: { used: true },
      }),
    ]);

    const roleLabel: Record<string, string> = {
      ADMIN: "Administrator",
      TEACHER: "O'qituvchi",
      STUDENT: "O'quvchi",
      PARENT: "Ota-ona",
      SUPER_ADMIN: "Super Admin",
    };

    await sendMessage(
      chatId,
      `✅ Telegram akkaunt muvaffaqiyatli bog'landi!\n\n` +
      `👤 <b>${bindingToken.user.name}</b>\n` +
      `🎭 Rol: ${roleLabel[bindingToken.user.role] || bindingToken.user.role}\n` +
      `📧 Email: ${bindingToken.user.email}\n\n` +
      `Endi sizga LMS platformasidan bildirishnomalar keladi.`
    );

    return NextResponse.json({ ok: true, bound: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", message: "Telegram webhook is running" });
}
