"use client";

import { useEffect, useState } from "react";

interface User { id: string; name: string; email: string; role: string; phone: string | null; isActive: boolean; createdAt: string; _count: { teacherGroups: number; studentGroups: number } }

const ROLE_LABELS: Record<string, string> = { ADMIN: "Administrator", TEACHER: "O'qituvchi", STUDENT: "O'quvchi" };
const ROLE_COLORS: Record<string, string> = { ADMIN: "badge-info", TEACHER: "badge-success", STUDENT: "badge-warning" };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    const url = filter === "ALL" ? "/api/users" : `/api/users?role=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, [filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setShowForm(false); setForm({ name: "", email: "", password: "", role: "STUDENT" }); loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu foydalanuvchini o'chirmoqchimisiz?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" }); loadUsers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold gradient-text">Foydalanuvchilar</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 rounded-xl text-sm"><span>{showForm ? "Bekor qilish" : "+ Yangi foydalanuvchi"}</span></button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card rounded-xl p-6 mb-6 space-y-4 animate-slide-down">
          {error && <div className="p-3 rounded-lg text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Ism familiya" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm" />
            <input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm" />
            <input placeholder="Parol" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-dark px-3 py-2 rounded-xl text-sm">
              <option value="STUDENT">O'quvchi</option>
              <option value="TEACHER">O'qituvchi</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-sm"><span>Saqlash</span></button>
        </form>
      )}

      <div className="flex gap-2 mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {["ALL", "ADMIN", "TEACHER", "STUDENT"].map((r) => (
          <button key={r} onClick={() => setFilter(r)} className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200" style={filter === r ? { background: "var(--accent)", color: "white" } : { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            {r === "ALL" ? "Barchasi" : ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(99, 102, 241, 0.06)" }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Ism</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Email</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Rol</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Holat</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8" style={{ color: "var(--text-muted)" }}>Foydalanuvchilar topilmadi</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="table-row" style={{ borderTop: "1px solid var(--border)" }}>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{u.email}</td>
                <td className="px-4 py-3"><span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span></td>
                <td className="px-4 py-3"><span className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}>{u.isActive ? "Faol" : "Nofaol"}</span></td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(u.id)} className="btn-danger px-3 py-1 rounded-lg text-xs">O'chirish</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
