"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/stat-card";

interface Submission { id: string; grade: number | null; feedback: string | null; submittedAt: string; assignment: { title: string; maxScore: number; group: { name: string } } }

export default function StudentGradesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/submissions").then((r) => r.json()).then((d) => { setSubmissions(d.submissions || []); setLoading(false); }); }, []);

  const graded = submissions.filter((s) => s.grade !== null);
  const avg = graded.length > 0 ? Math.round(graded.reduce((sum, s) => sum + ((s.grade || 0) / s.assignment.maxScore) * 100, 0) / graded.length) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Baholarim</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Jami topshirishlar" value={submissions.length} icon="📄" color="blue" delay={0.1} />
        <StatCard label="Baholangan" value={graded.length} icon="✅" color="green" delay={0.15} />
        <StatCard label="O'rtacha baho" value={`${avg}%`} icon="🎯" color="purple" delay={0.2} />
      </div>

      <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(99, 102, 241, 0.06)" }}>
              {["Vazifa", "Guruh", "Ball", "Foiz", "Izoh", "Topshirilgan"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: "var(--text-muted)" }}>Hali topshirishlar yo'q</td></tr>
            ) : submissions.map((s) => {
              const pct = s.grade !== null ? Math.round((s.grade / s.assignment.maxScore) * 100) : null;
              return (
                <tr key={s.id} className="table-row" style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-4 py-3 font-medium">{s.assignment.title}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{s.assignment.group.name}</td>
                  <td className="px-4 py-3 text-center font-medium">{s.grade !== null ? `${s.grade}/${s.assignment.maxScore}` : "—"}</td>
                  <td className="px-4 py-3">{pct !== null ? <span className={`badge ${pct >= 70 ? "badge-success" : pct >= 50 ? "badge-warning" : "badge-danger"}`}>{pct}%</span> : "—"}</td>
                  <td className="px-4 py-3 text-xs max-w-[160px] truncate" style={{ color: "var(--text-muted)" }}>{s.feedback || "—"}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{new Date(s.submittedAt).toLocaleDateString("uz-UZ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
