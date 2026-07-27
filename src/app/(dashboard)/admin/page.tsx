"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, groups: 0, assignments: 0, students: 0, teachers: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, groupsRes, assignmentsRes] = await Promise.all([
          fetch("/api/users"), fetch("/api/groups"), fetch("/api/assignments"),
        ]);
        const usersData = await usersRes.json();
        const groupsData = await groupsRes.json();
        const assignmentsData = await assignmentsRes.json();
        const users = usersData.users || [];
        setStats({
          users: users.length,
          groups: (groupsData.groups || []).length,
          assignments: (assignmentsData.assignments || []).length,
          students: users.filter((u: { role: string }) => u.role === "STUDENT").length,
          teachers: users.filter((u: { role: string }) => u.role === "TEACHER").length,
        });
      } catch {}
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Jami foydalanuvchilar" value={stats.users} icon="👥" color="blue" delay={0.1} />
        <StatCard label="O'quvchilar" value={stats.students} icon="🎓" color="green" delay={0.15} />
        <StatCard label="O'qituvchilar" value={stats.teachers} icon="👨‍🏫" color="purple" delay={0.2} />
        <StatCard label="Guruhlar" value={stats.groups} icon="📋" color="yellow" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Tezkor harakatlar</h3>
          <div className="space-y-3">
            {[
              { href: "/admin/users", icon: "👥", label: "Foydalanuvchilarni boshqarish" },
              { href: "/admin/groups", icon: "📋", label: "Guruhlarni boshqarish" },
              { href: "/admin/settings", icon: "⚙️", label: "Tizim sozlamalari" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="block p-3 rounded-lg text-sm transition-all duration-200 hover:translate-x-1" style={{ background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.1)", color: "var(--text-secondary)" }}>
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Tizim haqida</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}><span>Versiya</span><span className="font-medium" style={{ color: "var(--text-primary)" }}>1.0.0</span></div>
            <div className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}><span>Framework</span><span className="font-medium" style={{ color: "var(--text-primary)" }}>Next.js 16 + React 19</span></div>
            <div className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}><span>ORM</span><span className="font-medium" style={{ color: "var(--text-primary)" }}>Prisma 6</span></div>
            <div className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}><span>Database</span><span className="font-medium" style={{ color: "var(--text-primary)" }}>SQLite</span></div>
            <div className="flex justify-between py-2"><span>Auth</span><span className="font-medium" style={{ color: "var(--text-primary)" }}>NextAuth.js v5</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
