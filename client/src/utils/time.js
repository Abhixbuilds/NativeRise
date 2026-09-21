export function formatDuration(ms) {
  // Ensure we have a non‑negative number
  const total = Math.max(0, ms);
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / (60 * 1000)) % 60;
  const hours = Math.floor(total / (3600 * 1000));

  const pad = (n) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}
