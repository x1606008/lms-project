"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  return { session, status, role: (session?.user as { role?: string })?.role };
}

export function useFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Xatolik");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Ma'lumotlarni olishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}
