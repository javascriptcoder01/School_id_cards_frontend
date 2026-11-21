// SignatoryFields.jsx — signatory naam / designation + signature / stamp kahan se.
// Upload source abhi UI mein nahi (alag image upload endpoint nahi) — school profile ya none.
import React from 'react';
import { PenLine } from 'lucide-react';
import { Section, Field, TextInput, ChoiceChips } from './LetterheadFields.jsx';

const SIGNATURE_OPTIONS = [
  { value: 'SCHOOL_PRINCIPAL_SIGN', label: 'Principal signature' },
  { value: 'NONE', label: 'None' },
];
const STAMP_OPTIONS = [
  { value: 'SCHOOL_STAMP', label: 'School stamp' },
  { value: 'NONE', label: 'None' },
];

export const SignatoryFields = ({ value = {}, onChange }) => {
  const set = (patch) => onChange({ ...value, ...patch });
  const signatureSource = value.signature?.source || 'SCHOOL_PRINCIPAL_SIGN';
  const stampSource = value.stamp?.source || 'NONE';
  const keepUpload = (ref, source) => (source === 'UPLOAD' ? ref : { source });
  return (
    <Section title="Signatory" icon={PenLine}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name" htmlFor="lh-sig-name">
          <TextInput id="lh-sig-name" value={value.name} onChange={(v) => set({ name: v })} placeholder="e.g. Dr. A. Sharma" maxLength={120} />
        </Field>
        <Field label="Designation" htmlFor="lh-sig-des">
          <TextInput id="lh-sig-des" value={value.designation} onChange={(v) => set({ designation: v })} placeholder="e.g. Principal" maxLength={120} />
        </Field>
      </div>
      <Field label="Signature" hint="Taken from the school profile.">
        <ChoiceChips
          value={signatureSource === 'UPLOAD' ? null : signatureSource}
          onChange={(source) => set({ signature: keepUpload(value.signature, source) })}
          options={SIGNATURE_OPTIONS}
        />
      </Field>
      <Field label="Stamp" hint="Taken from the school profile.">
        <ChoiceChips value={stampSource === 'UPLOAD' ? null : stampSource} onChange={(source) => set({ stamp: keepUpload(value.stamp, source) })} options={STAMP_OPTIONS} />
      </Field>
    </Section>
  );
};

export default SignatoryFields;
