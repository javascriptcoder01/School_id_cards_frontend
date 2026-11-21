// LhRateEditorModal.jsx — letterhead print rate set / change: colour ₹, B/W ₹, unit, double-sided extra, min order,
// GST %, quantity tiers (no gaps / overlaps), valid from / till, note. Live example server se (/rates/calculate).
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, Loader2, Calculator } from 'lucide-react';
import { Modal, Field, RupeeInput, inputCls, PrimaryButton, GhostButton } from './LhBits.jsx';
import {
  saveLhRateRequested,
  clearLhRateSaveError,
  calculateLhDraftRequested,
  clearLhDraft,
  selectLhCommission,
} from '../../features/letterheadCommission/letterheadCommissionSlice.js';
import { LH_UNITS, LH_UNIT_SHORT, rupeesToPaise, paiseToRupeesInput, formatPaise } from '../../constants/letterheadCommission.js';

const toForm = (rate) => ({
  unit: rate?.unit || 'PER_PAGE',
  colour: paiseToRupeesInput(rate?.colourRatePaise),
  bw: paiseToRupeesInput(rate?.bwRatePaise),
  doubleExtra: paiseToRupeesInput(rate?.doubleSidedExtraPaise),
  minOrder: paiseToRupeesInput(rate?.minOrderPaise),
  gst: rate?.gstPercent === null || rate?.gstPercent === undefined ? '' : String(rate.gstPercent),
  slabs: (rate?.slabs || []).map((s) => ({ from: String(s.fromQty), to: s.toQty === null ? '' : String(s.toQty), colour: paiseToRupeesInput(s.colourRatePaise), bw: paiseToRupeesInput(s.bwRatePaise) })),
  validFrom: '',
  validTill: '',
  note: '',
});

const int = (v) => (v === '' ? null : /^\d+$/.test(String(v).trim()) ? Number(v) : NaN);

// Form → API body (paise) + errors
const build = (f) => {
  const errors = {};
  const colour = rupeesToPaise(f.colour);
  if (!colour || Number.isNaN(colour)) errors.colour = 'Enter a rate like 12 or 12.50';
  const bw = rupeesToPaise(f.bw);
  if (Number.isNaN(bw) || bw === 0) errors.bw = 'Enter a valid amount or leave empty';
  const doubleExtra = rupeesToPaise(f.doubleExtra);
  if (Number.isNaN(doubleExtra)) errors.doubleExtra = 'Enter a valid amount';
  const minOrder = rupeesToPaise(f.minOrder);
  if (Number.isNaN(minOrder)) errors.minOrder = 'Enter a valid amount';
  const gst = f.gst === '' ? null : Number(f.gst);
  if (gst !== null && (!Number.isFinite(gst) || gst < 0 || gst > 28)) errors.gst = 'GST must be 0–28%';

  const slabs = f.slabs.map((s) => ({ fromQty: int(s.from), toQty: int(s.to), colourRatePaise: rupeesToPaise(s.colour), bwRatePaise: rupeesToPaise(s.bw) }));
  slabs.forEach((s, i) => {
    if (!s.fromQty || Number.isNaN(s.fromQty)) errors.slabs = `Tier ${i + 1}: enter "from"`;
    else if (Number.isNaN(s.toQty) || (s.toQty !== null && s.toQty < s.fromQty)) errors.slabs = `Tier ${i + 1}: "to" must be at or above "from"`;
    else if (!s.colourRatePaise || Number.isNaN(s.colourRatePaise)) errors.slabs = `Tier ${i + 1}: enter the colour rate`;
    else if (Number.isNaN(s.bwRatePaise)) errors.slabs = `Tier ${i + 1}: B/W rate is not valid`;
    else if (s.toQty === null && i !== slabs.length - 1) errors.slabs = 'Only the last tier can be open-ended';
    else if (i > 0 && s.fromQty !== (slabs[i - 1].toQty ?? NaN) + 1) errors.slabs = `Tier ${i + 1} must start right after tier ${i}`;
  });
  if (f.validFrom && f.validTill && f.validTill <= f.validFrom) errors.validTill = 'Must be after "valid from"';

  const rate = {
    unit: f.unit,
    colourRatePaise: colour,
    bwRatePaise: bw,
    doubleSidedExtraPaise: doubleExtra,
    minOrderPaise: minOrder,
    gstPercent: gst,
    slabs,
  };
  return { errors, rate };
};

