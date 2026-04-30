"use client";

import React from "react";
import { db } from "@/lib/db";
import Auth from "@/components/Auth";
import DisplayNameModal from "@/components/DisplayNameModal";
import IdeaBoard from "@/components/IdeaBoard";

const App = (): React.ReactElement => {
  const { isLoading: authLoading, user, error: authError } = db.useAuth();

  const userId = user?.id ?? "";
  const needsProfile = !!user && !user.isGuest;
  const { isLoading: profileLoading, data: profileData } = db.useQuery(
    needsProfile
      ? { profiles: { $: { where: { "$user.id": userId } } } }
      : null,
  );

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-red-500">Error: {authError.message}</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (user.isGuest) {
    return (
      <IdeaBoard
        userId={user.id}
        profileId=""
        displayName="Guest"
        email=""
        isGuest={true}
      />
    );
  }

  const profile = profileData?.profiles?.[0];

  // Keep the board mounted while the user picks a display name so the
  // upgrade flow feels continuous (especially when a guest just signed up).
  return (
    <>
      <IdeaBoard
        userId={user.id}
        profileId={profile?.id ?? ""}
        displayName={profile?.displayName ?? ""}
        email={user.email ?? ""}
        isGuest={false}
      />
      {!profileLoading && !profile && <DisplayNameModal userId={user.id} />}
    </>
  );
};

export default App;
