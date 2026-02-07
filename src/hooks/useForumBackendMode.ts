import { useEffect, useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";

export type ForumBackendMode = "checking" | "v2" | "legacy";

const PROBE_ARGS = {
  board: "rescue" as const,
  category: "all" as const,
  city: "all",
  sort: "local_recent" as const,
  limit: 1,
};

export function useForumBackendMode() {
  const convex = useConvex();
  const [mode, setMode] = useState<ForumBackendMode>("checking");

  useEffect(() => {
    let active = true;

    const detect = async () => {
      try {
        await convex.query(api.community.listThreads, PROBE_ARGS);
        if (active) setMode("v2");
      } catch {
        if (active) setMode("legacy");
      }
    };

    void detect();
    return () => {
      active = false;
    };
  }, [convex]);

  return mode;
}
