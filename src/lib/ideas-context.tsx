"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { Idea } from "@/types";

interface IdeasContextValue {
  ideasMap: Map<string, Idea>;
  currentUserId: string;
  currentProfileId: string;
}

const IdeasContext = createContext<IdeasContextValue | null>(null);

export const useIdeas = (): IdeasContextValue => {
  const ctx = useContext(IdeasContext);
  if (!ctx) throw new Error("useIdeas must be used inside IdeasProvider");
  return ctx;
};

export const IdeasProvider = ({
  ideas,
  currentUserId,
  currentProfileId,
  children,
}: {
  ideas: Idea[];
  currentUserId: string;
  currentProfileId: string;
  children: React.ReactNode;
}): React.ReactElement => {
  const ideasMap = useMemo(() => {
    const map = new Map<string, Idea>();
    for (const idea of ideas) {
      map.set(idea.id, idea);
    }
    return map;
  }, [ideas]);

  const value = useMemo(
    () => ({ ideasMap, currentUserId, currentProfileId }),
    [ideasMap, currentUserId, currentProfileId],
  );

  return (
    <IdeasContext.Provider value={value}>{children}</IdeasContext.Provider>
  );
};
