"use client";

import { useEffect, useState } from "react";

interface Submission { id: string; content: string | null; status: string; grade: number | null; feedback: string | null; submittedAt: string; assignment: { id: string; title: string; maxScore: number }; student: { id: string; name: string; email: string } }

export default function GradesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: 0, feedback: "" });

  const loadData = async () => {
    setLoading(true);
    const res = await fetch("/api/submissions");
    setSubmissions((await res.json()).submissions || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleGrade = async (id: string) => {
    const res = await fetch(`/api/submissions/${id}/grade`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(gradeForm) });
    if (res.ok) { setGradingId(null); setGradeForm({ grade: 0, feedback: "" }); loadData(); }
  };

  const statusLabel: Record<string, string> = { PENDING: "Tekshirilmagan", GRADED: "Baholangan", RETURNED: "Qaytarilgan" };
  const statusBadge: Record<string, string> = { PENDING: "badge-warning", GRADED: "badge-success", RETURNED: "badge-info" };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Baholash</h1>
      <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(99, 102, 241, 0.06)" }}>
              {["O'quvchi", "Vazifa", "Javob", "Holat", "Ball", "Amal"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: "var(--text-muted)" }}>Topshirishlar yo'q</td></tr>
            ) : submissions.map((s) => (
              <tr key={s.id} className="table-row" style={{ borderTop: "1px solid var(--border)" }}>
                <td className="px-4 py-3"><div className="font-medium">{s.student.name}</div><div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.student.email}</div></td>
                <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{s.assignment.title}</td>
                <td className="px-4 py-3">
                  <div className="text-xs max-w-[160px] truncate" style={{ color: "var(--text-secondary)" }}>{s.content || "Fayl yuklangan"}</div>
                  {s.feedback && <div className="text-xs mt-0.5 truncate max-w-[160px]" style={{ color: "var(--accent-hover)" }}>💬 {s.feedback.slice(0, 30)}...</div>}
                </td>
                <td className="px-4 py-3"><span className={`badge ${statusBadge[s.status]}`}>{statusLabel[s.status]}</span></td>
                <td className="px-4 py-3 text-center font-medium">{s.grade !== null ? `${s.grade}/${s.assignment.maxScore}` : "—"}</td>
                <td className="px-4 py-3">
                  {gradingId === s.id ? (
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} max={s.assignment.maxScore} value={gradeForm.grade} onChange={(e) => setGradeForm({ ...gradeForm, grade: Number(e.target.value) })} className="input-dark w-16 px-2 py-1 rounded-lg text-sm text-center" />
                      <button onClick={() => handleGrade(s.id)} className="btn-primary px-2 py-1 rounded-lg text-xs"><span>✓</span></button>
                      <button onClick={() => setGradingId(null)} className="btn-ghost px-2 py-1 rounded-lg text-xs">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setGradingId(s.id); setGradeForm({ grade: 0, feedback: "" }); }} className="text-xs font-medium transition-colors" style={{ color: "var(--accent-hover)" }}>
                      {s.status === "GRADED" ? "Tahrirlash" : "Baholash"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