/**
 * @param {object} props
 * @param {{ scope: string, segment?: string, collegeId?: string, title: string, subtitle?: string }} props.target
 * @param {object|null} props.current - abhi ka rate (prefill)
 * @param {() => void} props.onClose
 */
export const LhRateEditorModal = ({ target, current, onClose }) => {
  const dispatch = useDispatch();
  const { saving, saveError, draft } = useSelector(selectLhCommission);
  const [form, setForm] = useState(() => toForm(current));
  const [example, setExample] = useState({ pages: '2', copies: '100', colour: 'COLOUR', doubleSided: false });
  const [touched, setTouched] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const { errors, rate } = useMemo(() => build(form), [form]);
  const valid = !Object.keys(errors).length;

  useEffect(() => {
    dispatch(clearLhRateSaveError());
    return () => {
      dispatch(clearLhDraft());
    };
  }, [dispatch]);

  // Live example (server calculate, 400 ms debounce saga mein)
  const pages = Number(example.pages), copies = Number(example.copies);
  const exampleOk = Number.isInteger(pages) && pages >= 1 && pages <= 500 && Number.isInteger(copies) && copies >= 1 && copies <= 10000;
  const rateJson = JSON.stringify(rate);
  useEffect(() => {
    if (!valid || !exampleOk) return;
    dispatch(calculateLhDraftRequested({ body: { rate: JSON.parse(rateJson), pages, copies, colour: example.colour, doubleSided: example.doubleSided } }));
  }, [dispatch, valid, exampleOk, rateJson, pages, copies, example.colour, example.doubleSided]);

  const save = () => {
    setTouched(true);
    if (!valid) return;
    const body = {
      scope: target.scope,
      ...(target.segment ? { segment: target.segment } : {}),
      ...(target.collegeId ? { collegeId: target.collegeId } : {}),
      ...Object.fromEntries(Object.entries(rate).filter(([k, v]) => v !== null || k === 'slabs')),
      ...(form.validFrom ? { validFrom: new Date(`${form.validFrom}T00:00:00`).toISOString() } : {}),
      ...(form.validTill ? { validTill: new Date(`${form.validTill}T00:00:00`).toISOString() } : {}),
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
    };
    dispatch(saveLhRateRequested({ body, onSuccess: onClose }));
  };

  const err = (k) => (touched ? errors[k] : null);
  const unitShort = LH_UNIT_SHORT[form.unit];
  const setSlab = (i, patch) => set({ slabs: form.slabs.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const addSlab = () => {
    const last = form.slabs[form.slabs.length - 1];
    const from = last ? (last.to ? String(Number(last.to) + 1) : '') : '1';
    set({ slabs: [...form.slabs, { from, to: '', colour: '', bw: '' }] });
  };

  return (
    <Modal
      title={target.title}
      subtitle={target.subtitle}
      onClose={onClose}
      busy={saving}
      wide
      footer={
        <>
          <GhostButton onClick={onClose} disabled={saving}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save rate
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-3">
        {saveError && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{saveError}</p>}
        <Field label="Charged">
          <div className="flex flex-wrap gap-1.5">
            {LH_UNITS.map((u) => (
              <button
                key={u.value}
                type="button"
                onClick={() => set({ unit: u.value })}
                aria-pressed={form.unit === u.value}
                className={`rounded-full px-3 py-1 text-xs font-bold ${form.unit === u.value ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={`Colour rate (per ${unitShort})`} htmlFor="lh-colour" error={err('colour')}>
            <RupeeInput id="lh-colour" value={form.colour} onChange={(v) => set({ colour: v })} />
          </Field>
          <Field label={`B/W rate (per ${unitShort})`} htmlFor="lh-bw" hint="Empty = same as colour" error={err('bw')}>
            <RupeeInput id="lh-bw" value={form.bw} onChange={(v) => set({ bw: v })} placeholder="Same as colour" />
          </Field>
          <Field label="Double-sided extra (per sheet)" htmlFor="lh-dx" hint="Optional" error={err('doubleExtra')}>
            <RupeeInput id="lh-dx" value={form.doubleExtra} onChange={(v) => set({ doubleExtra: v })} placeholder="None" />
          </Field>
          <Field label="Minimum order" htmlFor="lh-min" hint="Optional — small orders are topped up" error={err('minOrder')}>
            <RupeeInput id="lh-min" value={form.minOrder} onChange={(v) => set({ minOrder: v })} placeholder="None" />
          </Field>
          <Field label="GST %" htmlFor="lh-gst" hint="Optional (0–28)" error={err('gst')}>
            <input id="lh-gst" inputMode="decimal" value={form.gst} onChange={(e) => set({ gst: e.target.value })} placeholder="None" className={inputCls} />
          </Field>
        </div>

        <Field label={`Quantity tiers (total ${unitShort}s in an order)`} hint="Optional. One tier applies to the whole order." error={touched || form.slabs.length ? errors.slabs : null}>
          <div className="space-y-2">
            {form.slabs.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-1.5">
                <input aria-label={`Tier ${i + 1} from`} inputMode="numeric" value={s.from} onChange={(e) => setSlab(i, { from: e.target.value })} placeholder="From" className={inputCls} />
                <input aria-label={`Tier ${i + 1} to`} inputMode="numeric" value={s.to} onChange={(e) => setSlab(i, { to: e.target.value })} placeholder="To (∞)" className={inputCls} />
                <RupeeInput id={`tier-${i}-c`} value={s.colour} onChange={(v) => setSlab(i, { colour: v })} placeholder="Colour" />
                <RupeeInput id={`tier-${i}-b`} value={s.bw} onChange={(v) => setSlab(i, { bw: v })} placeholder="B/W" />
                <button type="button" onClick={() => set({ slabs: form.slabs.filter((_, j) => j !== i) })} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove tier ${i + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {form.slabs.length < 10 && (
              <button type="button" onClick={addSlab} className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline">
                <Plus className="h-3.5 w-3.5" /> Add tier
              </button>
            )}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Valid from" htmlFor="lh-vf" hint="Empty = now. A future date ends the current rate now; the broader level applies until then.">
            <input id="lh-vf" type="date" value={form.validFrom} onChange={(e) => set({ validFrom: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Valid till" htmlFor="lh-vt" hint="Optional" error={err('validTill')}>
            <input id="lh-vt" type="date" value={form.validTill} onChange={(e) => set({ validTill: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <Field label="Note" htmlFor="lh-note" hint="Optional, for your records">
          <input id="lh-note" value={form.note} maxLength={300} onChange={(e) => set({ note: e.target.value })} className={inputCls} />
        </Field>

        {/* Live example */}
        <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-teal-800">
            <Calculator className="h-3.5 w-3.5" /> Example
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700">
            <input aria-label="Example pages" inputMode="numeric" value={example.pages} onChange={(e) => setExample({ ...example, pages: e.target.value })} className={`${inputCls} w-16 px-2 py-1`} />
            <span>pages ×</span>
            <input aria-label="Example copies" inputMode="numeric" value={example.copies} onChange={(e) => setExample({ ...example, copies: e.target.value })} className={`${inputCls} w-20 px-2 py-1`} />
            <span>copies</span>
            <select aria-label="Example colour" value={example.colour} onChange={(e) => setExample({ ...example, colour: e.target.value })} className={`${inputCls} w-auto px-2 py-1`}>
              <option value="COLOUR">Colour</option>
              <option value="BW">B/W</option>
            </select>
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={example.doubleSided} onChange={(e) => setExample({ ...example, doubleSided: e.target.checked })} /> Double-sided
            </label>
            <span className="ml-auto text-sm font-extrabold text-teal-800">
              {draft.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : valid && exampleOk && draft.amount ? `→ ${formatPaise(draft.amount.totalPaise)}` : '—'}
            </span>
          </div>
          {valid && draft.amount && (
            <ul className="mt-2 space-y-0.5 text-[11px] text-slate-600">
              {draft.amount.breakdown.map((b) => (
                <li key={b.key} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate">{b.label}</span>
                  <span className="shrink-0 font-semibold">{b.formatted}</span>
                </li>
              ))}
            </ul>
          )}
          {draft.error && <p className="mt-1 text-[11px] font-semibold text-rose-600">{draft.error}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default LhRateEditorModal;
