"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { id, Cursors } from "@instantdb/react";
import type { PresencePeer } from "@instantdb/react";
import type { Editor } from "tldraw";
import { db } from "@/lib/db";
import { IdeasProvider } from "@/lib/ideas-context";
import NewIdeaForm from "@/components/NewIdeaForm";
import type { Idea } from "@/types";
import type { AppSchema } from "@/instant.schema";
import type { IdeaCardShape } from "@/components/IdeaCardShape";

const Canvas = dynamic(() => import("@/components/Canvas"), { ssr: false });

const SHAPE_TYPE = "ideaCard" as const;
const ROOM_ID =
  process.env.NEXT_PUBLIC_INSTANT_ROOM_ID ??
  (process.env.NODE_ENV === "development" ? "main-dev" : "main");

const CURSOR_COLORS = [
  {
    key: "rose",
    cursor: "#e57373",
    avatarClassName: "bg-rose-400 text-rose-950 dark:bg-rose-500 dark:text-rose-50",
  },
  {
    key: "pink",
    cursor: "#f06292",
    avatarClassName: "bg-pink-400 text-pink-950 dark:bg-pink-500 dark:text-pink-50",
  },
  {
    key: "purple",
    cursor: "#ba68c8",
    avatarClassName: "bg-purple-400 text-purple-950 dark:bg-purple-500 dark:text-purple-50",
  },
  {
    key: "blue",
    cursor: "#64b5f6",
    avatarClassName: "bg-blue-400 text-blue-950 dark:bg-blue-500 dark:text-blue-50",
  },
  {
    key: "cyan",
    cursor: "#4dd0e1",
    avatarClassName: "bg-cyan-400 text-cyan-950 dark:bg-cyan-500 dark:text-cyan-50",
  },
  {
    key: "green",
    cursor: "#81c784",
    avatarClassName: "bg-green-400 text-green-950 dark:bg-green-500 dark:text-green-50",
  },
  {
    key: "amber",
    cursor: "#ffb74d",
    avatarClassName: "bg-amber-300 text-amber-950 dark:bg-amber-500 dark:text-amber-50",
  },
  {
    key: "stone",
    cursor: "#a1887f",
    avatarClassName: "bg-stone-400 text-stone-950 dark:bg-stone-500 dark:text-stone-50",
  },
];

const room = db.room("ideaBoard", ROOM_ID);
type IdeaBoardPeer = PresencePeer<AppSchema, "ideaBoard">;
type CursorColor = (typeof CURSOR_COLORS)[number];

const toShapeId = (ideaId: string): string => `shape:${ideaId}`;

