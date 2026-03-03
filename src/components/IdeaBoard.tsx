"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { id } from "@instantdb/react";
import type { Editor } from "tldraw";
import { db } from "@/lib/db";
import { IdeasProvider } from "@/lib/ideas-context";
import NewIdeaForm from "@/components/NewIdeaForm";
import type { Idea } from "@/types";
import type { IdeaCardShape } from "@/components/IdeaCardShape";

const Canvas = dynamic(() => import("@/components/Canvas"), { ssr: false });

const SHAPE_TYPE = "ideaCard" as const;

const toShapeId = (ideaId: string): string => `shape:${ideaId}`;

const IdeaBoard = ({
  userId,
  profileId,
}: {
  userId: string;
  profileId: string;
}): React.ReactElement => {
  const { isLoading, data } = db.useQuery({
    ideas: { creator: {}, reactions: { creator: {} } },
  });

  const ideas: Idea[] = data?.ideas ?? [];
  const [editor, setEditor] = useState<Editor | null>(null);
  const syncingRef = useRef(false);
  const ideasMapRef = useRef<Map<string, Idea>>(new Map());

  useEffect(() => {
    ideasMapRef.current = new Map(ideas.map((i) => [i.id, i]));
  }, [ideas]);

  const handleEditorMount = useCallback((ed: Editor): void => {
    setEditor(ed);

    ed.sideEffects.registerAfterChangeHandler("shape", (prev, next) => {
      if (syncingRef.current) return;
      if (next.type !== SHAPE_TYPE) return;

      const prevShape = prev as unknown as IdeaCardShape;
      const nextShape = next as unknown as IdeaCardShape;

      if (prevShape.x !== nextShape.x || prevShape.y !== nextShape.y) {
        const ideaId = nextShape.props.ideaId;
        if (ideaId) {
          db.transact(
            db.tx.ideas[ideaId].update({
              x: Math.round(nextShape.x),
              y: Math.round(nextShape.y),
            }),
          );
        }
      }
    });

    ed.sideEffects.registerAfterDeleteHandler("shape", (shape) => {
      if (syncingRef.current) return;
      if (shape.type !== SHAPE_TYPE) return;
      const ideaCardShape = shape as unknown as IdeaCardShape;
      const ideaId = ideaCardShape.props?.ideaId;
      if (ideaId) {
        db.transact(db.tx.ideas[ideaId].delete());
      }
    });

    ed.sideEffects.registerAfterCreateHandler("shape", (shape) => {
      if (syncingRef.current) return;
      if (shape.type !== SHAPE_TYPE) return;
      const ideaCardShape = shape as unknown as IdeaCardShape;
      const ideaId = ideaCardShape.props?.ideaId;
      if (!ideaId) return;
      if (toShapeId(ideaId) === shape.id) return;

      const original = ideasMapRef.current.get(ideaId);
      if (!original?.creator) return;

      const creatorProfileId =
        typeof original.creator === "object" &&
        original.creator !== null &&
        "id" in original.creator
          ? (original.creator as { id: string }).id
          : null;
      if (!creatorProfileId) return;

      const newIdeaId = id();
      syncingRef.current = true;
      try {
        ed.updateShape({
          id: ideaCardShape.id,
          type: SHAPE_TYPE,
          props: {
            ideaId: newIdeaId,
            w: ideaCardShape.props?.w ?? 260,
            h: ideaCardShape.props?.h ?? 220,
          },
        });
        db.transact(
          db.tx.ideas[newIdeaId]
            .update({
              content: original.content,
              createdAt: Date.now(),
              x: Math.round(ideaCardShape.x),
              y: Math.round(ideaCardShape.y),
            })
            .link({ creator: creatorProfileId }),
        );
      } finally {
        syncingRef.current = false;
      }
    });
  }, []);

  useEffect(() => {
    if (!editor || isLoading) return;

    syncingRef.current = true;

    try {
      const existingShapes = editor
        .getCurrentPageShapes()
        .filter((s): s is IdeaCardShape => s.type === SHAPE_TYPE);

      const existingMap = new Map(
        existingShapes.map((s) => [s.props.ideaId, s]),
      );
      const ideaIds = new Set(ideas.map((i) => i.id));

      const toDelete = existingShapes
        .filter((s) => !ideaIds.has(s.props.ideaId))
        .map((s) => s.id);

      if (toDelete.length > 0) {
        editor.deleteShapes(toDelete);
      }

      for (const idea of ideas) {
        const existing = existingMap.get(idea.id);
        if (!existing) {
          editor.createShape({
            id: toShapeId(idea.id) as IdeaCardShape["id"],
            type: SHAPE_TYPE,
            x: idea.x,
            y: idea.y,
            props: { ideaId: idea.id, w: 260, h: 220 },
          });
        } else {
          const dx = Math.abs(existing.x - idea.x);
          const dy = Math.abs(existing.y - idea.y);
          if (dx > 1 || dy > 1) {
            editor.updateShape({
              id: existing.id,
              type: SHAPE_TYPE,
              x: idea.x,
              y: idea.y,
            });
          }
        }
      }
    } finally {
      syncingRef.current = false;
    }
  }, [editor, ideas, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-400">Loading ideas...</div>
      </div>
    );
  }

  return (
    <IdeasProvider
      ideas={ideas}
      currentUserId={userId}
      currentProfileId={profileId}
    >
      <div className="h-screen w-screen">
        <Canvas onMount={handleEditorMount} />
        <NewIdeaForm profileId={profileId} />
        <UserBar />
      </div>
    </IdeasProvider>
  );
};

const UserBar = (): React.ReactElement => {
  return (
    <div className="fixed left-4 top-4 z-40 flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 shadow-lg backdrop-blur dark:bg-gray-900/90">
      <h1 className="text-sm font-bold text-gray-800 dark:text-white">
        Idea Board
      </h1>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <button
        onClick={() => db.auth.signOut()}
        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Sign out
      </button>
    </div>
  );
};

export default IdeaBoard;
