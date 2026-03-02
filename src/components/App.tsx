"use client";

import React from "react";
import { db } from "@/lib/db";
import Auth from "@/components/Auth";
import DisplayNameModal from "@/components/DisplayNameModal";
import IdeaBoard from "@/components/IdeaBoard";

const App = (): React.ReactElement => {
  const { isLoading: authLoading, user, error: authError } = db.useAuth();

  const userId = user?.id ?? "";
  const { isLoading: profileLoading, data: profileData } = db.useQuery(
    userId
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

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  const profile = profileData?.profiles?.[0];
  if (!profile) {
    return <DisplayNameModal userId={user.id} />;
  }

  return <IdeaBoard userId={user.id} profileId={profile.id} />;
};

export default App;
