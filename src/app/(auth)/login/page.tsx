"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { setError("Email yoki parol noto'g'ri"); return; }
      router.push(callbackUrl);
      router.refresh();
    } catch { setError("Xatolik yuz berdi"); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-md animate-scale-in" style={{ animationDelay: "0.1s" }}>
      <div className="glass-card rounded-2xl p-8 animate-border-glow" style={{ boxShadow: "0 0 60px rgba(99, 102, 241, 0.08)" }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl animate-float" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)" }}>
            🎓
          </div>
          <h1 className="text-2xl font-bold gradient-text">LMS ga kirish</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Ta&apos;lim Boshqaruv Tizimi</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm animate-slide-down" style={{ background: "var(--danger-bg)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              placeholder="email@misol.uz"
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Parol</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              placeholder="••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl text-sm animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <span>{loading ? "Kirilmoqda..." : "Kirish"}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-sm animate-fade-in" style={{ animationDelay: "0.5s", color: "var(--text-muted)" }}>
          Hisobingiz yo&apos;qmi?{" "}
          <Link href="/register" className="font-medium transition-colors duration-200" style={{ color: "var(--accent-hover)" }}>
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </div>

        <div className="mt-6 pt-4 animate-fade-in" style={{ animationDelay: "0.6s", borderTop: "1px solid var(--border)" }}>
          <p className="text-xs text-center mb-3" style={{ color: "var(--text-muted)" }}>Test uchun loginlar:</p>
          <div className="space-y-2">
            {[
              { role: "Admin", email: "admin@lms.uz", pass: "admin123" },
              { role: "O'qituvchi", email: "karimov@lms.uz", pass: "teacher123" },
              { role: "O'quvchi", email: "jasur@lms.uz", pass: "student123" },
            ].map((t) => (
              <button
                key={t.email}
                onClick={() => { setEmail(t.email); setPassword(t.pass); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 hover:translate-x-1"
                style={{ background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.1)", color: "var(--text-secondary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99, 102, 241, 0.12)"; e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(99, 102, 241, 0.06)"; e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.1)"; }}
              >
                <strong style={{ color: "var(--accent-hover)" }}>{t.role}:</strong> {t.email} / {t.pass}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full animate-float" style={{ background: "radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent)", animationDelay: "0s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full animate-float" style={{ background: "radial-gradient(circle, rgba(129, 140, 248, 0.05), transparent)", animationDelay: "1.5s" }} />
      </div>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8" style={{ border: "2px solid var(--border)", borderTopColor: "var(--accent)" }} /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
