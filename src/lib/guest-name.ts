// Human-friendly, deterministic guest display names derived from a user id.
//
// Given the same id, `generateGuestName` always returns the same pairing,
// so a guest sees a consistent name across tabs and peers see the same
// label for that guest.

const ADJECTIVES = [
  "Bashful",
  "Brave",
  "Bright",
  "Calm",
  "Cheerful",
  "Clever",
  "Cozy",
  "Curious",
  "Dapper",
  "Dreamy",
  "Eager",
  "Fancy",
  "Gentle",
  "Happy",
  "Jolly",
  "Keen",
  "Kind",
  "Lively",
  "Lucky",
  "Mellow",
  "Merry",
  "Nimble",
  "Peppy",
  "Plucky",
  "Proud",
  "Quick",
  "Quiet",
  "Silly",
  "Snappy",
  "Sunny",
  "Swift",
  "Tidy",
  "Witty",
  "Zesty",
];

const ANIMALS = [
  "Badger",
  "Beaver",
  "Bison",
  "Cheetah",
  "Chipmunk",
  "Dolphin",
  "Falcon",
  "Ferret",
  "Finch",
  "Fox",
  "Gecko",
  "Giraffe",
  "Goose",
  "Hedgehog",
  "Heron",
  "Koala",
  "Lemur",
  "Lynx",
  "Meerkat",
  "Moose",
  "Narwhal",
  "Otter",
  "Owl",
  "Panda",
  "Panther",
  "Pelican",
  "Penguin",
  "Puffin",
  "Quokka",
  "Rabbit",
  "Raccoon",
  "Robin",
  "Seal",
  "Sparrow",
  "Squirrel",
  "Tiger",
  "Toucan",
  "Walrus",
  "Wolf",
  "Wombat",
];

const hashString = (input: string): number => {
  // djb2 — small, fast, good enough for bucketing into a word list.
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

export const generateGuestName = (seed: string): string => {
  if (!seed) return "Guest";
  const hash = hashString(seed);
  // Mix the hash so the two buckets don't correlate for sequential ids.
  const adjective = ADJECTIVES[hash % ADJECTIVES.length];
  const animal = ANIMALS[Math.floor(hash / ADJECTIVES.length) % ANIMALS.length];
  return `${adjective} ${animal}`;
};
