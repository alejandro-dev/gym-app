// Formatea la duración de la rutina.
export function formatDuration(seconds: number) {
	const minutes = Math.max(1, Math.round(seconds / 60));
	return `${minutes}min`;
}

// Formatea la duración de la rutina en formato de resumen.
export function formatDurationSummary(seconds: number) {
	const safeSeconds = Math.max(0, seconds);
	const totalMinutes = Math.round(safeSeconds / 60);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours > 0 && minutes > 0) {
		return `${hours}h ${minutes}m`;
	}

	if (hours > 0) {
		return `${hours}h`;
	}

	return `${Math.max(1, totalMinutes)}m`;
}

// Formatea el volumen de la rutina.
export function formatVolume(volumeKg: number) {
	return volumeKg > 0 ? `${Math.round(volumeKg)} kg` : '-';
}

// Formatea el volumen compacto de la rutina.
export function formatCompactVolume(volumeKg: number) {
	if (volumeKg <= 0) return '-';

	if (volumeKg >= 1000) {
		const compactValue = volumeKg / 1000;
		const formatted = compactValue >= 10
			? Math.round(compactValue).toString()
			: compactValue.toFixed(1).replace(/\.0$/, '');

		return `${formatted}k`;
	}

	return Math.round(volumeKg).toString();
}

// Formatea la fecha de la rutina.
export function formatSessionTimeAgo(endedAt: string) {
	const diffMs = Date.now() - new Date(endedAt).getTime();
	const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

	if (diffMinutes < 60) return `hace ${diffMinutes} min`;

	const diffHours = Math.round(diffMinutes / 60);
	if (diffHours < 24) return `hace ${diffHours} h`;

	const diffDays = Math.round(diffHours / 24);
	return `hace ${diffDays} d`;
}

// Formatea el tiempo de la rutina en formato de cronómetro.
export function formatStopwatch(seconds: number) {
	const safeSeconds = Math.max(0, seconds);
	const hours = Math.floor(safeSeconds / 3600);
	const minutes = Math.floor((safeSeconds % 3600) / 60);
	const remainingSeconds = safeSeconds % 60;

	if (hours > 0) {
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
	}

	return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
