"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const navItems: Record<string, { label: string; href: string; icon: string }[]> = {
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Foydalanuvchilar", href: "/admin/users", icon: "👥" },
    { label: "Guruhlar", href: "/admin/groups", icon: "📋" },
    { label: "To'lovlar", href: "/admin/payments", icon: "💰" },
    { label: "Sozlamalar", href: "/admin/settings", icon: "⚙️" },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Foydalanuvchilar", href: "/admin/users", icon: "👥" },
    { label: "Guruhlar", href: "/admin/groups", icon: "📋" },
    { label: "To'lovlar", href: "/admin/payments", icon: "💰" },
    { label: "Sozlamalar", href: "/admin/settings", icon: "⚙️" },
  ],
  TEACHER: [
    { label: "Dashboard", href: "/teacher", icon: "📊" },
    { label: "Guruhlarim", href: "/teacher/groups", icon: "📋" },
    { label: "Davomat", href: "/teacher/attendance", icon: "✅" },
    { label: "Vazifalar", href: "/teacher/assignments", icon: "📝" },
    { label: "Baholash", href: "/teacher/grades", icon: "🎓" },
    { label: "To'lovlar", href: "/teacher/payments", icon: "💰" },
  ],
  STUDENT: [
    { label: "Dashboard", href: "/student", icon: "📊" },
    { label: "Vazifalarim", href: "/student/assignments", icon: "📝" },
    { label: "Baholarim", href: "/student/grades", icon: "🎓" },
    { label: "Davomat", href: "/student/attendance", icon: "✅" },
    { label: "To'lovlar", href: "/student/payments", icon: "💰" },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "STUDENT";
  const items = navItems[role] || [];

  return (
    <aside className="w-64 min-h-screen flex flex-col animate-fade-in-left" style={{ background: "linear-gradient(180deg, #12121a 0%, #0f0f14 100%)", borderRight: "1px solid var(--border)" }}>
      <div className="p-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg animate-pulse-glow" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            🎓
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">LMS Platform</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {(role === "ADMIN" || role === "SUPER_ADMIN") && "Administrator"}
              {role === "TEACHER" && "O'qituvchi paneli"}
              {role === "STUDENT" && "O'quvchi paneli"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item, i) => {
          const isActive =
            item.href === `/${role.toLowerCase()}`
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium animate-fade-in ${isActive ? "active" : ""}`}
              style={{
                animationDelay: `${i * 0.05}s`,
                color: isActive ? "var(--accent-hover)" : "var(--text-secondary)",
              }}
            >
              <span className="text-lg transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "white" }}>
            {session?.user?.name?.charAt(0) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{session?.user?.name}</p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{session?.user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { window.location.href = "/api/logout"; }}
          className="w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:translate-x-1"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--danger-bg)"; e.currentTarget.style.color = "var(--danger)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          🚪 Chiqish
        </button>
      </div>
    </aside>
  );
}
