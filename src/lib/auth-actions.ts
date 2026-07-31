"use server";

import { signOut } from "@/auth";
import { headers } from "next/headers";

export async function logout() {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const base = `${proto}://${host}`;
  await signOut({ redirectTo: `${base}/login?callbackUrl=${encodeURIComponent("/admin")}` });
}
