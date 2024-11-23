import { useParams as useNextParams } from "next/navigation";

export function useParams() {
  const params = useNextParams();
  return params as { id: string };
} 