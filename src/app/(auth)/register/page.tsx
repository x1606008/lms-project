"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Xatolik yuz berdi"); return; }
      router.push("/login?registered=true");
    } catch { setError("Xatolik yuz berdi"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full animate-float" style={{ background: "radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full animate-float" style={{ background: "radial-gradient(circle, rgba(129, 140, 248, 0.05), transparent)", animationDelay: "1.5s" }} />
      </div>

      <div className="w-full max-w-md animate-scale-in">
        <div className="glass-card rounded-2xl p-8 animate-border-glow" style={{ boxShadow: "0 0 60px rgba(99, 102, 241, 0.08)" }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl animate-float" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)" }}>
              ✨
            </div>
            <h1 className="text-2xl font-bold gradient-text">Ro&apos;yxatdan o&apos;tish</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Yangi hisob yarating</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm animate-slide-down" style={{ background: "var(--danger-bg)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "var(--danger)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Ism familiya</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="Karimov Sardor" />
            </div>

            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="email@misol.uz" />
            </div>

            <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Parol</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="Kamida 6 ta belgi" />
            </div>

            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Rol</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input-dark w-full px-4 py-3 rounded-xl text-sm" style={{ cursor: "pointer" }}>
                <option value="STUDENT">O&apos;quvchi</option>
                <option value="TEACHER">O&apos;qituvchi</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl text-sm animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <span>{loading ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}</span>
            </button>
          </form>

          <div className="mt-6 text-center text-sm animate-fade-in" style={{ animationDelay: "0.4s", color: "var(--text-muted)" }}>
            Hisobingiz bormi?{" "}
            <Link href="/login" className="font-medium transition-colors duration-200" style={{ color: "var(--accent-hover)" }}>
              Kirish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
