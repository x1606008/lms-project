"use client";

export default function StatCard({
  label,
  value,
  icon,
  color = "blue",
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  delay?: number;
}) {
  const gradients: Record<string, string> = {
    blue: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))",
    green: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
    yellow: "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))",
    red: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))",
    purple: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05))",
  };

  const iconColors: Record<string, string> = {
    blue: "#6366f1",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    purple: "#a855f7",
  };

  return (
    <div
      className="stat-card animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{value}</p>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 hover:scale-110"
          style={{ background: gradients[color] || gradients.blue }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
