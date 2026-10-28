// requestTones.js — backend statusView.tone → Tailwind classes (poori class strings, taaki Tailwind unhe dekh sake)
// Status → label / tone ka mapping frontend mein NAHI hai; wo API (statusView) se aata hai.

export const TONE_CLASSES = {
  slate: { badge: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400', soft: 'bg-slate-50 text-slate-700', icon: 'bg-slate-100 text-slate-600' },
  amber: { badge: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500', soft: 'bg-amber-50 text-amber-800', icon: 'bg-amber-100 text-amber-700' },
  rose: { badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', soft: 'bg-rose-50 text-rose-700', icon: 'bg-rose-100 text-rose-700' },
  blue: { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', soft: 'bg-blue-50 text-blue-700', icon: 'bg-blue-100 text-blue-700' },
  violet: { badge: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500', soft: 'bg-violet-50 text-violet-700', icon: 'bg-violet-100 text-violet-700' },
  emerald: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-700', icon: 'bg-emerald-100 text-emerald-700' },
  indigo: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', soft: 'bg-indigo-50 text-indigo-700', icon: 'bg-indigo-100 text-indigo-700' },
};

export const toneClasses = (tone) => TONE_CLASSES[tone] || TONE_CLASSES.slate;

// History / timeline mein "kisne kiya"
export const ROLE_LABELS = {
  OPERATOR: 'Class Teacher',
  COLLEGE_ADMIN: 'School Admin',
  SUPER_ADMIN: 'Print Center',
  SYSTEM: 'System',
};
