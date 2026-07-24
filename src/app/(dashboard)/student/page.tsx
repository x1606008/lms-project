"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";

export default function StudentDashboard() {
  const [stats, setStats] = useState({ groups: 0, assignments: 0, submitted: 0, avgGrade: 0 });

  useEffect(() => {
    async function load() {
      const [gRes, aRes, sRes] = await Promise.all([fetch("/api/groups"), fetch("/api/assignments"), fetch("/api/submissions")]);
      const s = (await sRes.json()).submissions || [];
      const graded = s.filter((sub: { grade: number | null }) => sub.grade !== null);
      const avg = graded.length > 0 ? Math.round(graded.reduce((sum: number, sub: { grade: number; assignment: { maxScore: number } }) => sum + (sub.grade / sub.assignment.maxScore) * 100, 0) / graded.length) : 0;
      setStats({
        groups: ((await gRes.json()).groups || []).length,
        assignments: ((await aRes.json()).assignments || []).length,
        submitted: s.length,
        avgGrade: avg,
      });
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Guruhlarim" value={stats.groups} icon="📋" color="blue" delay={0.1} />
        <StatCard label="Vazifalar" value={stats.assignments} icon="📝" color="purple" delay={0.15} />
        <StatCard label="Topshirilgan" value={stats.submitted} icon="✅" color="green" delay={0.2} />
        <StatCard label="O'rtacha baho" value={`${stats.avgGrade}%`} icon="🎯" color={stats.avgGrade >= 70 ? "green" : "yellow"} delay={0.25} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Tezkor harakatlar</h3>
          <div className="space-y-3">
            {[
              { href: "/student/assignments", icon: "📝", label: "Vazifalarimni ko'rish" },
              { href: "/student/grades", icon: "🎓", label: "Baholarimni ko'rish" },
              { href: "/student/attendance", icon: "✅", label: "Davomat jurnalini ko'rish" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="block p-3 rounded-lg text-sm transition-all duration-200 hover:translate-x-1" style={{ background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.1)", color: "var(--text-secondary)" }}>
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>O'zlashtirish</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Umumiy baho</span>
                <span className="font-medium">{stats.avgGrade}%</span>
              </div>
              <div className="w-full rounded-full h-3" style={{ background: "var(--border)" }}>
                <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${stats.avgGrade}%`, background: stats.avgGrade >= 70 ? "var(--success)" : stats.avgGrade >= 50 ? "var(--warning)" : "var(--danger)" }} />
              </div>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {stats.avgGrade >= 80 ? "Ajoyib natija! Davom eting! 🌟" : stats.avgGrade >= 60 ? "Yaxshi, lekin yana yaxshilash mumkin. 💪" : "Ko'proq harakat qiling. 📚"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
