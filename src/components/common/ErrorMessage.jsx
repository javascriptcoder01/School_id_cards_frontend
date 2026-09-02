import React from 'react';
import { AlertCircle, X } from 'lucide-react';

/**
 * Reusable ErrorMessage Alert Component
 * Safely renders user-facing error messages without exposing raw internals
 */
export const ErrorMessage = ({ message, title = 'Error', onDismiss }) => {
  if (!message) return null;

  // Extract clean string message
  let displayMessage = '';
  if (typeof message === 'string') {
    displayMessage = message;
  } else if (typeof message === 'object' && message !== null) {
    displayMessage = message.message || 'An unexpected error occurred.';
  } else {
    displayMessage = 'An error occurred. Please try again.';
  }

  return (
    <div
      className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 transition-all duration-200 shadow-xs"
      role="alert"
    >
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 text-sm">
        {title && <span className="font-semibold block mb-0.5 text-red-900">{title}</span>}
        <p className="text-red-700 leading-relaxed">{displayMessage}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 rounded-lg p-1 transition-colors"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

