"use client";

import { useEffect, useState } from "react";

interface PaymentInfo {
  groupId: string;
  groupName: string;
  studentCount: number;
  payment: { id: string; amount: number; perDay: number; month: number; year: number } | null;
}

interface Attendance {
  date: string;
  status: string;
}

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [attLoading, setAttLoading] = useState(false);

  useEffect(() => {
    fetch("/api/payments/student").then((r) => r.json()).then((d) => {
      setPayments(d.payments || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;
    setAttLoading(true);
    fetch(`/api/attendance?groupId=${selectedGroup}`).then((r) => r.json()).then((d) => {
      setAttendance(d.attendance || []);
      setAttLoading(false);
    });
  }, [selectedGroup]);

  const getMonthAttendance = (month: number, year: number) => {
    return attendance.filter((a) => {
      const d = new Date(a.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const totalOwed = payments.reduce((sum, p) => {
    if (!p.payment) return sum;
    const atts = getMonthAttendance(p.payment.month, p.payment.year);
    const days = atts.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
    return sum + p.payment!.perDay * days;
  }, 0);

  const totalPaid = 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold gradient-text">Mening to&apos;lovlarim</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Jami qarz</p>
          <p className="text-2xl font-bold" style={{ color: "var(--danger)" }}>{totalOwed.toLocaleString("uz-UZ")} so&apos;m</p>
        </div>
        <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>To'langan</p>
          <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>{totalPaid.toLocaleString("uz-UZ")} so&apos;m</p>
        </div>
        <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Guruhlar soni</p>
          <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{payments.length}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</p>
      ) : payments.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center animate-fade-in-up">
          <p className="text-4xl mb-3">📋</p>
          <p style={{ color: "var(--text-muted)" }}>Siz hali hech qanday guruhga biriktirilmagansiz</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p, i) => {
            const isSelected = selectedGroup === p.groupId;
            const atts = p.payment ? getMonthAttendance(p.payment.month, p.payment.year) : [];
            const daysAttended = atts.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
            const daysAbsent = atts.filter((a) => a.status === "ABSENT").length;
            const daysLate = atts.filter((a) => a.status === "LATE").length;
            const owed = p.payment ? p.payment.perDay * daysAttended : 0;

            return (
              <div
                key={p.groupId}
                className="glass-card rounded-xl overflow-hidden animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setSelectedGroup(isSelected ? null : p.groupId)}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
                        <span className="text-white text-lg font-bold">{p.groupName.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{p.groupName}</h3>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.studentCount} o&apos;quvchi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {p.payment ? (
                        <>
                          <p className="text-sm font-medium" style={{ color: "var(--danger)" }}>
                            {owed.toLocaleString("uz-UZ")} so&apos;m
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {MONTHS[p.payment.month - 1]} {p.payment.year}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>To&apos;lov yo&apos;q</p>
                      )}
                    </div>
                  </div>

                  {p.payment && (
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: "rgba(34,197,94,0.08)" }}>
                        <p className="text-lg font-bold" style={{ color: "var(--success)" }}>{daysAttended}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Kelgan</p>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                        <p className="text-lg font-bold" style={{ color: "var(--danger)" }}>{daysAbsent}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Yo&apos;q</p>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: "rgba(245,158,11,0.08)" }}>
                        <p className="text-lg font-bold" style={{ color: "var(--warning)" }}>{daysLate}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Kech</p>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: "rgba(99,102,241,0.08)" }}>
                        <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>{p.payment.perDay.toLocaleString("uz-UZ")}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Kunlik</p>
                      </div>
                    </div>
                  )}

                  {!p.payment && (
                    <div className="p-3 rounded-lg text-center text-sm" style={{ background: "rgba(107,114,128,0.08)", color: "var(--text-muted)" }}>
                      Guruh uchun to&apos;lov hali belgilanmagan
                    </div>
                  )}
                </div>

                {isSelected && p.payment && (
                  <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Batafsil hisobot</p>
                    {attLoading ? (
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</p>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                          <span>Guruh to&apos;lovi (oylik)</span>
                          <span className="font-medium">{p.payment.amount.toLocaleString("uz-UZ")} so&apos;m</span>
                        </div>
                        <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                          <span>Kunlik to&apos;lov</span>
                          <span className="font-medium">{p.payment.perDay.toLocaleString("uz-UZ")} so&apos;m</span>
                        </div>
                        <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                          <span>Davomat asosidaga to&apos;lov</span>
                          <span className="font-medium" style={{ color: "var(--danger)" }}>{owed.toLocaleString("uz-UZ")} so&apos;m</span>
                        </div>
                        <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                          <span>O&apos;tkazilgan kunlar</span>
                          <span>{daysAbsent} kun</span>
                        </div>
                        <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                          <span>Ummumiy farq</span>
                          <span className="font-medium">{(p.payment.amount - owed).toLocaleString("uz-UZ")} so&apos;m tejalgan</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
