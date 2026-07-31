import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

let cloudinary: typeof import("cloudinary").v2 | null = null;

async function getCloudinary() {
  if (cloudinary) return cloudinary;
  if (!process.env.CLOUDINARY_URL) return null;
  const mod = await import("cloudinary");
  mod.v2.config();
  cloudinary = mod.v2;
  return cloudinary;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN" && (session.user as { role: string }).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: "Fayl va userId kiritilishi shart" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Faqat rasm formatlarini yuklang (JPG, PNG, WebP, GIF)" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Fayl hajmi 5MB dan katta bo'lmasligi kerak" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cld = await getCloudinary();

    let avatarUrl: string;

    if (cld) {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cld!.uploader.upload_stream(
          { folder: "lms/avatars", public_id: `${userId}-${Date.now()}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string });
          }
        );
        stream.end(buffer);
      });
      avatarUrl = uploadResult.secure_url;
    } else {
      const avatarsDir = join(process.cwd(), "public", "avatars");
      await mkdir(avatarsDir, { recursive: true });
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${userId}-${Date.now()}.${ext}`;
      await writeFile(join(avatarsDir, fileName), buffer);
      avatarUrl = `/avatars/${fileName}`;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return NextResponse.json({ avatarUrl, message: "Rasm yuklandi" });
  } catch {
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
