// TemplateFlipPreview.jsx
// Saved template ka sample-student card (front + back) — GET /templates/:id/preview (Redux cache by templateId).
// Template detail pages (sab roles, read-only) aur templates list grid mein.
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { fetchSavedPreviewRequested } from '../../features/templates/templateSlice.js';
import { selectSavedTemplatePreview } from '../../features/templates/templateSelectors.js';
import IdCardFlip from '../idCards/IdCardFlip.jsx';
import IdCardSide from '../idCards/IdCardSide.jsx';
import IdCardPreview from '../idCards/IdCardPreview.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const STATIC_WIDTH = { sm: 240, md: 340, lg: 480 };

/**
 * @param {object} props
 * @param {string} props.templateId
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.showToggle=true]
 * @param {boolean} [props.showWarnings=false] - sample student ke warnings aksar kaam ke nahi
 * @param {boolean} [props.interactive=true] - false = sirf front (koi button nahi; kisi button ke andar ke liye)
 */
export const TemplateFlipPreview = ({ templateId, size = 'md', showToggle = true, showWarnings = false, interactive = true }) => {
  const dispatch = useDispatch();
  const preview = useSelector(selectSavedTemplatePreview(templateId));

  useEffect(() => {
    if (templateId) dispatch(fetchSavedPreviewRequested({ templateId }));
  }, [dispatch, templateId]);

  if (preview?.data && !interactive) {
    return preview.data.sides?.front ? (
      <div className="w-full overflow-hidden rounded-lg shadow-xs ring-1 ring-slate-200" style={{ maxWidth: STATIC_WIDTH[size] }}>
        <IdCardSide renderData={preview.data} side="FRONT" />
      </div>
    ) : (
      <IdCardPreview renderData={preview.data} width={STATIC_WIDTH[size]} showWarnings={false} className="rounded-lg overflow-hidden" />
    );
  }

  if (preview?.data) {
    return <IdCardFlip renderData={preview.data} size={size} showToggle={showToggle} showWarnings={showWarnings} />;
  }
  if (preview?.error) {
    return <ErrorMessage message={preview.error} title="Couldn't load the card preview" />;
  }
  return (
    <div className="flex h-32 items-center justify-center gap-2 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading card preview…
    </div>
  );
};

export default TemplateFlipPreview;
