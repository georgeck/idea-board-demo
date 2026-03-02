import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type Idea = InstaQLEntity<
  AppSchema,
  "ideas",
  { creator: {}; reactions: { creator: {} } }
>;

export type Reaction = InstaQLEntity<AppSchema, "reactions", { creator: {} }>;

export type Profile = InstaQLEntity<AppSchema, "profiles">;
