"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/stat-card";

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ groups: 0, students: 0, assignments: 0, pending: 0 });

  useEffect(() => {
    async function load() {
      const [gRes, aRes, sRes] = await Promise.all([fetch("/api/groups"), fetch("/api/assignments"), fetch("/api/submissions")]);
      const g = (await gRes.json()).groups || [];
      const a = (await aRes.json()).assignments || [];
      const s = (await sRes.json()).submissions || [];
      setStats({
        groups: g.length,
        students: g.reduce((sum: number, gr: { _count?: { students: number } }) => sum + (gr._count?.students || 0), 0),
        assignments: a.length,
        pending: s.filter((sub: { status: string }) => sub.status === "PENDING").length,
      });
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">O&apos;qituvchi Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Guruhlarim" value={stats.groups} icon="📋" color="blue" delay={0.1} />
        <StatCard label="O'quvchilar" value={stats.students} icon="👥" color="green" delay={0.15} />
        <StatCard label="Vazifalar" value={stats.assignments} icon="📝" color="purple" delay={0.2} />
        <StatCard label="Tekshirilmagan" value={stats.pending} icon="⏳" color="yellow" delay={0.25} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Tezkor harakatlar</h3>
          <div className="space-y-3">
            {[
              { href: "/teacher/attendance", icon: "✅", label: "Davomat olish" },
              { href: "/teacher/assignments", icon: "📝", label: "Vazifa yaratish" },
              { href: "/teacher/grades", icon: "🎓", label: "Baholash" },
            ].map((item) => (
              <a key={item.href} href={item.href} className="block p-3 rounded-lg text-sm transition-all duration-200 hover:translate-x-1" style={{ background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.1)", color: "var(--text-secondary)" }}>
                {item.icon} {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Eslatma</h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {stats.pending > 0 ? `${stats.pending} ta topshirishni baholash kerak.` : "Barcha topshirishlar baholangan. 👍"}
          </p>
        </div>
      </div>
    </div>
  );
}
