"use client";

import { useEffect, useState } from "react";

interface Group { id: string; name: string; description: string | null; _count: { students: number; assignments: number } }
interface GroupStudent { id: string; student: { id: string; name: string; email: string } }
interface Schedule { id: string; dayOfWeek: number; startTime: string; endTime: string }

const DAYS_UZ = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

export default function TeacherGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupStudents, setGroupStudents] = useState<GroupStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [allStudents, setAllStudents] = useState<{ id: string; name: string; email: string }[]>([]);
  const [addStudentId, setAddStudentId] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showSchedule, setShowSchedule] = useState<Group | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ dayOfWeek: 0, startTime: "09:00", endTime: "10:30" });
  const [activeTab, setActiveTab] = useState<"students" | "schedule">("students");

  useEffect(() => {
    fetch("/api/groups").then((r) => r.json()).then((d) => { setGroups(d.groups || []); setLoading(false); });
    fetch("/api/users?role=STUDENT").then((r) => r.json()).then((d) => setAllStudents(d.users || []));
  }, []);

  const openStudents = async (group: Group) => {
    setSelectedGroup(group); setShowSchedule(null); setStudentsLoading(true); setAddStudentId(""); setActiveTab("students");
    const res = await fetch(`/api/groups/${group.id}/students`);
    const data = await res.json();
    setGroupStudents(data.students || []); setStudentsLoading(false);
  };

  const openSchedule = async (group: Group) => {
    setShowSchedule(group); setSelectedGroup(null); setActiveTab("schedule");
    const res = await fetch(`/api/schedules?groupId=${group.id}`);
    const data = await res.json();
    setSchedules(data.schedules || []);
  };

  const closeModal = () => { setSelectedGroup(null); setShowSchedule(null); };

  const handleAddStudent = async () => {
    if (!selectedGroup || !addStudentId) return;
    await fetch(`/api/groups/${selectedGroup.id}/students`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: addStudentId }) });
    setAddStudentId(""); openStudents(selectedGroup);
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedGroup || !confirm("O'quvchini guruhdan o'chirmoqchimisiz?")) return;
    await fetch(`/api/groups/${selectedGroup.id}/students`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId }) });
    openStudents(selectedGroup);
  };

  const handleAddSchedule = async () => {
    const group = selectedGroup || showSchedule;
    if (!group) return;
    const res = await fetch("/api/schedules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groupId: group.id, ...scheduleForm }) });
    if (res.ok) {
      const r2 = await fetch(`/api/schedules?groupId=${group.id}`);
      setSchedules((await r2.json()).schedules || []);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    const group = selectedGroup || showSchedule;
    if (group) { const r = await fetch(`/api/schedules?groupId=${group.id}`); setSchedules((await r.json()).schedules || []); }
  };

  const activeGroup = selectedGroup || showSchedule;
  const existingIds = groupStudents.map((gs) => gs.student.id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 animate-fade-in gradient-text">Guruhlarim</h1>

      {activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-scale-in" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold gradient-text">{activeGroup.name}</h2>
              <button onClick={closeModal} className="text-lg" style={{ color: "var(--text-muted)" }}>&#10005;</button>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => { const g = selectedGroup || showSchedule; if (g) openStudents(g); }} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: activeTab === "students" ? "var(--accent)" : "rgba(99,102,241,0.08)", color: activeTab === "students" ? "white" : "var(--text-secondary)" }}>O'quvchilar</button>
              <button onClick={() => { const g = showSchedule || selectedGroup; if (g) openSchedule(g); }} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: activeTab === "schedule" ? "var(--accent)" : "rgba(99,102,241,0.08)", color: activeTab === "schedule" ? "white" : "var(--text-secondary)" }}>Dars jadvali ({schedules.length})</button>
            </div>

            {activeTab === "students" && (
              <>
                <div className="flex gap-2 mb-4">
                  <select value={addStudentId} onChange={(e) => setAddStudentId(e.target.value)} className="input-dark flex-1 px-3 py-2 rounded-xl text-sm">
                    <option value="">O'quvchi tanlang ({allStudents.filter((s) => !existingIds.includes(s.id)).length} ta mavjud)</option>
                    {allStudents.filter((s) => !existingIds.includes(s.id)).map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                  </select>
                  <button onClick={handleAddStudent} disabled={!addStudentId} className="btn-primary px-4 py-2 rounded-xl text-sm disabled:opacity-40"><span>+ Qo'shish</span></button>
                </div>
                {studentsLoading ? (
                  <p className="text-center py-6" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</p>
                ) : groupStudents.length === 0 ? (
                  <p className="text-center py-6" style={{ color: "var(--text-muted)" }}>Guruhda o'quvchilar yo'q</p>
                ) : (
                  <div className="space-y-2">
                    {groupStudents.map((gs, i) => (
                      <div key={gs.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(99,102,241,0.04)", border: "1px solid var(--border)" }}>
                        <div><p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{gs.student.name}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>{gs.student.email}</p></div>
                        <button onClick={() => handleRemoveStudent(gs.student.id)} className="btn-danger px-3 py-1 rounded-lg text-xs">O'chirish</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "schedule" && (
              <>
                <div className="grid grid-cols-4 gap-2 mb-4 items-end">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Kun</label>
                    <select value={scheduleForm.dayOfWeek} onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: Number(e.target.value) })} className="input-dark px-3 py-2 rounded-xl text-sm w-full">
                      {DAYS_UZ.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Boshlanish</label><input type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm w-full" /></div>
                  <div><label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Tugash</label><input type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm w-full" /></div>
                  <button onClick={handleAddSchedule} className="btn-primary px-4 py-2 rounded-xl text-sm h-[38px]"><span>+ Qo'shish</span></button>
                </div>
                {schedules.length === 0 ? (
                  <p className="text-center py-6" style={{ color: "var(--text-muted)" }}>Dars jadvali belgilanmagan</p>
                ) : (
                  <div className="space-y-2">
                    {schedules.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(99,102,241,0.04)", border: "1px solid var(--border)" }}>
                        <span className="text-sm" style={{ color: "var(--text-primary)" }}>{DAYS_UZ[s.dayOfWeek]} — {s.startTime} - {s.endTime}</span>
                        <button onClick={() => handleDeleteSchedule(s.id)} className="btn-danger px-3 py-1 rounded-lg text-xs">O'chirish</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</p>
        ) : groups.length === 0 ? (
          <p className="col-span-full text-center py-8" style={{ color: "var(--text-muted)" }}>Guruhlar topilmadi</p>
        ) : groups.map((g, i) => (
          <div key={g.id} className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{g.name}</h3>
            {g.description && <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{g.description}</p>}
            <div className="mt-4 flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
              <span>&#128101; {g._count.students} o'quvchi</span>
              <span>&#128221; {g._count.assignments} vazifa</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => openStudents(g)} className="flex-1 text-center text-xs py-2 rounded-lg transition-all" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", color: "var(--accent-hover)" }}>O'quvchilar</button>
              <button onClick={() => { setSchedules([]); openSchedule(g); }} className="flex-1 text-center text-xs py-2 rounded-lg transition-all" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)", color: "var(--success)" }}>Jadval</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
