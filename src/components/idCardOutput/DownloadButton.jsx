import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download, Loader2, Archive, FileImage } from 'lucide-react';
import {
  downloadStudentCardRequested,
  downloadGenerationZipRequested,
} from '../../features/idCardOutput/idCardOutputSlice.js';
import {
  selectIsDownloading,
  selectCurrentDownload,
} from '../../features/idCardOutput/idCardOutputSelectors.js';

export const DownloadButton = ({
  type = 'PNG', // 'PNG' | 'ZIP'
  generationId,
  studentId = null,
  studentName = '',
  disabled = false,
  className = '',
  children,
}) => {
  const dispatch = useDispatch();
  const isGlobalDownloading = useSelector(selectIsDownloading);
  const currentDownload = useSelector(selectCurrentDownload);

  const isCurrentTarget =
    type === 'ZIP'
      ? currentDownload?.type === 'ZIP' && currentDownload?.generationId === generationId
      : currentDownload?.type === 'PNG' &&
      currentDownload?.generationId === generationId &&
      currentDownload?.studentId === studentId;

  const isLoading = isGlobalDownloading && isCurrentTarget;

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled || isGlobalDownloading) return;

    if (type === 'ZIP') {
      dispatch(downloadGenerationZipRequested({ generationId }));
    } else {
      dispatch(downloadStudentCardRequested({ generationId, studentId, studentName }));
    }
  };

  const defaultStyles =
    type === 'ZIP'
      ? 'inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
      : 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-semibold text-xs rounded-lg transition-colors border border-slate-200 hover:border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isGlobalDownloading}
      className={className || defaultStyles}
      aria-label={
        type === 'ZIP'
          ? 'Download all ID cards as ZIP'
          : `Download ID card for ${studentName || studentId}`
      }
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Downloading...</span>
        </>
      ) : children ? (
        children
      ) : (
        <>
          {type === 'ZIP' ? (
            <Archive className="w-4 h-4 text-current" />
          ) : (
            <FileImage className="w-3.5 h-3.5 text-current" />
          )}
          <span>{type === 'ZIP' ? 'Download All (ZIP)' : 'Download PNG'}</span>
        </>
      )}
    </button>
  );
};

export default DownloadButton;

