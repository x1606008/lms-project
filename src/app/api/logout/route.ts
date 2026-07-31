import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/auth";

export async function GET(request: NextRequest) {
  await signOut({ redirect: false });
  const target = new URL("/login?callbackUrl=" + encodeURIComponent("/admin"), request.url);
  return NextResponse.redirect(target);
}
