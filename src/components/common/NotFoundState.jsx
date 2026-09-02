import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';

export const NotFoundState = ({
  title = 'Page Not Found',
  description = 'The page you are looking for does not exist or has been moved.',
  returnPath = ROUTES.DASHBOARD,
  returnLabel = 'Return to Dashboard',
}) => {
  return (
    <div
      role="region"
      aria-label="404 Not Found"
      className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md w-full mx-auto shadow-xl"
    >
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center shadow-inner">
        <HelpCircle className="w-8 h-8" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <span className="text-4xl font-black text-indigo-600 font-mono tracking-tight block">
          404
        </span>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-2">
        <Link
          to={returnPath}
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{returnLabel}</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundState;

