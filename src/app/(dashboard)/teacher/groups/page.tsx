"use client";

import { useEffect, useState } from "react";

interface Group { id: string; name: string; description: string | null; _count: { students: number; assignments: number } }

export default function TeacherGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/groups").then((r) => r.json()).then((d) => { setGroups(d.groups || []); setLoading(false); });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Guruhlarim</h1>
      {loading ? (
        <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</p>
      ) : groups.length === 0 ? (
        <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>Guruhlar topilmadi</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g, i) => (
            <div key={g.id} className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{g.name}</h3>
              {g.description && <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{g.description}</p>}
              <div className="mt-4 flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                <span>👥 {g._count.students} o'quvchi</span>
                <span>📝 {g._count.assignments} vazifa</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
