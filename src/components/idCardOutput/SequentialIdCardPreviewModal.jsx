import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileText,
  Archive,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import apiClient from '../../api/apiClient.js';

export const SequentialIdCardPreviewModal = ({
  isOpen = false,
  onClose,
  cards = [],
  initialIndex = 0,
  generationId = null,
  collegeId = null,
  collegeCode = 'COL',
  onDownloadZip,
  onDownloadPdf,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cardImageBlobUrl, setCardImageBlobUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, cards.length - 1)));
      setZoomLevel(1);
    }
  }, [isOpen, initialIndex, cards.length]);

  const currentCard = cards[currentIndex] || null;

  // Filtered student list for sidebar
  const filteredCards = cards.filter((card) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const student = card.student || {};
    const name = (card.studentName || student.name || '').toLowerCase();
    const id = (card.studentRegNo || card.studentId || student.studentId || '').toLowerCase();
    return name.includes(query) || id.includes(query);
  });

  // Load card PNG artifact cleanly
  const loadCardImage = useCallback(async () => {
    if (!currentCard) return;

    const studentId =
      currentCard.studentId?._id ||
      currentCard.studentId ||
      currentCard.id ||
      currentCard._id;
    const resultId = currentCard.resultId || currentCard._id;

    setImageLoading(true);
    setImageError(null);

    try {
      let downloadUrl = '';
      if (generationId) {
        downloadUrl = `/id-card/generations/${generationId}/results/${studentId}/download`;
      } else if (resultId) {
        downloadUrl = `/super-admin/id-cards/results/${resultId}/download/png`;
      }

      if (!downloadUrl) {
        throw new Error('No valid preview artifact endpoint available.');
      }

      const response = await apiClient.get(downloadUrl, {
        responseType: 'blob',
      });

      const blobUrl = URL.createObjectURL(response.data);
      setCardImageBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return blobUrl;
      });
    } catch (err) {
      setImageError(
        err?.response?.data?.message || 'Could not load rendered card preview artifact.'
      );
    } finally {
      setImageLoading(false);
    }
  }, [currentCard, generationId]);

  useEffect(() => {
    if (isOpen && currentCard) {
      loadCardImage();
    }
    return () => {
      if (cardImageBlobUrl) {
        URL.revokeObjectURL(cardImageBlobUrl);
      }
    };
  }, [isOpen, currentIndex, currentCard]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
      } else if (e.key === 'Home') {
        setCurrentIndex(0);
      } else if (e.key === 'End') {
        setCurrentIndex(cards.length - 1);
      } else if (e.key === 'Escape') {
        onClose?.();
      }
    },
    [isOpen, cards.length, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || cards.length === 0) return null;

  const currentStudentName =
    currentCard.studentName || currentCard.student?.name || `Student ${currentIndex + 1}`;
  const currentStudentId =
    currentCard.studentRegNo ||
    currentCard.student?.studentId ||
    currentCard.studentId ||
    '—';
  const currentClass =
    currentCard.className || currentCard.student?.className || '—';
  const currentSection =
    currentCard.section || currentCard.student?.section || '—';
  const currentRollNo =
    currentCard.rollNumber || currentCard.student?.rollNumber || '—';

  const handleDownloadCurrentCard = () => {
    if (!cardImageBlobUrl) return;
    const a = document.createElement('a');
    a.href = cardImageBlobUrl;
    const safeName = currentStudentName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeId = String(currentStudentId).replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `ID_Card_${safeId}_${safeName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sequential ID Card Viewer"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[850px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Student ID Card Sequential Viewer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  Card {currentIndex + 1} of {cards.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pre-rendered high resolution badges &bull; Read-only viewer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Download Batch Print Sheet PDF"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Download PDF</span>
              </button>
            )}

            {onDownloadZip && (
              <button
                type="button"
                onClick={onDownloadZip}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Download All Cards as ZIP"
              >
                <Archive className="w-3.5 h-3.5 text-indigo-600" />
                <span>Download ZIP</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              title="Close viewer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Sidebar: Student Roster Navigation */}
          <div className="hidden md:flex md:col-span-4 lg:col-span-3 border-r border-slate-200 flex-col bg-slate-50/50">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter student roster..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              {filteredCards.map((card, idx) => {
                const originalIndex = cards.indexOf(card);
                const isSelected = originalIndex === currentIndex;
                const name =
                  card.studentName || card.student?.name || `Student ${originalIndex + 1}`;
                const regNo =
                  card.studentRegNo || card.student?.studentId || card.studentId || '';

                return (
                  <button
                    key={card.resultId || card.studentId || originalIndex}
                    type="button"
                    onClick={() => setCurrentIndex(originalIndex)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                        : 'hover:bg-slate-100 text-slate-700 font-medium'
                      }`}
                  >
                    <div className="truncate">
                      <div className="text-xs truncate">{name}</div>
                      <div
                        className={`text-[10px] font-mono ${isSelected ? 'text-indigo-100' : 'text-slate-400'
                          }`}
                      >
                        {regNo || `#${originalIndex + 1}`}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 font-bold ${isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/60 text-slate-600'
                        }`}
                    >
                      {originalIndex + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Area: Card Preview Canvas & Controls */}
          <div className="col-span-1 md:col-span-8 lg:col-span-9 flex flex-col bg-slate-100/70 overflow-hidden">
            {/* Student Info Banner */}
            <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{currentStudentName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="font-mono">ID: {currentStudentId}</span>
                    <span>&bull;</span>
                    <span>Class {currentClass} ({currentSection})</span>
                    <span>&bull;</span>
                    <span>Roll #{currentRollNo}</span>
                  </div>
                </div>
              </div>

              {/* Zoom & Download Controls */}
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-2 text-slate-600 font-bold">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCurrentCard}
                  disabled={!cardImageBlobUrl || imageLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Card PNG</span>
                </button>
              </div>
            </div>

            {/* Central Card Display Viewport */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center">
              {imageLoading ? (
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">Loading rendered badge artifact...</span>
                </div>
              ) : imageError ? (
                <div className="max-w-md p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                  <h4 className="text-xs font-bold text-rose-900">Artifact Loading Error</h4>
                  <p className="text-xs text-rose-700">{imageError}</p>
                </div>
              ) : cardImageBlobUrl ? (
                <div
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="relative rounded-2xl shadow-2xl border border-slate-300/80 bg-white overflow-hidden max-w-full"
                >
                  <img
                    src={cardImageBlobUrl}
                    alt={`${currentStudentName} ID Card`}
                    className="max-h-[500px] w-auto object-contain select-none pointer-events-none"
                  />
                </div>
              ) : null}
            </div>

            {/* Bottom Navigation Pagination Bar */}
            <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentIndex(0)}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition-colors cursor-pointer"
                  title="First Card (Home)"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  title="Previous Card (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              </div>

              {/* Counter Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Student {currentIndex + 1} of {cards.length}
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  (Use &larr; &rarr; arrow keys to navigate)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1))}
                  disabled={currentIndex === cards.length - 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  title="Next Card (Right Arrow)"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex(cards.length - 1)}
                  disabled={currentIndex === cards.length - 1}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition-colors cursor-pointer"
                  title="Last Card (End)"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequentialIdCardPreviewModal;
