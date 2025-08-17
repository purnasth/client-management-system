import { useQuery } from "@tanstack/react-query";
import { fetchLocalJson } from "../utils/fetchLocalJson";

export function useLocalApi<T = unknown>(relativePath: string) {
  return useQuery<T>({
    queryKey: [relativePath],
    queryFn: () => fetchLocalJson<T>(relativePath),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