const IdeaBoard = ({
  userId,
  profileId,
  displayName,
  email,
}: {
  userId: string;
  profileId: string;
  displayName: string;
  email: string;
}): React.ReactElement => {
  const { isLoading, data } = db.useQuery({
    ideas: { creator: {}, reactions: { creator: {} } },
  });

  const ideas: Idea[] = data?.ideas ?? [];
  const [editor, setEditor] = useState<Editor | null>(null);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const syncingRef = useRef(false);
  const ideasMapRef = useRef<Map<string, Idea>>(new Map());
  const colorRef = useRef(
    CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)],
  );

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
            h: ideaCardShape.props?.h ?? 250,
          },
        });
        db.transact(
          db.tx.ideas[newIdeaId]
            .update({
              title: original.title,
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
            props: { ideaId: idea.id, w: 260, h: 250 },
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

  const editingIdea = editingIdeaId ? (ideas.find((i) => i.id === editingIdeaId) ?? null) : null;

  return (
    <IdeasProvider
      ideas={ideas}
      currentUserId={userId}
      currentProfileId={profileId}
      editingIdeaId={editingIdeaId}
      setEditingIdeaId={setEditingIdeaId}
    >
      <Cursors
        room={room}
        className="h-screen w-screen"
        userCursorColor={colorRef.current.cursor}
        renderCursor={({ color, presence }) => (
          <div style={{ pointerEvents: "none", display: "inline-block" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
              <path d="M0 0 L0 12 L3.5 8.5 L6 14 L8 13 L5.5 7.5 L10 7.5Z" />
            </svg>
            <div
              style={{
                background: color,
                color: "white",
                borderRadius: 4,
                padding: "2px 6px",
                fontSize: 11,
                marginTop: 2,
                whiteSpace: "nowrap",
              }}
            >
              {presence?.displayName ?? ""}
            </div>
          </div>
        )}
      >
        <Canvas onMount={handleEditorMount} />
        <NewIdeaForm
          profileId={profileId}
          editIdea={editingIdea ? { id: editingIdea.id, title: editingIdea.title ?? "", content: editingIdea.content } : null}
          onClearEdit={() => setEditingIdeaId(null)}
        />
        <UserBar />
        <PresenceAvatars
          displayName={displayName}
          email={email}
          color={colorRef.current}
        />
      </Cursors>
    </IdeasProvider>
  );
};

const MAX_AVATARS = 6;

const PresenceAvatars = ({
  displayName,
  email,
  color,
}: {
  displayName: string;
  email: string;
  color: CursorColor;
}): React.ReactElement | null => {
  const { user: myPresence, peers, publishPresence } = db.rooms.usePresence(room, {
    initialPresence: {
      displayName,
      email,
      color: color.key,
    },
    keys: ["displayName", "email", "color"],
  });

  useEffect(() => {
    publishPresence({
      displayName,
      email,
      color: color.key,
    });
  }, [color.key, displayName, email, publishPresence]);

  const presentUsers = [
    ...(myPresence ? [{ key: "me", peer: myPresence }] : []),
    ...Object.entries(peers).map(([peerId, peer]) => ({ key: peerId, peer })),
  ];

  if (presentUsers.length === 0) return null;

  const dedupedUsers = presentUsers.filter((entry, index, collection) => {
    const identity = getPresenceIdentity(entry.peer, entry.key);
    return (
      collection.findIndex((candidate) => {
        return getPresenceIdentity(candidate.peer, candidate.key) === identity;
      }) === index
    );
  });

  const hasOverflow = dedupedUsers.length > MAX_AVATARS;
  const visibleUsers = dedupedUsers.slice(0, hasOverflow ? MAX_AVATARS - 1 : MAX_AVATARS);
  const overflowCount = dedupedUsers.length - visibleUsers.length;

  return (
    <div className="fixed right-4 top-4 z-40 flex items-center rounded-full bg-white/80 px-2 py-1.5 shadow-lg backdrop-blur dark:bg-gray-900/80">
      <div className="flex -space-x-2">
        {visibleUsers.map((peer) => (
          <PresenceAvatar key={peer.key} peer={peer.peer} />
        ))}
        {overflowCount > 0 && (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-semibold text-gray-600 shadow-sm dark:border-gray-900 dark:bg-gray-800 dark:text-gray-300"
            title={`${overflowCount} more online`}
          >
            +{overflowCount}
          </div>
        )}
      </div>
    </div>
  );
};

const PresenceAvatar = ({
  peer,
}: {
  peer: IdeaBoardPeer;
}): React.ReactElement => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHasImageError(false);

    getGravatarUrl(peer.email).then((url) => {
      if (!cancelled) setAvatarUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [peer.email]);

  const name = peer.displayName || "Anonymous";
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (avatarUrl && !hasImageError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        title={name}
        onError={() => setHasImageError(true)}
        className="h-9 w-9 rounded-full border-2 border-white bg-gray-100 object-cover shadow-sm dark:border-gray-900"
      />
    );
  }

  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-sm font-semibold shadow-sm dark:border-gray-900 ${getAvatarColorClassName(peer.color)}`}
      title={name}
    >
      {initial}
    </div>
  );
};

const getGravatarUrl = async (email: string | undefined): Promise<string | null> => {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !globalThis.crypto?.subtle) return null;

  const data = new TextEncoder().encode(normalizedEmail);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `https://www.gravatar.com/avatar/${hash}?s=72&d=404`;
};

const getPresenceIdentity = (peer: IdeaBoardPeer, fallbackKey: string): string => {
  const normalizedEmail = peer.email?.trim().toLowerCase();
  if (normalizedEmail) return normalizedEmail;

  const normalizedName = peer.displayName.trim().toLowerCase();
  if (normalizedName) return `name:${normalizedName}`;

  return `peer:${fallbackKey}`;
};

const getAvatarColorClassName = (colorKey: string | undefined): string => {
  return (
    CURSOR_COLORS.find((color) => color.key === colorKey)?.avatarClassName ??
    "bg-slate-400 text-slate-950 dark:bg-slate-500 dark:text-slate-50"
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
