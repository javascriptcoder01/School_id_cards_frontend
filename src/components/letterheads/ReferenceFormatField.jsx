// ReferenceFormatField.jsx — reference number format + token chips + live example.
import React from 'react';
import { Field, TextInput } from './LetterheadFields.jsx';
import { REFERENCE_TOKENS, exampleReference, referenceFormatError, DEFAULT_REFERENCE_FORMAT } from '../../constants/letterhead.js';

export const ReferenceFormatField = ({ value, onChange, code, segment }) => {
  const error = referenceFormatError(value);
  return (
    <Field label="Reference number format" htmlFor="lh-ref" error={error}>
      <TextInput id="lh-ref" value={value} onChange={onChange} placeholder={DEFAULT_REFERENCE_FORMAT} maxLength={60} />
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {REFERENCE_TOKENS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(`${value || ''}${t}`)}
            className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-indigo-700 hover:bg-indigo-100"
          >
            {t}
          </button>
        ))}
      </div>
      {!error && (
        <p className="mt-1.5 text-[11px] text-slate-500">
          Example: <span className="font-mono font-bold text-slate-800">{exampleReference(value, { code: code || 'CODE', segment })}</span>
        </p>
      )}
    </Field>
  );
};

export default ReferenceFormatField;
