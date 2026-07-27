"use client";

import { useEffect, useState, useRef } from "react";

interface User { id: string; name: string; email: string; role: string; phone: string | null; avatarUrl: string | null; isActive: boolean; createdAt: string; _count: { teacherGroups: number; studentGroups: number } }

const ROLE_LABELS: Record<string, string> = { ADMIN: "Administrator", TEACHER: "O'qituvchi", STUDENT: "O'quvchi" };
const ROLE_COLORS: Record<string, string> = { ADMIN: "badge-info", TEACHER: "badge-success", STUDENT: "badge-warning" };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [error, setError] = useState("");
  const fileInputs = useRef<Record<string, HTMLInputElement>>({});

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

  const handleAvatarUpload = async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, avatarUrl: data.avatarUrl } : u));
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-center py-8" style={{ color: "var(--text-muted)" }}>Yuklanmoqda...</p>
        ) : users.length === 0 ? (
          <p className="col-span-full text-center py-8" style={{ color: "var(--text-muted)" }}>Foydalanuvchilar topilmadi</p>
        ) : users.map((u, i) => (
          <div key={u.id} className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputs.current[u.id]?.click()}
              >
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.name} className="w-12 h-12 rounded-full object-cover" style={{ border: "2px solid var(--border)" }} />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "white" }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.5)" }}>
                  <span className="text-white text-xs">+</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => { if (el) fileInputs.current[u.id] = el; }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(u.id, f); }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{u.email}</p>
              </div>
              <span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
            </div>
            <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
              <span>{u.isActive ? "Faol" : "Nofaol"}</span>
              <button onClick={() => handleDelete(u.id)} className="btn-danger px-3 py-1 rounded-lg text-xs">O'chirish</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
