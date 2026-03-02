"use client";

import React, { useRef } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";

const DisplayNameModal = ({
  userId,
}: {
  userId: string;
}): React.ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const displayName = inputRef.current!.value.trim();
    if (!displayName) return;

    const profileId = id();
    db.transact(
      db.tx.profiles[profileId]
        .update({ displayName })
        .link({ $user: userId }),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900">
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          Welcome to Idea Board!
        </h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Choose a display name so others know who you are.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            ref={inputRef}
            type="text"
            required
            autoFocus
            placeholder="Your name"
            maxLength={30}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default DisplayNameModal;
