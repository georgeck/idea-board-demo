import type { InstantRules } from "@instantdb/react";

const rules = {
  profiles: {
    allow: {
      view: "true",
      create: "true",
      update: "auth.id in data.ref('$user.id')",
    },
  },
  ideas: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "auth.id in data.ref('creator.$user.id')",
    },
  },
  reactions: {
    allow: {
      view: "true",
      create: "true",
      delete: "auth.id in data.ref('creator.$user.id')",
    },
  },
} satisfies InstantRules;

export default rules;
