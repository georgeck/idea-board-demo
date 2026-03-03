"use client";

import React, { useState, useRef, useEffect } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";

const NewIdeaForm = ({
  profileId,
  editIdea,
  onClearEdit,
}: {
  profileId: string;
  editIdea: { id: string; content: string } | null;
  onClearEdit: () => void;
}): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = editIdea !== null;
  const modalOpen = isOpen || isEditing;

  useEffect(() => {
    if (modalOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [modalOpen]);

  const handleClose = (): void => {
    setIsOpen(false);
    onClearEdit();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const content = inputRef.current!.value.trim();
    if (!content) return;

    if (isEditing) {
      db.transact(db.tx.ideas[editIdea.id].update({ content }));
    } else {
      const x = 100 + Math.random() * 600;
      const y = 100 + Math.random() * 400;
      const ideaId = id();
      db.transact(
        db.tx.ideas[ideaId]
          .update({ content, createdAt: Date.now(), x, y })
          .link({ creator: profileId }),
      );
    }

    handleClose();
  };

  if (!modalOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-xl transition-transform hover:scale-105 hover:bg-blue-700"
        title="New Idea"
      >
        +
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            key={editIdea?.id ?? "new"}
            ref={inputRef}
            defaultValue={editIdea?.content ?? ""}
            placeholder="Share your idea..."
            required
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {isEditing ? "Update" : "Post Idea"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewIdeaForm;
