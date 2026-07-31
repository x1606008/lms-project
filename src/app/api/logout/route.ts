import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/auth";

export async function GET(request: NextRequest) {
  await signOut({ redirect: false });
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const base = `${proto}://${host}`;
  const target = new URL("/login?callbackUrl=" + encodeURIComponent("/admin"), base);
  return NextResponse.redirect(target);
}
