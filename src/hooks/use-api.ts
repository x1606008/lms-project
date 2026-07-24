"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useApi<T>(url: string) {
  return useSWR<T>(url, fetcher, {
    revalidateOnFocus: true,
    errorRetryCount: 3,
  });
}
