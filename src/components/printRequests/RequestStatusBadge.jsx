// RequestStatusBadge.jsx — API ke statusView { label, tone } se badge (frontend apna label nahi banata)
import React from 'react';
import { toneClasses } from './requestTones.js';

export const RequestStatusBadge = ({ statusView, size = 'sm', className = '' }) => {
  if (!statusView) return null;
  const tone = toneClasses(statusView.tone);
  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap ${tone.badge} ${sizeClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
      {statusView.label}
    </span>
  );
};

export default RequestStatusBadge;
