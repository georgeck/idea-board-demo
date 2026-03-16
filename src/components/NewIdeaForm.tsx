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
  editIdea: { id: string; title: string; content: string } | null;
  onClearEdit: () => void;
}): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = editIdea !== null;
  const modalOpen = isOpen || isEditing;

  useEffect(() => {
    if (modalOpen && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [modalOpen]);

  const handleClose = (): void => {
    setIsOpen(false);
    onClearEdit();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const title = titleRef.current!.value.trim();
    const content = contentRef.current!.value.trim();
    if (!title) return;

    if (isEditing) {
      db.transact(db.tx.ideas[editIdea.id].update({ title, content }));
    } else {
      const x = 100 + Math.random() * 600;
      const y = 100 + Math.random() * 400;
      const ideaId = id();
      db.transact(
        db.tx.ideas[ideaId]
          .update({ title, content, createdAt: Date.now(), x, y })
          .link({ creator: profileId }),
      );
    }

    handleClose();
  };

  if (!modalOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-2xl transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-blue-200"
        title="New Idea"
      >
        <span className="text-xl">💡</span>
        Share an Idea
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-900">
        <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white">
          {isEditing ? "Edit Idea" : "New Idea"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            key={`${editIdea?.id ?? "new"}-title`}
            ref={titleRef}
            type="text"
            defaultValue={editIdea?.title ?? ""}
            placeholder="Idea title…"
            required
            maxLength={100}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
          <textarea
            key={`${editIdea?.id ?? "new"}-content`}
            ref={contentRef}
            defaultValue={editIdea?.content ?? ""}
            placeholder="Describe your idea…"
            rows={4}
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
