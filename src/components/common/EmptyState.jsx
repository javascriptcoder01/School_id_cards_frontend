import React from 'react';
import { Layers } from 'lucide-react';

export const EmptyState = ({
  title = 'No Records Found',
  description = 'There is no data to display right now.',
  actionLabel = null,
  onAction = null,
  icon: Icon = Layers,
  className = '',
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      className={`bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center shadow-inner">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {description && (
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
