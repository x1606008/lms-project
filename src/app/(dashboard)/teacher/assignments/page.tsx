"use client";

import { useEffect, useState } from "react";

interface Assignment { id: string; title: string; description: string | null; dueDate: string; maxScore: number; isPublished: boolean; group: { id: string; name: string }; _count: { submissions: number } }
interface Group { id: string; name: string }

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", maxScore: 100, groupId: "", isPublished: false });

  const loadData = async () => {
    setLoading(true);
    const [aRes, gRes] = await Promise.all([fetch("/api/assignments"), fetch("/api/groups")]);
    setAssignments((await aRes.json()).assignments || []);
    setGroups((await gRes.json()).groups || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/assignments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowForm(false); setForm({ title: "", description: "", dueDate: "", maxScore: 100, groupId: "", isPublished: false }); loadData(); }
  };

  const togglePublish = async (id: string, current: boolean) => {
    await fetch(`/api/assignments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: !current }) });
    loadData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold gradient-text">Vazifalar</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 rounded-xl text-sm"><span>{showForm ? "Bekor" : "+ Yangi vazifa"}</span></button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card rounded-xl p-6 mb-6 space-y-4 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Vazifa nomi" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm" />
            <select required value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm">
              <option value="">Guruhni tanlang</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm" />
            <input type="number" placeholder="Maks. ball" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })} className="input-dark px-3 py-2 rounded-xl text-sm" />
          </div>
          <textarea placeholder="Vazifa tavsifi..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-dark w-full px-3 py-2 rounded-xl text-sm h-24" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="rounded" style={{ accentColor: "var(--accent)" }} />
              Nucher qilish
            </label>
            <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-sm"><span>Saqlash</span></button>
          </div>
        </form>
      )}

      <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(99, 102, 241, 0.06)" }}>
              {["Vazifa", "Guruh", "Muhlat", "Ball", "Topshirishlar", "Holat", "Amal"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8" style={{ color: "var(--text-muted)" }}>Vazifalar yo'q</td></tr>
            ) : assignments.map((a) => (
              <tr key={a.id} className="table-row" style={{ borderTop: "1px solid var(--border)" }}>
                <td className="px-4 py-3">
                  <div className="font-medium">{a.title}</div>
                  {a.description && <div className="text-xs truncate max-w-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{a.description.slice(0, 50)}...</div>}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{a.group.name}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{new Date(a.dueDate).toLocaleDateString("uz-UZ")}</td>
                <td className="px-4 py-3 text-center">{a.maxScore}</td>
                <td className="px-4 py-3 text-center">{a._count.submissions}</td>
                <td className="px-4 py-3"><span className={`badge ${a.isPublished ? "badge-success" : "badge-info"}`}>{a.isPublished ? "Nucher" : "Qoralama"}</span></td>
                <td className="px-4 py-3"><button onClick={() => togglePublish(a.id, a.isPublished)} className="text-xs font-medium transition-colors" style={{ color: "var(--accent-hover)" }}>{a.isPublished ? "Yashirish" : "Nucher qilish"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
