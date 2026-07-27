"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const SWIPE_THRESHOLD = 120;

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    width: 0,
    height: 0,
    radius: 0,
    points: [] as { x: number; y: number; z: number }[],
    angleY: 0,
    angleX: 0.2,
    isDragging: false,
    startX: 0,
    dragDistance: 0,
    animFrame: 0,
  });

  const swipeFillRef = useRef<HTMLDivElement>(null);
  const swipeTextRef = useRef<HTMLSpanElement>(null);

  const resize = useCallback(() => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    s.width = canvas.width = window.innerWidth;
    s.height = canvas.height = window.innerHeight;
    s.radius = Math.min(s.width, s.height) * 0.28;
    createGlobePoints();
  }, []);

  function createGlobePoints() {
    const s = stateRef.current;
    s.points = [];
    const latCount = 24;
    const lonCount = 48;
    for (let i = 0; i <= latCount; i++) {
      const theta = (i * Math.PI) / latCount;
      for (let j = 0; j < lonCount; j++) {
        const phi = (j * 2 * Math.PI) / lonCount;
        const x = s.radius * Math.sin(theta) * Math.cos(phi);
        const y = s.radius * Math.cos(theta);
        const z = s.radius * Math.sin(theta) * Math.sin(phi);
        s.points.push({ x, y, z });
      }
    }
  }

  function rotateAndProject(p: { x: number; y: number; z: number }) {
    const s = stateRef.current;
    let x1 = p.x * Math.cos(s.angleY) - p.z * Math.sin(s.angleY);
    let z1 = p.x * Math.sin(s.angleY) + p.z * Math.cos(s.angleY);
    let y2 = p.y * Math.cos(s.angleX) - z1 * Math.sin(s.angleX);
    let z2 = p.y * Math.sin(s.angleX) + z1 * Math.cos(s.angleX);
    const fov = 400;
    const scale = fov / (fov + z2 + s.radius);
    return { x: x1 * scale + s.width / 2, y: y2 * scale + s.height / 2, z: z2, scale };
  }

  function animate() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    ctx.clearRect(0, 0, s.width, s.height);

    const gradient = ctx.createRadialGradient(s.width / 2, s.height / 2, s.radius * 0.2, s.width / 2, s.height / 2, s.radius * 1.5);
    gradient.addColorStop(0, "rgba(0, 150, 255, 0.08)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, s.width, s.height);

    if (!s.isDragging) {
      s.angleY += 0.003;
    }

    s.points.forEach((p) => {
      const proj = rotateAndProject(p);
      const alpha = Math.max(0.1, (proj.z + s.radius) / (2 * s.radius));
      const size = Math.max(0.8, proj.scale * 1.8);
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 200, 255, ${alpha * 0.85})`;
      ctx.fill();
    });

    s.animFrame = requestAnimationFrame(animate);
  }

  function handleStart(clientX: number) {
    const s = stateRef.current;
    s.isDragging = true;
    s.startX = clientX;
    s.dragDistance = 0;
  }

  function handleMove(clientX: number) {
    const s = stateRef.current;
    if (!s.isDragging) return;
    s.dragDistance = clientX - s.startX;
    s.angleY += s.dragDistance * 0.0003;

    const progress = Math.min(Math.abs(s.dragDistance) / SWIPE_THRESHOLD, 1) * 100;
    if (swipeFillRef.current) swipeFillRef.current.style.width = progress + "%";
    if (swipeTextRef.current) {
      if (progress >= 100) {
        swipeTextRef.current.innerText = "O'TILMOQDA...";
        swipeTextRef.current.style.color = "#00ffaa";
      } else {
        swipeTextRef.current.innerText = s.dragDistance > 0 ? "O'NGGA SURILMOQDA..." : "CHAPGA SURILMOQDA...";
        swipeTextRef.current.style.color = "#00c8ff";
      }
    }
  }

  function handleEnd() {
    const s = stateRef.current;
    if (!s.isDragging) return;
    s.isDragging = false;

    if (Math.abs(s.dragDistance) >= SWIPE_THRESHOLD) {
      document.body.style.opacity = "0";
      document.body.style.transition = "opacity 0.4s ease";
      setTimeout(() => {
        router.push("/login");
      }, 400);
    } else {
      if (swipeFillRef.current) swipeFillRef.current.style.width = "0%";
      if (swipeTextRef.current) {
        swipeTextRef.current.innerText = "\u2190 Surmaysizmi \u2192";
        swipeTextRef.current.style.color = "#00c8ff";
      }
    }
  }

  useEffect(() => {
    if (status === "loading" || !session) return;
    const role = (session.user as { role: string }).role;
    const dashboards: Record<string, string> = { ADMIN: "/admin", TEACHER: "/teacher", STUDENT: "/student" };
    router.push(dashboards[role] || "/login");
  }, [session, status, router]);

  useEffect(() => {
    resize();
    animate();
    window.addEventListener("resize", resize);

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(stateRef.current.animFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [resize]);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 100vw; height: 100vh; overflow: hidden; background-color: #08090d; display: flex; justify-content: center; align-items: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; cursor: grab; user-select: none; }
        body:active { cursor: grabbing; }
        #globeCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
        .content { position: relative; z-index: 2; color: #ffffff; text-align: center; pointer-events: none; display: flex; flex-direction: column; align-items: center; }
        .content h1 { font-size: 2.2rem; letter-spacing: 2px; margin-bottom: 10px; text-shadow: 0 0 20px rgba(0, 200, 255, 0.5); }
        .content p { color: #8a99ad; font-size: 0.95rem; }
        .swipe-indicator { margin-top: 35px; display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0.8; transition: opacity 0.3s ease; }
        .swipe-track { width: 160px; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; overflow: hidden; position: relative; border: 1px solid rgba(0, 200, 255, 0.2); }
        .swipe-fill { position: absolute; top: 0; left: 50%; height: 100%; width: 0%; background: linear-gradient(90deg, #00c8ff, #00ffaa); box-shadow: 0 0 10px #00c8ff; transform: translateX(-50%); transition: width 0.1s linear; }
        .swipe-text { font-size: 0.8rem; color: #00c8ff; letter-spacing: 1px; text-transform: uppercase; }
      `}</style>

      <canvas ref={canvasRef} id="globeCanvas" />

      <div className="content">
        <h1>Xush kelibsiz</h1>
        <p>Boshqa sahifaga o&apos;tish uchun ekranni ushlab suring</p>
        <div className="swipe-indicator">
          <div className="swipe-track">
            <div className="swipe-fill" ref={swipeFillRef} />
          </div>
          <span className="swipe-text" ref={swipeTextRef}>&#8592; Surmaysizmi &#8594;</span>
        </div>
      </div>
    </>
  );
}
