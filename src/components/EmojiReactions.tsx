"use client";

import React from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { useIdeas } from "@/lib/ideas-context";
import type { Reaction } from "@/types";

const EMOJIS = ["👍", "💡", "🔥", "❤️", "😂", "🤔", "👀", "🚀"] as const;

const EmojiReactions = ({
  ideaId,
  reactions,
}: {
  ideaId: string;
  reactions: Reaction[];
}): React.ReactElement => {
  const { currentProfileId } = useIdeas();

  const grouped = new Map<string, { count: number; mine: Reaction | undefined }>();
  for (const emoji of EMOJIS) {
    grouped.set(emoji, { count: 0, mine: undefined });
  }
  for (const r of reactions) {
    const entry = grouped.get(r.emoji);
    if (entry) {
      entry.count++;
      if (r.creator?.id === currentProfileId) {
        entry.mine = r;
      }
    }
  }

  const handleToggle = (
    e: React.MouseEvent,
    emoji: string,
    existing: Reaction | undefined,
  ): void => {
    e.stopPropagation();
    e.preventDefault();

    if (existing) {
      db.transact(db.tx.reactions[existing.id].delete());
    } else {
      const reactionId = id();
      db.transact(
        db.tx.reactions[reactionId]
          .update({ emoji })
          .link({ idea: ideaId, creator: currentProfileId }),
      );
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {EMOJIS.map((emoji) => {
        const entry = grouped.get(emoji)!;
        const isActive = !!entry.mine;
        return (
          <button
            key={emoji}
            onClick={(e) => handleToggle(e, emoji, entry.mine)}
            className={`pointer-events-auto flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs transition-colors ${
              isActive
                ? "bg-blue-100 ring-1 ring-blue-400 dark:bg-blue-900/50 dark:ring-blue-500"
                : "bg-white/60 hover:bg-white/90 dark:bg-gray-700/60 dark:hover:bg-gray-600/80"
            }`}
          >
            <span>{emoji}</span>
            {entry.count > 0 && (
              <span className="min-w-[0.75rem] text-center text-[10px] font-medium text-gray-700 dark:text-gray-300">
                {entry.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default EmojiReactions;
