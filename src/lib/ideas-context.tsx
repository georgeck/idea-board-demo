"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { Idea } from "@/types";

interface IdeasContextValue {
  ideasMap: Map<string, Idea>;
  currentUserId: string;
  currentProfileId: string;
  editingIdeaId: string | null;
  setEditingIdeaId: (id: string | null) => void;
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
  editingIdeaId,
  setEditingIdeaId,
  children,
}: {
  ideas: Idea[];
  currentUserId: string;
  currentProfileId: string;
  editingIdeaId: string | null;
  setEditingIdeaId: (id: string | null) => void;
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
    () => ({ ideasMap, currentUserId, currentProfileId, editingIdeaId, setEditingIdeaId }),
    [ideasMap, currentUserId, currentProfileId, editingIdeaId, setEditingIdeaId],
  );

  return (
    <IdeasContext.Provider value={value}>{children}</IdeasContext.Provider>
  );
};
