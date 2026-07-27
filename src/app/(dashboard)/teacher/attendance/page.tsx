"use client";

import { useEffect, useState } from "react";

interface Group { id: string; name: string }

export default function AttendancePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [records, setRecords] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { fetch("/api/groups").then((r) => r.json()).then((d) => setGroups(d.groups || [])); }, []);

  useEffect(() => {
    if (!selectedGroup) { setStudents([]); setRecords({}); return; }
    fetch(`/api/groups/${selectedGroup}/students`).then((r) => r.json()).then((d) => {
      setStudents((d.students || []).map((gs: { student: { id: string; name: string } }) => gs.student));
    });
    fetch(`/api/attendance?groupId=${selectedGroup}&date=${date}`).then((r) => r.json()).then((d) => {
      const existing: Record<string, string> = {};
      (d.attendance || []).forEach((a: { studentId: string; status: string }) => { existing[a.studentId] = a.status; });
      setRecords(existing);
    });
  }, [selectedGroup, date]);

  const setStudentStatus = (studentId: string, status: string) => {
    setRecords((prev) => ({ ...prev, [studentId]: prev[studentId] === status ? "" : status }));
  };

  const handleSave = async () => {
    if (!selectedGroup) return;
    setSaving(true);
    const payload = { groupId: selectedGroup, date, records: students.filter((s) => records[s.id]).map((s) => ({ studentId: s.id, status: records[s.id] })) };
    const res = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { setMessage("Davomat saqlandi!"); setTimeout(() => setMessage(""), 3000); }
    setSaving(false);
  };

  const stats = { present: Object.values(records).filter((r) => r === "PRESENT").length, absent: Object.values(records).filter((r) => r === "ABSENT").length, late: Object.values(records).filter((r) => r === "LATE").length };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Davomat</h1>

      <div className="flex flex-wrap gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="input-dark px-3 py-2 rounded-xl text-sm">
          <option value="">Guruhni tanlang</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-dark px-3 py-2 rounded-xl text-sm" />
        {selectedGroup && (
          <button onClick={handleSave} disabled={saving} className="btn-primary px-4 py-2 rounded-xl text-sm"><span>{saving ? "Saqlanmoqda..." : "Saqlash"}</span></button>
        )}
      </div>

      {message && <div className="mb-4 p-3 rounded-lg text-sm animate-slide-down" style={{ background: "var(--success-bg)", color: "var(--success)" }}>{message}</div>}

      {selectedGroup && students.length > 0 && (
        <>
          <div className="flex gap-4 mb-4 text-sm animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <span style={{ color: "var(--success)" }}>Keldi: {stats.present}</span>
            <span style={{ color: "var(--danger)" }}>Kelmadi: {stats.absent}</span>
            <span style={{ color: "var(--warning)" }}>Sababli: {stats.late}</span>
          </div>

          <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(99, 102, 241, 0.06)" }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>O'quvchi</th>
                  <th className="text-center px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Holat</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} className="table-row" style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        {(["PRESENT", "ABSENT", "LATE"] as const).map((status) => {
                          const labels: Record<string, string> = { PRESENT: "Keldi", ABSENT: "Kelmadi", LATE: "Sababli" };
                          const active = records[s.id] === status;
                          return (
                            <button key={status} onClick={() => setStudentStatus(s.id, status)}
                              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                              style={active
                                ? { background: status === "PRESENT" ? "var(--success)" : status === "ABSENT" ? "var(--danger)" : "var(--warning)", color: "white" }
                                : { background: status === "PRESENT" ? "var(--success-bg)" : status === "ABSENT" ? "var(--danger-bg)" : "var(--warning-bg)", color: status === "PRESENT" ? "var(--success)" : status === "ABSENT" ? "var(--danger)" : "var(--warning)" }
                              }
                            >{labels[status]}</button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedGroup && !saving && students.length === 0 && (
        <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>Bu guruhda o'quvchilar yo'q</p>
      )}
    </div>
  );
}
