"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    const role = (session.user as { role: string }).role;
    const dashboards: Record<string, string> = {
      ADMIN: "/admin",
      TEACHER: "/teacher",
      STUDENT: "/student",
    };

    router.push(dashboards[role] || "/login");
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Yuklanmoqda...</p>
      </div>
    </div>
  );
}
