"use client";

import { useEffect, useState } from "react";

interface Submission { id: string; content: string | null; status: string; grade: number | null; feedback: string | null; submittedAt: string; assignment: { id: string; title: string; maxScore: number }; student: { id: string; name: string; email: string } }

export default function GradesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: 0, feedback: "" });
  const [viewContent, setViewContent] = useState<Submission | null>(null);
  const [filter, setFilter] = useState("ALL");

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

  const filtered = filter === "ALL" ? submissions : submissions.filter((s) => s.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Baholash</h1>

      <div className="flex gap-2 mb-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        {[
          { key: "ALL", label: "Hammasi" },
          { key: "PENDING", label: "Tekshirilmagan" },
          { key: "GRADED", label: "Baholangan" },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: filter === f.key ? "var(--accent)" : "rgba(99, 102, 241, 0.08)", color: filter === f.key ? "white" : "var(--text-secondary)" }}>
            {f.label}
          </button>
        ))}
      </div>

      {viewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setViewContent(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-scale-in" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold gradient-text">{viewContent.student.name}</h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{viewContent.assignment.title}</p>
              </div>
              <button onClick={() => setViewContent(null)} className="text-lg" style={{ color: "var(--text-muted)" }}>&#10005;</button>
            </div>
            <div className="p-4 rounded-xl text-sm whitespace-pre-wrap" style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              {viewContent.content || "Javob kiritilmagan"}
            </div>
            {viewContent.feedback && (
              <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)", color: "var(--accent-hover)" }}>
                Izoh: {viewContent.feedback}
              </div>
            )}
          </div>
        </div>
      )}

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
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: "var(--text-muted)" }}>Topshirishlar yo'q</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id} className="table-row" style={{ borderTop: "1px solid var(--border)" }}>
                <td className="px-4 py-3"><div className="font-medium">{s.student.name}</div><div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.student.email}</div></td>
                <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{s.assignment.title}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setViewContent(s)} className="text-xs font-medium transition-colors hover:underline" style={{ color: "var(--accent-hover)" }}>
                    {s.content ? `${s.content.slice(0, 30)}...` : "Fayl yuklangan"}
                  </button>
                </td>
                <td className="px-4 py-3"><span className={`badge ${statusBadge[s.status]}`}>{statusLabel[s.status]}</span></td>
                <td className="px-4 py-3 text-center font-medium">{s.grade !== null ? `${s.grade}/${s.assignment.maxScore}` : "—"}</td>
                <td className="px-4 py-3">
                  {gradingId === s.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="number" min={0} max={s.assignment.maxScore} value={gradeForm.grade} onChange={(e) => setGradeForm({ ...gradeForm, grade: Number(e.target.value) })} className="input-dark w-16 px-2 py-1 rounded-lg text-sm text-center" placeholder="Ball" />
                        <button onClick={() => handleGrade(s.id)} className="btn-primary px-2 py-1 rounded-lg text-xs"><span>&#10003;</span></button>
                        <button onClick={() => setGradingId(null)} className="btn-ghost px-2 py-1 rounded-lg text-xs">&#10005;</button>
                      </div>
                      <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="Izoh (ixtiyoriy)..." className="input-dark w-full px-2 py-1 rounded-lg text-xs h-16" />
                    </div>
                  ) : (
                    <button onClick={() => { setGradingId(s.id); setGradeForm({ grade: s.grade || 0, feedback: s.feedback || "" }); }} className="text-xs font-medium transition-colors" style={{ color: "var(--accent-hover)" }}>
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
