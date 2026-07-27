"use client";

import { useEffect, useState } from "react";

interface Assignment { id: string; title: string; description: string | null; dueDate: string; maxScore: number; group: { name: string } }
interface Submission { id: string; content: string | null; status: string; grade: number | null; feedback: string | null; assignmentId: string }

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [viewSubmission, setViewSubmission] = useState<Submission & { assignment: Assignment } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [aRes, sRes] = await Promise.all([fetch("/api/assignments"), fetch("/api/submissions")]);
    setAssignments((await aRes.json()).assignments || []);
    setSubmissions((await sRes.json()).submissions || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (assignmentId: string) => {
    const res = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignmentId, content: answer }) });
    if (res.ok) { setSubmittingId(null); setAnswer(""); loadData(); }
  };

  const getSubmission = (assignmentId: string) => submissions.find((s) => s.assignmentId === assignmentId);

  const viewDetails = async (sub: Submission, assignment: Assignment) => {
    setViewSubmission({ ...sub, assignment });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Vazifalarim</h1>

      {viewSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setViewSubmission(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass-card rounded-2xl p-6 w-full max-w-lg animate-scale-in" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold gradient-text">Javob tafsilotlari</h2>
              <button onClick={() => setViewSubmission(null)} className="text-lg" style={{ color: "var(--text-muted)" }}>&#10005;</button>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl text-sm whitespace-pre-wrap" style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {viewSubmission.content || "Javob kiritilmagan"}
              </div>
              {viewSubmission.grade !== null && (
                <div className="p-3 rounded-lg text-sm" style={{ background: "var(--success-bg)", border: "1px solid rgba(34, 197, 94, 0.15)", color: "var(--success)" }}>
                  Ball: {viewSubmission.grade}/{viewSubmission.assignment.maxScore}
                </div>
              )}
              {viewSubmission.feedback && (
                <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)", color: "var(--accent-hover)" }}>
                  O'qituvchi izohi: {viewSubmission.feedback}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</p>
      ) : assignments.length === 0 ? (
        <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>Vazifalar topilmadi</p>
      ) : (
        <div className="space-y-4">
          {assignments.map((a, i) => {
            const sub = getSubmission(a.id);
            const isOverdue = new Date() > new Date(a.dueDate);
            return (
              <div key={a.id} className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{a.title}</h3>
                      <span className="badge badge-info" style={{ fontSize: "0.65rem" }}>{a.group.name}</span>
                    </div>
                    {a.description && <p className="text-sm mt-2 whitespace-pre-line" style={{ color: "var(--text-muted)" }}>{a.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>Muhlat: {new Date(a.dueDate).toLocaleDateString("uz-UZ")}</span>
                      <span>Maks ball: {a.maxScore}</span>
                      {isOverdue && !sub && <span className="badge badge-danger">Muddati o'tgan</span>}
                    </div>
                    {sub?.feedback && (
                      <div className="mt-2 p-2 rounded-lg text-xs" style={{ background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.1)", color: "var(--accent-hover)" }}>
                        Izoh: {sub.feedback}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 min-w-[120px]">
                    {sub ? (
                      <div className="space-y-1">
                        <span className={`badge ${sub.status === "GRADED" ? "badge-success" : "badge-warning"}`}>
                          {sub.status === "GRADED" ? `${sub.grade}/${a.maxScore}` : "Tekshirilmoqda"}
                        </span>
                        <button onClick={() => viewDetails(sub, a)} className="block w-full text-center text-xs mt-1 transition-colors hover:underline" style={{ color: "var(--accent-hover)" }}>
                          Batafsil
                        </button>
                        {sub.status === "GRADED" && !isOverdue && (
                          <button onClick={() => { setSubmittingId(a.id); setAnswer(sub.content || ""); }} className="block w-full text-center text-xs mt-1 transition-colors" style={{ color: "var(--warning)" }}>
                            Qayta topshirish
                          </button>
                        )}
                      </div>
                    ) : submittingId === a.id ? (
                      <div className="space-y-2">
                        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Javobingiz..." className="input-dark w-full px-2 py-1 rounded-lg text-sm h-20" />
                        <div className="flex gap-1">
                          <button onClick={() => handleSubmit(a.id)} className="btn-primary px-2 py-1 rounded-lg text-xs"><span>Yuborish</span></button>
                          <button onClick={() => { setSubmittingId(null); setAnswer(""); }} className="btn-ghost px-2 py-1 rounded-lg text-xs">Bekor</button>
                        </div>
                      </div>
                    ) : !isOverdue ? (
                      <button onClick={() => setSubmittingId(a.id)} className="btn-primary px-3 py-1.5 rounded-xl text-xs"><span>Topshirish</span></button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
