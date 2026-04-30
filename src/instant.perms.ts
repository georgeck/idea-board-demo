import type { InstantRules } from "@instantdb/react";

const rules = {
  profiles: {
    bind: {
      isFullUser: "auth.email != null",
      isOwner: "auth.id in data.ref('$user.id')",
    },
    allow: {
      view: "true",
      create: "isFullUser && isOwner",
      update: "isFullUser && isOwner",
    },
  },
  ideas: {
    bind: {
      isFullUser: "auth.email != null",
    },
    allow: {
      view: "true",
      create: "isFullUser",
      update: "isFullUser",
      delete: "isFullUser",
    },
  },
  reactions: {
    bind: {
      isFullUser: "auth.email != null",
      isOwner: "auth.id in data.ref('creator.$user.id')",
    },
    allow: {
      view: "true",
      create: "isFullUser && isOwner",
      delete: "isFullUser && isOwner",
    },
  },
} satisfies InstantRules;

export default rules;
