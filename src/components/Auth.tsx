"use client";

import React, { useState, useRef } from "react";
import { db } from "@/lib/db";

const Auth = (): React.ReactElement => {
  const [sentEmail, setSentEmail] = useState("");

  const handleGuestSignIn = (): void => {
    db.auth.signInAsGuest().catch((err: { body?: { message?: string } }) => {
      alert("Uh oh: " + err.body?.message);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Idea Board
        </h1>
        <MagicCodeForm sentEmail={sentEmail} onSendEmail={setSentEmail} />
        {!sentEmail && (
          <>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                or
              </span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>
            <button
              type="button"
              onClick={handleGuestSignIn}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Continue as Guest
            </button>
            <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-500">
              Guests can view the live board. Sign in when you are ready to edit.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export const MagicCodeForm = ({
  sentEmail,
  onSendEmail,
}: {
  sentEmail: string;
  onSendEmail: (email: string) => void;
}): React.ReactElement => {
  if (!sentEmail) {
    return <EmailStep onSendEmail={onSendEmail} />;
  }

  return <CodeStep sentEmail={sentEmail} onBack={() => onSendEmail("")} />;
};

const EmailStep = ({
  onSendEmail,
}: {
  onSendEmail: (email: string) => void;
}): React.ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const email = inputRef.current!.value;
    onSendEmail(email);
    db.auth.sendMagicCode({ email }).catch((err: { body?: { message?: string } }) => {
      alert("Uh oh: " + err.body?.message);
      onSendEmail("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Enter your email to sign in. We&apos;ll send you a verification code.
      </p>
      <input
        ref={inputRef}
        type="email"
        required
        autoFocus
        placeholder="you@example.com"
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Send Code
      </button>
    </form>
  );
};

const CodeStep = ({
  sentEmail,
  onBack,
}: {
  sentEmail: string;
  onBack: () => void;
}): React.ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const code = inputRef.current!.value;
    db.auth
      .signInWithMagicCode({ email: sentEmail, code })
      .catch((err: { body?: { message?: string } }) => {
        inputRef.current!.value = "";
        alert("Uh oh: " + err.body?.message);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        We sent a code to <strong className="text-gray-900 dark:text-white">{sentEmail}</strong>.
        Check your email and paste it below.
      </p>
      <input
        ref={inputRef}
        type="text"
        required
        autoFocus
        placeholder="123456..."
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Verify Code
      </button>
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Use a different email
      </button>
    </form>
  );
};

export default Auth;
