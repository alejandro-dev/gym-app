export function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}min`;
}

export function formatVolume(volumeKg: number) {
  return volumeKg > 0 ? `${Math.round(volumeKg)} kg` : '-';
}

export function formatSessionTimeAgo(endedAt: string) {
  const diffMs = Date.now() - new Date(endedAt).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `hace ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;

  const diffDays = Math.round(diffHours / 24);
  return `hace ${diffDays} d`;
}
