import React from 'react';
import { Loader2 } from 'lucide-react';

export const InlineLoader = ({
  size = 'md', // 'sm' | 'md' | 'lg'
  text = null,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const iconClass = sizeMap[size] || sizeMap.md;

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <Loader2 className={`${iconClass} animate-spin shrink-0`} />
      {text && <span className="text-inherit">{text}</span>}
      <span className="sr-only">Loading</span>
    </span>
  );
};

export default InlineLoader;

