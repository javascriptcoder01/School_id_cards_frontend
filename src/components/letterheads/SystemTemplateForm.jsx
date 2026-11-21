// SystemTemplateForm.jsx — system template ke rang, fonts, header, org details, footer, watermark.
// Org fields khaali = school profile se (placeholder mein wahi dikhta hai).
import React, { useState } from 'react';
import { Palette, Type, LayoutTemplate, Building2, PanelBottom, Droplets, Wand2, Loader2 } from 'lucide-react';
import { Section, Field, TextInput, NumberInput, Select, Toggle, ColorInput, ChoiceChips } from './LetterheadFields.jsx';
import { FONT_FAMILIES, HEADER_LAYOUTS, CONTINUATION_STYLES, WATERMARK_TYPES } from '../../constants/letterhead.js';
import { extractLogoColors } from '../../utils/logoColors.js';

const LOGO_OPTIONS = [
  { value: 'SCHOOL_LOGO', label: 'School logo' },
  { value: 'NONE', label: 'No logo' },
];

const formatCollegeAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  return [address.line1 || address.street, address.line2, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(', ');
};
const collegeLogoUrl = (college) => college?.collegeLogo?.url || college?.logo?.url || null;

const ORG_FIELDS = [
  { key: 'orgName', label: 'Organisation name', max: 200, from: (c) => c?.name },
  { key: 'tagline', label: 'Tagline / motto', max: 200 },
  { key: 'affiliation', label: 'Affiliation', max: 200, hint: 'e.g. Affiliated to CBSE, No. 1234' },
  { key: 'registrationNo', label: 'Registration no.', max: 100 },
  { key: 'gstin', label: 'GSTIN', max: 20 },
  { key: 'address', label: 'Address', max: 400, from: (c) => formatCollegeAddress(c?.address), wide: true },
  { key: 'phone', label: 'Phone', max: 60, from: (c) => c?.phone },
  { key: 'email', label: 'Email', max: 254, from: (c) => c?.email },
  { key: 'website', label: 'Website', max: 200, from: (c) => c?.website },
];

