import React from 'react';
import { Download, School, Printer, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import PrintDownloadActions from './PrintDownloadActions.jsx';
import EmptyState from '../common/EmptyState.jsx';

export const CollegePrintDetails = ({
  collegeData = {},
  onDownloadZip,
  onDownloadPdf,
  onDownloadPng,
  isDownloading = false,
  downloadType = null,
  currentDownload = null,
}) => {
  const college = collegeData.college || {};
  const stats = collegeData.statistics || {};
  const cards = collegeData.cards || [];
  const generations = collegeData.generations || [];

  return (
    <div className="space-y-6">
      {/* College Info Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {college.logo ? (
              <img
                src={college.logo}
                alt={college.name}
                className="w-16 h-16 rounded-2xl object-contain border border-slate-200 bg-white p-1 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xl shrink-0">
                <School className="w-8 h-8" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{college.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {college.code || 'COL'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {college.contact?.email || college.address?.city || 'Institutional Print Queue'}
              </p>
            </div>
          </div>

          <PrintDownloadActions
            onDownloadZip={onDownloadZip}
            onDownloadPdf={onDownloadPdf}
            isDownloading={isDownloading}
            downloadType={downloadType}
            disabled={cards.length === 0 && (stats.generatedCards || 0) === 0}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Students</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{stats.totalStudents ?? 0}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Info Complete</span>
          <span className="text-xl font-extrabold text-emerald-600 mt-1 block">{stats.completedStudents ?? 0}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Generated Cards</span>
          <span className="text-xl font-extrabold text-purple-600 mt-1 block">{stats.generatedCards ?? 0}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ready to Print</span>
          <span className="text-xl font-extrabold text-indigo-600 mt-1 block">
            {stats.readyToPrint !== undefined ? stats.readyToPrint : (stats.generatedCards ?? 0)}
          </span>
        </div>
      </div>

      {/* Generated Cards Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Rendered ID Cards ({cards.length})
        </h3>

        {cards.length === 0 ? (
          <EmptyState
            title="No ID Cards Available for Download"
            description="No student ID cards have been generated and stored for this college yet."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Student ID</th>
                  <th className="px-5 py-3.5">Class & Section</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cards.map((card) => {
                  const student = card.student || {};
                  const resultId = card.resultId || card.id || card._id;
                  const isThisDownloading = isDownloading && downloadType === 'PNG' && currentDownload === resultId;

                  return (
                    <tr key={resultId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {student.name || 'Student'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-700">
                        {student.studentId || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        Class {student.className || '—'} - {student.section || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Ready
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onDownloadPng(resultId, student.name)}
                          disabled={isDownloading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isThisDownloading ? 'Saving...' : 'Download PNG'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegePrintDetails;

