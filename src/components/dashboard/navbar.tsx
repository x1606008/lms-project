"use client";

import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "";

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrator",
    TEACHER: "O'qituvchi",
    STUDENT: "O'quvchi",
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 animate-fade-in" style={{ background: "rgba(15, 15, 20, 0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {roleLabel[role] || role}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{session?.user?.name}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{session?.user?.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 hover:scale-110 hover:shadow-lg" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "white", boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" }}>
          {session?.user?.name?.charAt(0) || "?"}
        </div>
      </div>
    </header>
  );
}
