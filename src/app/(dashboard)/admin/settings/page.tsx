"use client";

export default function SettingsPage() {
  const items = [
    { label: "Loyiha nomi", value: "LMS - Ta'lim Boshqaruv Tizimi" },
    { label: "Versiya", value: "1.0.0" },
    { label: "Framework", value: "Next.js 16 + React 19" },
    { label: "ORM", value: "Prisma 6" },
    { label: "Database", value: "SQLite" },
    { label: "Auth", value: "NextAuth.js v5 (JWT)" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Tizim sozlamalari</h1>
      <div className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Ma&apos;lumot</h3>
        <div className="space-y-2 text-sm">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between py-2.5 animate-fade-in" style={{ animationDelay: `${0.15 + i * 0.05}s`, borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              <span>{item.label}</span>
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
