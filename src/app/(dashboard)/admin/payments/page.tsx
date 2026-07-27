"use client";

import { useEffect, useState } from "react";

interface Group { id: string; name: string }
interface Student { id: string; name: string; email: string; avatarUrl: string | null }
interface StudentPayment { student: Student; daysAttended: number; totalDays: number; totalOwed: number }
interface Payment { id: string; amount: number; month: number; year: number; perDay: number; group: { id: string; name: string; students: { student: Student }[]; schedules: { dayOfWeek: number }[] }; creator: { name: string }; studentPayments: StudentPayment[]; createdAt: string }

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payments/student").then((r) => r.json()).then((d) => {
      setPayments(d.payments || []);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirmoqchimisiz?")) return;
    await fetch(`/api/payments/${id}`, { method: "DELETE" });
    const pRes = await fetch("/api/payments/student");
    setPayments((await pRes.json()).payments || []);
    setExpandedId(null);
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.studentPayments.reduce((s, sp) => s + sp.totalOwed, 0), 0);
  const totalExpected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold gradient-text">Oylik to&apos;lovlar</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Jami to&apos;lov (oylik)</p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{totalExpected.toLocaleString("uz-UZ")} so&apos;m</p>
        </div>
        <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Yig&apos;ilgan (davomat asosida)</p>
          <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>{totalCollected.toLocaleString("uz-UZ")} so&apos;m</p>
        </div>
        <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Farq (tejalgan)</p>
          <p className="text-2xl font-bold" style={{ color: "var(--warning)" }}>{(totalExpected - totalCollected).toLocaleString("uz-UZ")} so&apos;m</p>
        </div>
      </div>

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
          const collected = p.studentPayments.reduce((s, sp) => s + sp.totalOwed, 0);

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
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{MONTHS[p.month - 1]} {p.year} · {p.group.students.length} o&apos;quvchi · {p.creator.name} yaratgan</p>
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

              {isExpanded && (
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
