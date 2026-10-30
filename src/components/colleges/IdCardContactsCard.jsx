// IdCardContactsCard.jsx
// School profile: "ID Card Contact Details" — card ke back side par chhapne wale school numbers.
// Read-only view; canEdit ho to "Edit" → form (School Admin apna school, Super Admin koi bhi school).
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PhoneCall, Pencil, Save, X, Loader2 } from 'lucide-react';
import { updateIdCardContactsRequested, clearIdCardContactsError } from '../../features/colleges/collegeSlice.js';
import { selectIdCardContactsSaving, selectIdCardContactsError } from '../../features/colleges/collegeSelectors.js';
import ErrorMessage from '../common/ErrorMessage.jsx';

const DEFAULT_RETURN_NOTE = 'If found, please return to the school address above.';
const PHONE_PATTERN = /^[0-9+\-() ]*$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;

const FIELDS = [
  { key: 'emergencyNumber', label: 'Emergency No.', type: 'phone', placeholder: '112 or +91 98765 43210' },
  { key: 'tollFreeNumber', label: 'Toll-free No.', type: 'phone', placeholder: '1800 123 4567' },
  { key: 'receptionNumber', label: 'Reception / Office No.', type: 'phone', placeholder: '0120-4567890' },
  { key: 'principalNumber', label: 'Principal No.', type: 'phone', placeholder: '+91 98765 00000' },
  { key: 'website', label: 'Website', type: 'url', placeholder: 'https://www.school.edu.in' },
  { key: 'returnNote', label: 'Return note', type: 'text', placeholder: DEFAULT_RETURN_NOTE },
];

const inputClass =
  'w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white';
const labelClass = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5';

const validateField = (field, value) => {
  const text = (value || '').trim();
  if (!text) return null;
  if (field.type === 'phone' && (!PHONE_PATTERN.test(text) || text.length > 30)) {
    return 'Use digits, spaces, +, -, ( and ) only (max 30)';
  }
  if (field.type === 'url' && (!URL_PATTERN.test(text) || text.length > 200)) {
    return 'Start with http:// or https://';
  }
  if (text.length > 200) return 'Too long (max 200)';
  return null;
};

/**
 * @param {object} props
 * @param {object} props.college - College (idCardContacts ke saath)
 * @param {boolean} props.canEdit
 * @param {boolean} props.isMine - true = School Admin (PATCH /colleges/me/id-card-contacts)
 */
export const IdCardContactsCard = ({ college, canEdit = false, isMine = false }) => {
  const dispatch = useDispatch();
  const saving = useSelector(selectIdCardContactsSaving);
  const saveError = useSelector(selectIdCardContactsError);
  const contacts = college?.idCardContacts || {};

  const [draft, setDraft] = useState(null); // null = view mode
  const [errors, setErrors] = useState({});

  const startEdit = () => {
    dispatch(clearIdCardContactsError());
    setErrors({});
    // Return note khaali ho to default text se shuru
    setDraft({
      ...Object.fromEntries(FIELDS.map((f) => [f.key, contacts[f.key] || ''])),
      returnNote: contacts.returnNote || DEFAULT_RETURN_NOTE,
    });
  };

  const save = (event) => {
    event.preventDefault();
    const nextErrors = Object.fromEntries(
      FIELDS.map((f) => [f.key, validateField(f, draft[f.key])]).filter(([, message]) => message)
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    dispatch(
      updateIdCardContactsRequested({
        collegeId: college._id || college.id,
        isMine,
        contacts: Object.fromEntries(FIELDS.map((f) => [f.key, draft[f.key].trim() || null])),
        onSuccess: () => setDraft(null),
      })
    );
  };

  return (
    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 md:col-span-2" aria-labelledby="id-card-contacts-title">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 id="id-card-contacts-title" className="text-base font-bold text-slate-800 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-indigo-600" />
            ID Card Contact Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Printed on the back of every ID card and inside the school QR code.</p>
        </div>
        {canEdit && !draft && (
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
        )}
      </div>

      {!draft ? (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {FIELDS.map((f) => (
            <div key={f.key} className={`flex items-start justify-between gap-4 py-1.5 border-b border-slate-50 ${f.key === 'returnNote' ? 'sm:col-span-2' : ''}`}>
              <dt className="text-slate-500 shrink-0">{f.label}</dt>
              <dd className="font-medium text-slate-900 text-right wrap-break-word">
                {contacts[f.key] || (
                  <span className="text-slate-400 italic">{f.key === 'returnNote' ? `Default: “${DEFAULT_RETURN_NOTE}”` : 'Not provided'}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <form onSubmit={save} noValidate className="space-y-4">
          {saveError && <ErrorMessage message={saveError} title="Couldn't save contact details" />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.key} className={f.key === 'returnNote' ? 'sm:col-span-2' : ''}>
                <label htmlFor={`idcard-${f.key}`} className={labelClass}>{f.label}</label>
                <input
                  id={`idcard-${f.key}`}
                  type={f.type === 'phone' ? 'tel' : f.type === 'url' ? 'url' : 'text'}
                  inputMode={f.type === 'phone' ? 'tel' : undefined}
                  maxLength={f.type === 'phone' ? 30 : 200}
                  value={draft[f.key]}
                  disabled={saving}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  aria-invalid={Boolean(errors[f.key])}
                  aria-describedby={errors[f.key] ? `idcard-${f.key}-error` : undefined}
                  className={`${inputClass} ${errors[f.key] ? 'border-rose-400' : 'border-slate-200'}`}
                />
                {errors[f.key] ? (
                  <p id={`idcard-${f.key}-error`} className="text-xs text-rose-600 mt-1">{errors[f.key]}</p>
                ) : f.type === 'phone' ? (
                  <p className="text-[11px] text-slate-400 mt-1">Digits, spaces, + - ( ) allowed. Leave empty to hide on the card.</p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDraft(null)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save details'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default IdCardContactsCard;
