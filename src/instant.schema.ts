import { i } from "@instantdb/react";

const _schema = i.schema({
  rooms: {
    ideaBoard: {
      presence: i.entity({
        displayName: i.string(),
        color: i.string(),
      }),
    },
  },
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    profiles: i.entity({
      displayName: i.string(),
    }),
    ideas: i.entity({
      title: i.string().optional(),
      content: i.string(),
      createdAt: i.number().indexed(),
      x: i.number(),
      y: i.number(),
    }),
    reactions: i.entity({
      emoji: i.string(),
    }),
  },
  links: {
    profileUser: {
      forward: {
        on: "profiles",
        has: "one",
        label: "$user",
        onDelete: "cascade",
      },
      reverse: { on: "$users", has: "one", label: "profile" },
    },
    ideaCreator: {
      forward: { on: "ideas", has: "one", label: "creator" },
      reverse: { on: "profiles", has: "many", label: "ideas" },
    },
    reactionIdea: {
      forward: {
        on: "reactions",
        has: "one",
        label: "idea",
        onDelete: "cascade",
      },
      reverse: { on: "ideas", has: "many", label: "reactions" },
    },
    reactionUser: {
      forward: { on: "reactions", has: "one", label: "creator" },
      reverse: { on: "profiles", has: "many", label: "reactions" },
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
