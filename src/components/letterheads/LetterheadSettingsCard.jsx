// LetterheadSettingsCard.jsx — Super Admin: Class Teacher documents on/off, letter body rakhna, templates segment-wise band.
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Settings2, Loader2, Save } from 'lucide-react';
import { Section, Toggle } from './LetterheadFields.jsx';
import { fetchSettingsRequested, updateSettingsRequested, fetchTemplatesRequested } from '../../features/letterheads/letterheadSlice.js';
import { selectLetterheadSettings, selectLetterheadTemplates } from '../../features/letterheads/letterheadSelectors.js';
import { SEGMENT_LABEL } from '../../constants/letterhead.js';

const sortedDisabled = (map = {}) =>
  JSON.stringify(Object.fromEntries(Object.entries(map).filter(([, v]) => v?.length).map(([k, v]) => [k, [...v].sort()]).sort(([a], [b]) => a.localeCompare(b))));

export const LetterheadSettingsCard = () => {
  const dispatch = useDispatch();
  const { data, loading, saving, error } = useSelector(selectLetterheadSettings);
  const { items: templates } = useSelector(selectLetterheadTemplates);
  const [edits, setDraft] = useState(null); // null = server wali values

  useEffect(() => {
    dispatch(fetchSettingsRequested());
    dispatch(fetchTemplatesRequested({ segment: null }));
  }, [dispatch]);

  const draft = edits || (data ? { allowOperatorDocuments: data.allowOperatorDocuments, keepBody: data.keepBody, disabledTemplates: { ...(data.disabledTemplates || {}) } } : null);

  const dirty =
    Boolean(data && draft) &&
    (draft.allowOperatorDocuments !== data.allowOperatorDocuments ||
      draft.keepBody !== data.keepBody ||
      sortedDisabled(draft.disabledTemplates) !== sortedDisabled(data.disabledTemplates));

  if (!draft) {
    return (
      <Section title="Letterhead settings" icon={Settings2}>
        <p className="flex items-center gap-2 text-xs text-slate-500">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} {error || 'Loading…'}</p>
      </Section>
    );
  }

  const isOn = (segment, templateId) => !(draft.disabledTemplates[segment] || []).includes(templateId);
  const flip = (segment, templateId) => {
    const current = new Set(draft.disabledTemplates[segment] || []);
    if (current.has(templateId)) current.delete(templateId);
    else current.add(templateId);
    setDraft({ ...draft, disabledTemplates: { ...draft.disabledTemplates, [segment]: [...current] } });
  };

  const save = () => {
    const disabledTemplates = Object.fromEntries(Object.entries(draft.disabledTemplates).map(([k, v]) => [k, v || []]));
    dispatch(updateSettingsRequested({ body: { allowOperatorDocuments: draft.allowOperatorDocuments, keepBody: draft.keepBody, disabledTemplates } }));
    setDraft(null); // save ke baad server values dikhengi
  };

  return (
    <Section
      title="Letterhead settings"
      icon={Settings2}
      actions={
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-md disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
        </button>
      }
    >
      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Toggle label="Class Teachers can create documents" checked={draft.allowOperatorDocuments} onChange={(v) => setDraft({ ...draft, allowOperatorDocuments: v })} />
        <Toggle label="Keep letter text after generating" checked={draft.keepBody} onChange={(v) => setDraft({ ...draft, keepBody: v })} />
      </div>
      {templates.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-bold text-slate-700">Templates on / off by type</p>
          <div className="space-y-2">
            {templates.map((t) => (
              <div key={t.id} className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-xs font-extrabold text-slate-800">{t.name}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(t.segments || []).map((s) => {
                    const on = isOn(s, t.id);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => flip(s, t.id)}
                        aria-pressed={on}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${on ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500 line-through'}`}
                      >
                        {SEGMENT_LABEL[s] || s}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
};

export default LetterheadSettingsCard;
