import React from 'react';
import { FileArchive, FileText, Download } from 'lucide-react';
import InlineLoader from '../common/InlineLoader.jsx';

export const PrintDownloadActions = ({
  onDownloadZip,
  onDownloadPdf,
  isDownloading = false,
  downloadType = null,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={onDownloadZip}
        disabled={isDownloading || disabled}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        title="Download All ID Cards as a ZIP Archive"
      >
        {isDownloading && downloadType === 'ZIP' ? (
          <>
            <InlineLoader />
            <span>Packaging ZIP...</span>
          </>
        ) : (
          <>
            <FileArchive className="w-4 h-4" />
            <span>Download College ZIP</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onDownloadPdf}
        disabled={isDownloading || disabled}
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        title="Export Multi-Page PDF Print Sheet"
      >
        {isDownloading && downloadType === 'PDF' ? (
          <>
            <InlineLoader />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            <span>Export Print-Ready PDF</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PrintDownloadActions;

