import React, { useState } from 'react';
import { Printer, X, Shield, Check, AlertTriangle } from 'lucide-react';

/**
 * PrintDispatchModal Component
 * Super Admin modal for dispatching controlled printing workflow.
 * Supported modes:
 * - SYSTEM_DIALOG
 * - EXTERNAL_PRINTER
 * - DIRECT_DISPATCH
 *
 * Safe: Dispatches authenticated backend action only. No arbitrary shell commands.
 */
export const PrintDispatchModal = ({
  isOpen = false,
  requestId = '',
  collegeName = '',
  totalCards = 0,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [printMode, setPrintMode] = useState('SYSTEM_DIALOG');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const modes = [
    {
      id: 'SYSTEM_DIALOG',
      label: 'System Print Dialog',
      description: 'Dispatches batch to standard institutional print workstation queue.',
    },
    {
      id: 'EXTERNAL_PRINTER',
      label: 'External Commercial Printer',
      description: 'Marks batch for external high-throughput PVC card printing vendor.',
    },
    {
      id: 'DIRECT_DISPATCH',
      label: 'Direct Production Dispatch',
      description: 'Streams directly to connected dedicated production badge printer.',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    onConfirm({ printMode, notes });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Close print dispatch modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h2 id="print-modal-title" className="text-base font-bold text-slate-900">
              Dispatch Print Production
            </h2>
            <p className="text-xs text-slate-500">
              Trigger print workflow and transition request to PRINTING status
            </p>
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Request ID:</span>
            <span className="font-mono font-bold text-slate-800">{requestId}</span>
          </div>
          {collegeName && (
            <div className="flex justify-between">
              <span className="text-slate-500">Institution:</span>
              <span className="font-bold text-slate-800">{collegeName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Total Cards:</span>
            <span className="font-bold text-indigo-600">{totalCards} ID cards</span>
          </div>
        </div>

        {/* Print Mode Selector */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Print Mode
            </label>
            <div className="space-y-2.5">
              {modes.map((mode) => {
                const isSelected = printMode === mode.id;
                return (
                  <label
                    key={mode.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="printMode"
                      value={mode.id}
                      checked={isSelected}
                      onChange={() => setPrintMode(mode.id)}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">{mode.label}</p>
                      <p className="text-slate-500 mt-0.5">{mode.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Printer className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Dispatching Print...' : 'Start Printing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrintDispatchModal;
