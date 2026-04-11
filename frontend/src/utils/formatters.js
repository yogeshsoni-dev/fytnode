// Format ISO datetime string → 'HH:MM'
export function formatTime(iso) {
  if (!iso) return null;
  return new Date(iso).toTimeString().slice(0, 5);
}

// Format ISO string → 'YYYY-MM-DD'
export function formatDate(iso) {
  if (!iso) return '';
  return iso.split('T')[0];
}

// Calculate duration between two HH:MM strings → '1h 30m'
export function calcDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '—';
  const [ih, im] = checkIn.split(':').map(Number);
  const [oh, om] = checkOut.split(':').map(Number);
  const mins = (oh * 60 + om) - (ih * 60 + im);
  if (mins <= 0) return '—';
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// Extract error message from axios error
export function getErrorMessage(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
}
