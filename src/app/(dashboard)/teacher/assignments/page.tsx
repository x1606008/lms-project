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
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", dueDate: "", maxScore: 100, groupId: "", isPublished: false });
  const [editError, setEditError] = useState("");

  const loadData = async () => {
    setLoading(true);
    const [aRes, gRes] = await Promise.all([fetch("/api/assignments"), fetch("/api/groups")]);
    setAssignments((await aRes.json()).assignments || []);
    setGroups((await gRes.json()).groups || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const res = await fetch("/api/assignments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Xatolik"); return; }
    setShowForm(false); setForm({ title: "", description: "", dueDate: "", maxScore: 100, groupId: "", isPublished: false }); loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Vazifani o'chirmoqchimisiz?")) return;
    await fetch(`/api/assignments/${id}`, { method: "DELETE" }); loadData();
  };

  const startEdit = (a: Assignment) => {
    setEditingId(a.id);
    setEditForm({ title: a.title, description: a.description || "", dueDate: a.dueDate.split("T")[0], maxScore: a.maxScore, groupId: a.group.id, isPublished: a.isPublished });
    setEditError("");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingId) return; setEditError("");
    const res = await fetch(`/api/assignments/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    const data = await res.json();
    if (!res.ok) { setEditError(data.error || "Xatolik"); return; }
    setEditingId(null); loadData();
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
          {error && <div className="p-3 rounded-lg text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</div>}
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
              Nashr qilish
            </label>
            <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-sm"><span>Saqlash</span></button>
          </div>
        </form>
      )}

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setEditingId(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleEdit} className="glass-card rounded-2xl p-6 w-full max-w-lg animate-scale-in" style={{ border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-bold mb-4 gradient-text">Vazifani tahrirlash</h2>
            {editError && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{editError}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Nomi</label>
                <input required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="input-dark w-full px-3 py-2 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Guruh</label>
                <select required value={editForm.groupId} onChange={(e) => setEditForm({ ...editForm, groupId: e.target.value })} className="input-dark w-full px-3 py-2 rounded-xl text-sm">
                  <option value="">Guruhni tanlang</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Muhlat</label>
                  <input type="date" required value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} className="input-dark w-full px-3 py-2 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Maks. ball</label>
                  <input type="number" required value={editForm.maxScore} onChange={(e) => setEditForm({ ...editForm, maxScore: Number(e.target.value) })} className="input-dark w-full px-3 py-2 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Tavsif</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="input-dark w-full px-3 py-2 rounded-xl text-sm h-20" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={editForm.isPublished} onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })} style={{ accentColor: "var(--accent)" }} />
                Nashr qilish
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-sm"><span>Saqlash</span></button>
              <button type="button" onClick={() => setEditingId(null)} className="btn-ghost px-4 py-2 rounded-xl text-sm">Bekor qilish</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(99, 102, 241, 0.06)" }}>
              {["Vazifa", "Guruh", "Muhlat", "Ball", "Topshirishlar", "Holat", "Amallar"].map((h) => (
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
                <td className="px-4 py-3"><span className={`badge ${a.isPublished ? "badge-success" : "badge-info"}`}>{a.isPublished ? "Nashr" : "Qoralama"}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePublish(a.id, a.isPublished)} className="text-xs font-medium transition-colors" style={{ color: "var(--accent-hover)" }}>{a.isPublished ? "Yashirish" : "Nashr"}</button>
                    <button onClick={() => startEdit(a)} className="text-xs font-medium transition-colors" style={{ color: "var(--warning)" }}>&#9998;</button>
                    <button onClick={() => handleDelete(a.id)} className="text-xs font-medium transition-colors" style={{ color: "var(--danger)" }}>&#10005;</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
