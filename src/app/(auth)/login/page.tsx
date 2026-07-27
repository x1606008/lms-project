"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{ particles: { x: number; y: number; vx: number; vy: number; radius: number }[]; animFrame1: number; animFrame2: number }>({ particles: [], animFrame1: 0, animFrame2: 0 });

  const [loginModal, setLoginModal] = useState(false);
  const [registerModal, setRegisterModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email: loginEmail, password: loginPassword, redirect: false });
      if (result?.error) { setError("Email yoki parol noto'g'ri"); setLoading(false); return; }
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;
      const dashboards: Record<string, string> = { ADMIN: "/admin", TEACHER: "/teacher", STUDENT: "/student" };
      router.push(dashboards[role] || "/");
    } catch { setError("Xatolik yuz berdi"); setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: "STUDENT" }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Xatolik yuz berdi"); setLoading(false); return; }
      setRegisterModal(false);
      setLoginEmail(regEmail);
      setLoginPassword(regPassword);
      setLoginModal(true);
      setError("");
    } catch { setError("Xatolik yuz berdi"); setLoading(false); }
  };

  const loadScript = (src: string) => new Promise<void>((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });

  const init3D = useCallback(async () => {
    if (!threeContainerRef.current) return;

    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
    await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js");
    await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/DragControls.js");

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const T = (window as any).THREE;
    if (!T) return;

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    threeContainerRef.current.appendChild(renderer.domElement);

    scene.add(new T.AmbientLight(0xffffff, 0.7));
    const dirLight = new T.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const geometry = new T.BoxGeometry(0.85, 0.85, 0.85);
    const material = new T.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.2, metalness: 0.1 });

    const cubes: any[] = [];
    const gridSize = 5;
    const gap = 1.1;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const cube = new T.Mesh(geometry, material.clone());
          cube.position.set((x - gridSize / 2) * gap, (y - gridSize / 2) * gap, (z - gridSize / 2) * gap);
          scene.add(cube);
          cubes.push(cube);
        }
      }
    }

    const orbitControls = new T.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;

    const dragControls = new T.DragControls(cubes, camera, renderer.domElement);
    dragControls.addEventListener("dragstart", (e: any) => {
      orbitControls.enabled = false;
      e.object.material.emissive.setHex(0x555500);
    });
    dragControls.addEventListener("dragend", (e: any) => {
      orbitControls.enabled = true;
      e.object.material.emissive.setHex(0x000000);
    });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    function animate3D() {
      stateRef.current.animFrame2 = requestAnimationFrame(animate3D);
      orbitControls.update();
      renderer.render(scene, camera);
    }
    animate3D();
  }, []);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: Math.random() * 2 + 1,
      });
    }
    stateRef.current.particles = particles;

    const ctx2d = ctx;

    function animateBg() {
      stateRef.current.animFrame1 = requestAnimationFrame(animateBg);
      ctx2d.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x += p.vx;
        p.y += p.vy;
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx2d.fillStyle = "#ffcc00";
        ctx2d.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx2d.beginPath();
            ctx2d.moveTo(p.x, p.y);
            ctx2d.lineTo(particles[j].x, particles[j].y);
            ctx2d.strokeStyle = `rgba(255, 204, 0, ${1 - (dist / 120) * 0.2})`;
            ctx2d.lineWidth = 0.8;
            ctx2d.stroke();
          }
        }
      }
    }
    animateBg();

    const onResize = () => {
      bgCanvasRef.current!.width = window.innerWidth;
      bgCanvasRef.current!.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    init3D();

    return () => {
      cancelAnimationFrame(stateRef.current.animFrame1);
      cancelAnimationFrame(stateRef.current.animFrame2);
      window.removeEventListener("resize", onResize);
    };
  }, [init3D]);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; overflow: hidden; background-color: #050505; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        #bg-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
        #three-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; }
        .header-nav { position: absolute; top: 0; left: 0; width: 100%; padding: 25px 35px; display: flex; justify-content: space-between; align-items: center; z-index: 10; background: linear-gradient(to bottom, rgba(5, 5, 5, 0.95), transparent); pointer-events: none; }
        .brand-title h1 { font-size: 1.2rem; letter-spacing: 3px; text-transform: uppercase; color: #ffcc00; text-shadow: 0 0 10px rgba(255, 204, 0, 0.3); }
        .brand-title p { font-size: 0.8rem; color: #777; margin-top: 3px; }
        .auth-buttons { display: flex; gap: 12px; pointer-events: auto; }
        .btn { padding: 10px 24px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; outline: none; border: 1px solid transparent; }
        .btn-login { background: transparent; color: #ffcc00; border-color: #ffcc00; }
        .btn-login:hover { background: rgba(255, 204, 0, 0.1); box-shadow: 0 0 15px rgba(255, 204, 0, 0.2); }
        .btn-register { background: #ffcc00; color: #050505; }
        .btn-register:hover { background: #ffe600; box-shadow: 0 0 20px rgba(255, 204, 0, 0.4); transform: translateY(-2px); }
        .reset-btn { position: absolute; bottom: 25px; right: 35px; z-index: 10; padding: 10px 18px; background: rgba(255, 204, 0, 0.1); border: 1px solid #ffcc00; border-radius: 6px; color: #ffcc00; font-size: 0.85rem; font-weight: bold; cursor: pointer; transition: 0.3s ease; }
        .reset-btn:hover { background: #ffcc00; color: #000; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 100; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
        .modal-overlay.active { opacity: 1; pointer-events: auto; }
        .modal-box { background: #0f0f0f; border: 1px solid rgba(255, 204, 0, 0.4); border-radius: 12px; padding: 30px; width: 330px; color: #fff; box-shadow: 0 0 25px rgba(255, 204, 0, 0.15); position: relative; }
        .modal-box h2 { color: #ffcc00; margin-bottom: 20px; font-size: 1.3rem; }
        .modal-box input { width: 100%; padding: 12px; margin-bottom: 12px; background: #181818; border: 1px solid #333; border-radius: 6px; color: #fff; outline: none; }
        .modal-box input:focus { border-color: #ffcc00; }
        .modal-box button.submit-btn { width: 100%; padding: 12px; background: #ffcc00; border: none; border-radius: 6px; color: #000; font-weight: bold; cursor: pointer; margin-top: 5px; }
        .modal-box button.submit-btn:hover { background: #ffe600; }
        .modal-box button.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .close-btn { position: absolute; top: 12px; right: 18px; color: #777; font-size: 1.4rem; cursor: pointer; }
        .close-btn:hover { color: #fff; }
        .error-msg { color: #ef4444; font-size: 0.85rem; margin-bottom: 10px; }
        .test-creds { margin-top: 15px; padding-top: 12px; border-top: 1px solid #333; }
        .test-creds p { font-size: 0.75rem; color: #777; margin-bottom: 6px; }
        .test-creds button { background: rgba(255, 204, 0, 0.08); border: 1px solid rgba(255, 204, 0, 0.15); border-radius: 4px; color: #ffcc00; padding: 4px 8px; font-size: 0.7rem; cursor: pointer; margin-right: 4px; margin-bottom: 4px; }
        .test-creds button:hover { background: rgba(255, 204, 0, 0.15); }
      `}</style>

      <canvas ref={bgCanvasRef} id="bg-canvas" />
      <div ref={threeContainerRef} id="three-container" />

      <div className="header-nav">
        <div className="brand-title">
          <h1>LMS PLATFORM</h1>
          <p>Kubiklarni bosib, istalgancha suring</p>
        </div>
        <div className="auth-buttons">
          <button className="btn btn-login" onClick={() => { setError(""); setLoginModal(true); }}>Kirish</button>
          <button className="btn btn-register" onClick={() => { setError(""); setRegisterModal(true); }}>Ro&apos;yxatdan o&apos;tish</button>
        </div>
      </div>

      <button className="reset-btn" onClick={() => location.reload()}>Joyiga qaytarish</button>

      {/* LOGIN MODAL */}
      <div className={`modal-overlay ${loginModal ? "active" : ""}`} onClick={() => setLoginModal(false)}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <span className="close-btn" onClick={() => setLoginModal(false)}>&times;</span>
          <h2>Kirish</h2>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email kiriting" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            <input type="password" placeholder="Parol kiriting" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? "Kirilmoqda..." : "Tizimga kirish"}</button>
          </form>
          <div className="test-creds">
            <p>Test loginlar:</p>
            {[
              { role: "Admin", email: "admin@lms.uz", pass: "admin123" },
              { role: "O'qituvchi", email: "karimov@lms.uz", pass: "teacher123" },
              { role: "O'quvchi", email: "jasur@lms.uz", pass: "student123" },
            ].map((t) => (
              <button key={t.email} onClick={() => { setLoginEmail(t.email); setLoginPassword(t.pass); }} title={`${t.email} / ${t.pass}`}>{t.role}</button>
            ))}
          </div>
        </div>
      </div>

      {/* REGISTER MODAL */}
      <div className={`modal-overlay ${registerModal ? "active" : ""}`} onClick={() => setRegisterModal(false)}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <span className="close-btn" onClick={() => setRegisterModal(false)}>&times;</span>
          <h2>Ro&apos;yxatdan o&apos;tish</h2>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Ism va familiyangiz" value={regName} onChange={(e) => setRegName(e.target.value)} required />
            <input type="email" placeholder="Email kiriting" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            <input type="password" placeholder="Yangi parol" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} />
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? "Yaratilmoqda..." : "Azo bo'lish"}</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#050505", color: "#777" }}>Yuklanmoqda...</div>}>
      <LoginContent />
    </Suspense>
  );
}
