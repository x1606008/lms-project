"use client";

import { useEffect, useState } from "react";

interface Group { id: string; name: string; description: string | null; teacher: { id: string; name: string }; _count: { students: number; assignments: number } }
interface User { id: string; name: string; email: string }

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", teacherId: "" });
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    const [gRes, tRes] = await Promise.all([fetch("/api/groups"), fetch("/api/users?role=TEACHER")]);
    setGroups((await gRes.json()).groups || []);
    setTeachers((await tRes.json()).users || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const res = await fetch("/api/groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setShowForm(false); setForm({ name: "", description: "", teacherId: "" }); loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Guruhni o'chirmoqchimisiz?")) return;
    await fetch(`/api/groups/${id}`, { method: "DELETE" }); loadData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold gradient-text">Guruhlar</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 rounded-xl text-sm"><span>{showForm ? "Bekor qilish" : "+ Yangi guruh"}</span></button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card rounded-xl p-6 mb-6 space-y-4 animate-slide-down">
          {error && <div className="p-3 rounded-lg text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Guruh nomi" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm" />
            <input placeholder="Tavsif" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm" />
            <select required value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm">
              <option value="">O'qituvchini tanlang</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-sm"><span>Saqlash</span></button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</p>
        ) : groups.length === 0 ? (
          <p className="col-span-full text-center py-8" style={{ color: "var(--text-muted)" }}>Guruhlar topilmadi</p>
        ) : groups.map((g, i) => (
          <div key={g.id} className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{g.name}</h3>
                {g.description && <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{g.description}</p>}
              </div>
              <button onClick={() => handleDelete(g.id)} className="btn-danger w-7 h-7 rounded-lg text-xs flex items-center justify-center">✕</button>
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
              <span>👨‍🏫 {g.teacher.name}</span>
              <span>👥 {g._count.students}</span>
              <span>📝 {g._count.assignments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