export const SystemTemplateForm = ({ value, onChange, college }) => {
  const [matching, setMatching] = useState(false);
  const [matchNote, setMatchNote] = useState(null);
  const set = (patch) => onChange({ ...value, ...patch });
  const setIn = (key, patch) => onChange({ ...value, [key]: { ...(value[key] || {}), ...patch } });
  const logoUrl = collegeLogoUrl(college);

  // Logo se rang nikal kar primary / secondary / accent
  const matchLogo = async () => {
    if (!logoUrl) return;
    setMatching(true);
    setMatchNote(null);
    try {
      const colors = await extractLogoColors(logoUrl);
      if (!colors?.length) setMatchNote('No clear colours found in the logo.');
      else set({ primaryColor: colors[0], secondaryColor: colors[1] || value.secondaryColor, accentColor: colors[2] || colors[1] || value.accentColor });
    } catch {
      setMatchNote('Could not read the logo colours.');
    } finally {
      setMatching(false);
    }
  };

  const header = value.header || {};
  const footer = value.footer || {};
  const watermark = value.watermark || { type: 'NONE' };
  const org = value.orgProfile || {};

  return (
    <div className="space-y-3">
      <Section
        title="Colours"
        icon={Palette}
        actions={
          logoUrl ? (
            <button type="button" onClick={matchLogo} disabled={matching} className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-700 hover:bg-violet-100 disabled:opacity-60">
              {matching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />} Match logo
            </button>
          ) : null
        }
      >
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <ColorInput id="lh-c1" label="Primary" value={value.primaryColor} onChange={(v) => set({ primaryColor: v })} />
          <ColorInput id="lh-c2" label="Secondary" value={value.secondaryColor} onChange={(v) => set({ secondaryColor: v })} />
          <ColorInput id="lh-c3" label="Accent" value={value.accentColor} onChange={(v) => set({ accentColor: v })} />
          <ColorInput id="lh-c4" label="Text" value={value.textColor} onChange={(v) => set({ textColor: v })} />
        </div>
        {matchNote && <p className="text-[11px] text-amber-600">{matchNote}</p>}
      </Section>

      <Section title="Fonts & logo" icon={Type}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Body font" htmlFor="lh-font">
            <Select id="lh-font" value={value.fontFamily} onChange={(v) => set({ fontFamily: v })} options={FONT_FAMILIES} />
          </Field>
          <Field label="Heading font" htmlFor="lh-hfont">
            <Select id="lh-hfont" value={value.headingFontFamily} onChange={(v) => set({ headingFontFamily: v })} options={FONT_FAMILIES} />
          </Field>
        </div>
        <Field label="Logo" hint={value.logo?.source === 'SCHOOL_LOGO' && !logoUrl ? 'This school has no logo yet — add it in the school profile.' : null}>
          <ChoiceChips value={value.logo?.source === 'UPLOAD' ? null : value.logo?.source || 'SCHOOL_LOGO'} onChange={(source) => set({ logo: { source } })} options={LOGO_OPTIONS} />
        </Field>
      </Section>

      <Section title="Header" icon={LayoutTemplate}>
        <Field label="Layout">
          <ChoiceChips value={header.layout} onChange={(v) => setIn('header', { layout: v })} options={HEADER_LAYOUTS} />
        </Field>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Toggle label="Show tagline" checked={header.showTagline !== false} onChange={(v) => setIn('header', { showTagline: v })} />
          <Toggle label="Show affiliation" checked={header.showAffiliation !== false} onChange={(v) => setIn('header', { showAffiliation: v })} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Header height" htmlFor="lh-hh" hint="15–90 mm">
            <NumberInput id="lh-hh" value={header.heightMm} onChange={(v) => setIn('header', { heightMm: v })} min={15} max={90} suffix="mm" />
          </Field>
          <Field label="Page 2+ header">
            <ChoiceChips value={value.continuation?.headerStyle || 'COMPACT'} onChange={(v) => setIn('continuation', { headerStyle: v })} options={CONTINUATION_STYLES} />
          </Field>
        </div>
      </Section>

      <Section title="Organisation details" icon={Building2}>
        <p className="-mt-1 text-[11px] text-slate-500">Leave a field empty to use the school profile.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ORG_FIELDS.map((f) => (
            <div key={f.key} className={f.wide ? 'sm:col-span-2' : ''}>
              <Field label={f.label} htmlFor={`lh-org-${f.key}`} hint={f.hint}>
                <TextInput
                  id={`lh-org-${f.key}`}
                  value={org[f.key]}
                  onChange={(v) => setIn('orgProfile', { [f.key]: v })}
                  placeholder={(f.from && f.from(college)) || ''}
                  maxLength={f.max}
                />
              </Field>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Footer" icon={PanelBottom}>
        <Toggle label="Show footer" checked={footer.show !== false} onChange={(v) => setIn('footer', { show: v })} />
        {footer.show !== false && (
          <>
            <Field label="Footer text" htmlFor="lh-ft">
              <TextInput id="lh-ft" value={footer.text} onChange={(v) => setIn('footer', { text: v })} placeholder="Optional line, e.g. Recognised by Govt. of …" maxLength={300} />
            </Field>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Toggle label="Contacts in footer" checked={footer.showContacts !== false} onChange={(v) => setIn('footer', { showContacts: v })} />
              <Toggle label="Page numbers" checked={footer.showPageNumber !== false} onChange={(v) => setIn('footer', { showPageNumber: v })} />
            </div>
          </>
        )}
      </Section>

      <Section title="Watermark" icon={Droplets}>
        <ChoiceChips value={watermark.type || 'NONE'} onChange={(type) => setIn('watermark', { type })} options={WATERMARK_TYPES} />
        {watermark.type === 'TEXT' && (
          <Field label="Watermark text" htmlFor="lh-wm" error={!watermark.text ? 'Text is required' : null}>
            <TextInput id="lh-wm" value={watermark.text} onChange={(v) => setIn('watermark', { text: v })} placeholder="e.g. CONFIDENTIAL" maxLength={60} />
          </Field>
        )}
        {watermark.type !== 'NONE' && (
          <Field label={`Opacity · ${Math.round((watermark.opacity ?? 0.08) * 100)}%`} htmlFor="lh-wmo">
            <input
              id="lh-wmo"
              type="range"
              min={0.02}
              max={0.3}
              step={0.01}
              value={watermark.opacity ?? 0.08}
              onChange={(e) => setIn('watermark', { opacity: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
          </Field>
        )}
      </Section>
    </div>
  );
};

export default SystemTemplateForm;
