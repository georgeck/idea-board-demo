const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

export const timeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;

  if (diff < MINUTE) return "just now";
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `${mins} min ago`;
  }
  if (diff < DAY) {
    const hrs = Math.floor(diff / HOUR);
    return `${hrs} hr ago`;
  }
  const days = Math.floor(diff / DAY);
  return `${days}d ago`;
};
