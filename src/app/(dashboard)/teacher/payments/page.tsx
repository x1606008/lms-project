"use client";

import { useEffect, useState } from "react";

interface Group { id: string; name: string }
interface Schedule { dayOfWeek: number }
interface Student { id: string; name: string; email: string; avatarUrl: string | null }
interface Payment { id: string; amount: number; month: number; year: number; perDay: number; group: { id: string; name: string; students: { student: Student }[]; schedules: Schedule[] }; studentPayments?: { student: Student; daysAttended: number; totalDays: number; totalOwed: number }[]; createdAt: string }

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

function countClassDays(schedules: Schedule[], month: number, year: number): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const jsDay = date.getDay();
    const mappedDay = jsDay === 0 ? 6 : jsDay - 1;
    if (schedules.some((s) => s.dayOfWeek === mappedDay)) count++;
  }
  return count;
}

export default function TeacherPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ groupId: "", amount: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = async () => {
    const [pRes, gRes] = await Promise.all([
      fetch("/api/payments/student"),
      fetch("/api/groups"),
    ]);
    setPayments((await pRes.json()).payments || []);
    setGroups((await gRes.json()).groups || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (form.groupId) {
      fetch(`/api/schedules?groupId=${form.groupId}`).then((r) => r.json()).then((d) => setSchedules(d.schedules || []));
    }
  }, [form.groupId]);

  const classDays = countClassDays(schedules, form.month, form.year);
  const perDay = classDays > 0 ? Math.round(form.amount / classDays) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setShowForm(false); setForm({ groupId: "", amount: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirmoqchimisiz?")) return;
    await fetch(`/api/payments/${id}`, { method: "DELETE" });
    loadData();
    setExpandedId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold gradient-text">Oylik to&apos;lovlar</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 rounded-xl text-sm"><span>{showForm ? "Bekor" : "+ Yangi to&apos;lov"}</span></button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 mb-6 space-y-4 animate-slide-down">
          {error && <div className="p-3 rounded-lg text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select required value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm">
              <option value="">Guruh tanlang</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <input type="number" required placeholder="Summa (so'm)" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="input-dark px-3 py-2 rounded-xl text-sm" />
            <select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} className="input-dark px-3 py-2 rounded-xl text-sm">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="input-dark px-3 py-2 rounded-xl text-sm" />
          </div>
          {form.groupId && (
            <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", color: "var(--text-secondary)" }}>
              Dars kunlari: <strong>{classDays}</strong> kun | Kunlik to&apos;lov: <strong>{perDay.toLocaleString("uz-UZ")}</strong> so&apos;m
            </div>
          )}
          <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-sm"><span>Saqlash</span></button>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</p>
        ) : payments.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center animate-fade-in-up">
            <p className="text-4xl mb-3">💰</p>
            <p style={{ color: "var(--text-muted)" }}>Hali to&apos;lovlar yaratilmagan</p>
          </div>
        ) : payments.map((p, i) => {
          const isExpanded = expandedId === p.id;
          const collected = p.studentPayments ? p.studentPayments.reduce((s, sp) => s + sp.totalOwed, 0) : 0;

          return (
            <div key={p.id} className="glass-card rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div
                className="p-5 cursor-pointer hover:translate-x-1 transition-transform"
                onClick={() => setExpandedId(isExpanded ? null : p.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
                      <span className="text-white text-lg font-bold">{p.group.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{p.group.name}</h3>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{MONTHS[p.month - 1]} {p.year} · {p.group.students.length} o&apos;quvchi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{p.amount.toLocaleString("uz-UZ")} so&apos;m</p>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span style={{ color: "var(--accent-hover)" }}>{p.perDay.toLocaleString("uz-UZ")}/kun</span>
                      <span>·</span>
                      <span style={{ color: "var(--success)" }}>{collected.toLocaleString("uz-UZ")} yig&apos;ildi</span>
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && p.studentPayments && (
                <div className="px-5 pb-5" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="mt-4 overflow-hidden rounded-lg" style={{ border: "1px solid var(--border)" }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "rgba(99, 102, 241, 0.06)" }}>
                          <th className="text-left px-4 py-2.5 font-medium" style={{ color: "var(--text-muted)" }}>O&apos;quvchi</th>
                          <th className="text-center px-3 py-2.5 font-medium" style={{ color: "var(--text-muted)" }}>Kelgan</th>
                          <th className="text-center px-3 py-2.5 font-medium" style={{ color: "var(--text-muted)" }}>Yo&apos;q</th>
                          <th className="text-center px-3 py-2.5 font-medium" style={{ color: "var(--text-muted)" }}>Kech</th>
                          <th className="text-right px-4 py-2.5 font-medium" style={{ color: "var(--text-muted)" }}>To&apos;lov</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.studentPayments.map((sp) => (
                          <tr key={sp.student.id} style={{ borderTop: "1px solid var(--border)" }}>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                {sp.student.avatarUrl ? (
                                  <img src={sp.student.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "white" }}>
                                    {sp.student.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{sp.student.name}</p>
                                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sp.student.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="text-center px-3 py-2.5" style={{ color: "var(--success)" }}>{sp.daysAttended}</td>
                            <td className="text-center px-3 py-2.5" style={{ color: "var(--danger)" }}>{sp.totalDays - sp.daysAttended}</td>
                            <td className="text-center px-3 py-2.5" style={{ color: "var(--warning)" }}>-</td>
                            <td className="text-right px-4 py-2.5 font-bold" style={{ color: "var(--accent-hover)" }}>{sp.totalOwed.toLocaleString("uz-UZ")} so&apos;m</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button onClick={() => handleDelete(p.id)} className="btn-danger px-4 py-2 rounded-xl text-xs">To&apos;lovni o&apos;chirish</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
