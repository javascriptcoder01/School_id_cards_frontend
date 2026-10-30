// TemplateCardGrid.jsx
// Templates ka card grid: har template ka sample-student preview (click / Space se flip), naam, version, status.
import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import TemplateFlipPreview from './TemplateFlipPreview.jsx';
import TemplateStatusBadge from './TemplateStatusBadge.jsx';

const idOf = (template) => template.id || template._id;

/**
 * @param {object} props
 * @param {object[]} props.templates
 * @param {boolean} props.isLoading
 * @param {(templateId: string) => string} props.getDetailRoute
 * @param {string} [props.detailLabel='View details']
 */
export const TemplateCardGrid = ({ templates = [], isLoading = false, getDetailRoute, detailLabel = 'View details' }) => {
  if (isLoading && templates.length === 0) {
    return (
      <p className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading templates…
      </p>
    );
  }
  if (templates.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-500">No templates found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {templates.map((template) => (
        <article key={idOf(template)} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex min-h-48 items-center justify-center rounded-2xl bg-slate-100/70 p-4">
            <TemplateFlipPreview templateId={idOf(template)} size="sm" showToggle={false} />
          </div>
          <div className="mt-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900">{template.name}</h3>
              <p className="text-xs text-slate-500">
                v{template.version ?? 1} · {template.hasBack ? 'Front + back' : 'Front only'}
                {template.resolvedTheme?.name ? ` · ${template.resolvedTheme.name}` : ''}
              </p>
            </div>
            <TemplateStatusBadge isActive={template.isActive !== false} />
          </div>
          <Link
            to={getDetailRoute(idOf(template))}
            className="mt-3 inline-flex items-center gap-1 self-start text-xs font-semibold text-indigo-700 hover:underline"
          >
            {detailLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </article>
      ))}
    </div>
  );
};

export default TemplateCardGrid;
