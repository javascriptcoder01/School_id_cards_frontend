import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const OperatorScopeBadge = ({ className = '', section = '' }) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80 shadow-2xs">
      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
      <span>
        Class {className || '—'} {section ? `(Sec ${section})` : ''}
      </span>
    </span>
  );
};

export default OperatorScopeBadge;

