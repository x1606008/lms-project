"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/stat-card";

interface AttendanceItem { id: string; date: string; status: string; group: { name: string } }

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/attendance?groupId=all&date=all").then((r) => r.json()).then((d) => { setAttendance(d.attendance || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;
  const late = attendance.filter((a) => a.status === "LATE").length;
  const total = attendance.length;
  const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  const statusLabel: Record<string, string> = { PRESENT: "Keldi", ABSENT: "Kelmadi", LATE: "Sababli" };
  const statusBadge: Record<string, string> = { PRESENT: "badge-success", ABSENT: "badge-danger", LATE: "badge-warning" };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Davomat jurnali</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Jami darslar" value={total} icon="📅" color="blue" delay={0.1} />
        <StatCard label="Keldi" value={present} icon="✅" color="green" delay={0.15} />
        <StatCard label="Kelmadi" value={absent} icon="❌" color="red" delay={0.2} />
        <StatCard label="Davomat %" value={`${pct}%`} icon="📊" color="purple" delay={0.25} />
      </div>

      {total > 0 && (
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="w-full rounded-full h-4" style={{ background: "var(--border)" }}>
            <div className="h-4 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--success), #22c55e)" }} />
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(99, 102, 241, 0.06)" }}>
              {["Sana", "Guruh", "Holat"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</td></tr>
            ) : attendance.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8" style={{ color: "var(--text-muted)" }}>Davomat ma'lumotlari topilmadi</td></tr>
            ) : attendance.map((a) => (
              <tr key={a.id} className="table-row" style={{ borderTop: "1px solid var(--border)" }}>
                <td className="px-4 py-3">{new Date(a.date).toLocaleDateString("uz-UZ")}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{a.group.name}</td>
                <td className="px-4 py-3"><span className={`badge ${statusBadge[a.status]}`}>{statusLabel[a.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
