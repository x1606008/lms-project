"use client";

import { useEffect, useState } from "react";

interface Assignment { id: string; title: string; description: string | null; dueDate: string; maxScore: number; group: { name: string } }
interface Submission { id: string; content: string | null; status: string; grade: number | null; assignmentId: string }

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Vazifalarim</h1>
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
                      <span>📅 {new Date(a.dueDate).toLocaleDateString("uz-UZ")}</span>
                      <span>🎯 {a.maxScore} ball</span>
                      {isOverdue && !sub && <span className="badge badge-danger">Muddati o'tgan</span>}
                    </div>
                  </div>
                  <div className="ml-4 min-w-[120px]">
                    {sub ? (
                      <span className={`badge ${sub.status === "GRADED" ? "badge-success" : "badge-warning"}`}>
                        {sub.status === "GRADED" ? `${sub.grade}/${a.maxScore}` : "Ko'rilmoqda"}
                      </span>
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
