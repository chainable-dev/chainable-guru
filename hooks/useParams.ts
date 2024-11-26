import { useParams as useNextParams } from "next/navigation";

interface Params {
  id: string;
  [key: string]: string | string[];
}

export function useParams() {
  const params = useNextParams();
  return params as Params;
} 