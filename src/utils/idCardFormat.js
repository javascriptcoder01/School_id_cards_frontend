// idCardFormat.js — ID card batch pages ke chhote formatters

// e.g. "27 Oct 2026, 09:52 pm"; invalid / khaali → "—"
export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
};

export default {
  formatDateTime,
};
