// ProofButton.jsx — payment proof (screenshot / PDF) server se laakar naye tab mein. Public Cloudinary link nahi
// (PDF delivery account par block hai). ID card receipts aur letterhead payments dono mein.
import React, { useState } from 'react';
import { ExternalLink, FileText, Loader2 } from 'lucide-react';
import { fetchProtectedFile, openProtectedFileInNewTab } from '../../utils/protectedFile.js';

/**
 * @param {object} props
 * @param {string} props.path - e.g. `/commission/payments/<id>/proof`
 * @param {boolean} [props.isPdf]
 * @param {string} [props.className]
 */
export const ProofButton = ({ path, isPdf = false, className = '' }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const open = async () => {
    setError(null);
    setBusy(true);
    try {
      await openProtectedFileInNewTab(() => fetchProtectedFile(path));
    } catch (e) {
      setError(e?.message || 'Could not open the proof');
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col">
      <button type="button" onClick={open} disabled={busy} className={`inline-flex items-center gap-1 text-indigo-700 hover:underline disabled:opacity-60 ${className}`}>
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isPdf ? <FileText className="h-3.5 w-3.5" /> : null}
        {isPdf ? 'Open PDF' : 'View proof'} <ExternalLink className="h-3 w-3" />
      </button>
      {error && <span className="text-[11px] font-medium text-rose-600">{error}</span>}
    </span>
  );
};

export default ProofButton;
