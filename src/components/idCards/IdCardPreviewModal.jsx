// IdCardPreviewModal.jsx — cards ka bada preview (carousel) ek modal mein. Escape / backdrop se band.
// Inner dialog sirf open hone par mount hota hai.
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Dialog = ({ title, subtitle, onClose, footer, children }) => {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} aria-label="Close preview" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-preview-modal-title"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 id="card-preview-modal-title" className="text-base font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
};

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {() => void} props.onClose
 * @param {React.ReactNode} [props.footer]
 * @param {React.ReactNode} props.children
 */
export const IdCardPreviewModal = ({ open, ...props }) => (open ? <Dialog {...props} /> : null);

export default IdCardPreviewModal;
