import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, CheckCircle2, AlertTriangle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import {
  importOperatorStudentsRequested,
  loadOperatorDashboardRequested,
} from '../../features/operator/operatorSlice.js';
import {
  selectOperatorImporting,
  selectOperatorError,
  selectOperatorDashboard,
} from '../../features/operator/operatorSelectors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import InlineLoader from '../../components/common/InlineLoader.jsx';

export const OperatorStudentBulkImportPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isImporting = useSelector(selectOperatorImporting);
  const error = useSelector(selectOperatorError);
  const dashboard = useSelector(selectOperatorDashboard);
  const assignedScopes = dashboard?.assignments || [];

  const [csvContent, setCsvContent] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importSummary, setImportSummary] = useState(null);

  useEffect(() => {
    if (!dashboard) {
      dispatch(loadOperatorDashboardRequested());
    }
  }, [dispatch, dashboard]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setCsvContent(text);
        parseCsv(text);
      }
    };
    reader.readAsText(file);
  };

  const parseCsv = (rawText) => {
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setParseErrors(['CSV must contain a header row and at least one student data row.']);
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows = [];
    const errs = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const rowData = {};

      headers.forEach((h, idx) => {
        const val = values[idx] || '';
        if (h === 'studentid' || h === 'student_id' || h === 'id') rowData.studentId = val;
        else if (h === 'name' || h === 'fullname' || h === 'full_name') rowData.name = val;
        else if (h === 'class' || h === 'classname' || h === 'class_name' || h === 'grade') rowData.className = val;
        else if (h === 'section' || h === 'sec') rowData.section = val;
        else if (h === 'roll' || h === 'rollnumber' || h === 'roll_number' || h === 'rollno') rowData.rollNumber = val;
        else if (h === 'gender' || h === 'sex') rowData.gender = val.toUpperCase();
      });

      // Basic row check
      if (!rowData.studentId || !rowData.name || !rowData.className || !rowData.section) {
        errs.push(`Row ${i}: Missing mandatory fields (studentId, name, className, section).`);
      } else {
        rows.push(rowData);
      }
    }

    setParseErrors(errs);
    setParsedRows(rows);
  };

  const handleImportSubmit = () => {
    if (parsedRows.length === 0) return;
    dispatch(importOperatorStudentsRequested(parsedRows));
    setImportSummary({
      total: parsedRows.length,
      submitted: true,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Bulk Import Students"
        subtitle="Upload a CSV spreadsheet to import multiple students into your assigned classes."
        icon={FileSpreadsheet}
        action={
          <button
            type="button"
            onClick={() => navigate('/operator/students')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Roster</span>
          </button>
        }
      />

      {/* Scope Alert */}
      {assignedScopes.length > 0 && (
        <div className="p-4 bg-indigo-50/75 rounded-2xl border border-indigo-100/80 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900 leading-relaxed">
            <span className="font-bold">Authorized Scope:</span> You can only import students for{' '}
            {assignedScopes.map((s, idx) => (
              <span key={idx} className="font-semibold">
                Class {s.className} (Sec {s.section}){idx < assignedScopes.length - 1 ? ', ' : ''}
              </span>
            ))}. Rows matching unauthorized classes will be safely rejected by the server.
          </div>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select CSV File
          </label>
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 mb-1">Click to browse or drag CSV here</p>
            <p className="text-[11px] text-slate-400 mb-4">Required columns: studentId, name, className, section, rollNumber, gender</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors">
              <span>Choose File</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Manual Paste Alternative */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Or Paste CSV Text
          </label>
          <textarea
            rows={5}
            value={csvContent}
            placeholder="studentId,name,className,section,rollNumber,gender&#10;STU-10A-01,Aarav Sharma,10,A,01,MALE"
            onChange={(e) => {
              setCsvContent(e.target.value);
              parseCsv(e.target.value);
            }}
            className="w-full p-3.5 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
        </div>

        {/* Parse Errors */}
        {parseErrors.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Formatting Warnings ({parseErrors.length})</span>
            </div>
            <ul className="list-disc list-inside text-xs text-amber-700 space-y-0.5">
              {parseErrors.slice(0, 5).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
              {parseErrors.length > 5 && <li>...and {parseErrors.length - 5} more issues</li>}
            </ul>
          </div>
        )}

        {/* Parsed Rows Preview */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Preview Rows ({parsedRows.length} valid rows found)
              </h3>
            </div>
            <div className="overflow-x-auto max-h-60 rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Student ID</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Class</th>
                    <th className="p-2.5">Section</th>
                    <th className="p-2.5">Roll No.</th>
                    <th className="p-2.5">Gender</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 font-mono font-semibold text-slate-800">{row.studentId}</td>
                      <td className="p-2.5 font-medium text-slate-900">{row.name}</td>
                      <td className="p-2.5 text-slate-700">{row.className}</td>
                      <td className="p-2.5 text-slate-700">{row.section}</td>
                      <td className="p-2.5 text-slate-700">{row.rollNumber || '—'}</td>
                      <td className="p-2.5 text-slate-700">{row.gender || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setCsvContent('');
                  setParsedRows([]);
                  setParseErrors([]);
                }}
                disabled={isImporting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={isImporting || parsedRows.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <InlineLoader />
                    <span>Processing Import...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit Bulk Import ({parsedRows.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorStudentBulkImportPage;

