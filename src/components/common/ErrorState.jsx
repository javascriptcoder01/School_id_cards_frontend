import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Something Went Wrong',
  message = 'An error occurred while processing your request. Please try again.',
  retryLabel = 'Try Again',
  onRetry = null,
  className = '',
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`bg-rose-50/70 border border-rose-200 p-6 sm:p-8 rounded-3xl text-center space-y-4 shadow-xs ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-rose-900">{title}</h3>
        <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{retryLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;

