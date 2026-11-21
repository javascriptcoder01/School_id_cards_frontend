// TemplateRatesModal.jsx — ek school ke ID card templates: har template par optional rate (school rate se pehle lagta hai).
// Set = SetRateModal (wahi validation), Clear = template wapas school rate par.
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Loader2, Layers } from 'lucide-react';
import {
  fetchTemplateRatesRequested,
  setTemplateRateRequested,
  removeTemplateRateRequested,
  templateRateSaveFinished,
  clearTemplateRates,
  selectTemplateRates,
} from '../../features/commissionTemplateRates/commissionTemplateRatesSlice.js';
import SetRateModal from './SetRateModal.jsx';
import { formatInrShort } from '../../utils/money.js';

/**
 * @param {object} props
 * @param {{ collegeId: string, name: string }|null} props.college - null = band
 * @param {() => void} props.onClose
 */
export const TemplateRatesModal = ({ college, onClose }) => {
  const dispatch = useDispatch();
  const { schoolRate, templates, loading, error, savingTemplateId, saveError } = useSelector(selectTemplateRates);
  const [editing, setEditing] = useState(null); // template row

  useEffect(() => {
    if (!college) return undefined;
    dispatch(fetchTemplateRatesRequested({ collegeId: college.collegeId }));
    return () => {
      dispatch(clearTemplateRates());
    };
  }, [dispatch, college]);

  if (!college) return null;
  const schoolLabel = schoolRate ? `${formatInrShort(schoolRate.rate)} / card` : 'No rate set';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Template rates — ${college.name}`}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Layers className="h-4 w-4 text-indigo-600" /> Template rates
            </h2>
            <p className="truncate text-xs text-slate-500">
              {college.name} · school rate {schoolLabel}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3">
          <p className="mb-3 text-xs text-slate-500">
            Optional. A template rate is used instead of the school rate when a request uses that template. Requests already approved keep their locked amount.
          </p>
          {error && <p className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}
          {saveError && !editing && <p className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{saveError}</p>}
          {loading && !templates.length ? (
            <p className="flex items-center gap-2 py-6 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading templates…
            </p>
          ) : !templates.length ? (
            <p className="py-6 text-center text-sm text-slate-500">This school has no ID card templates yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {templates.map((t) => {
                const busy = savingTemplateId === t.templateId;
                return (
                  <li key={t.templateId} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {t.name}
                        {!t.isActive && <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">Inactive</span>}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t.rate ? (
                          <span className="font-semibold text-indigo-700">{formatInrShort(t.rate.rate)} / card · template rate</span>
                        ) : (
                          <>Uses school rate ({schoolLabel})</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          dispatch(templateRateSaveFinished());
                          setEditing(t);
                        }}
                        className="text-xs font-semibold text-indigo-700 hover:underline disabled:opacity-50"
                      >
                        {t.rate ? 'Change' : 'Set rate'}
                      </button>
                      {t.rate && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => dispatch(removeTemplateRateRequested({ collegeId: college.collegeId, templateId: t.templateId }))}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline disabled:opacity-50"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <SetRateModal
        open={Boolean(editing)}
        title={editing ? `Template rate — ${editing.name}` : ''}
        description={`Used for ${college.name} requests with this template, instead of the school rate.`}
        currentRate={editing?.rate?.rate ?? schoolRate?.rate ?? null}
        lastRate={null}
        loading={Boolean(editing && savingTemplateId === editing.templateId)}
        error={saveError}
        onConfirm={({ rate, note }) =>
          dispatch(setTemplateRateRequested({ collegeId: college.collegeId, templateId: editing.templateId, rate, note, onSuccess: () => setEditing(null) }))
        }
        onCancel={() => setEditing(null)}
      />
    </div>
  );
};

export default TemplateRatesModal;
