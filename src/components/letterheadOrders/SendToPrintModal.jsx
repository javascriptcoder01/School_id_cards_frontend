// SendToPrintModal.jsx — School Admin: generated document → letterhead print order. Copies, colour / B/W, double-sided
// (A4) → live price (server quote, apne organisation ka rate) → Submit (price lock). Rate set nahi → button band.
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Printer, AlertTriangle } from 'lucide-react';
import { Modal, Field, inputCls, PrimaryButton, GhostButton } from '../letterheadCommission/LhBits.jsx';
import { lhQuoteRequested, lhSubmitOrderRequested, clearLhSendToPrint, selectLhOrders } from '../../features/letterheadOrders/letterheadOrdersSlice.js';

/**
 * @param {{ documentId: string, refNo?: string, onClose: () => void, onSubmitted?: (order) => void }} props
 */
export const SendToPrintModal = ({ documentId, refNo, onClose, onSubmitted }) => {
  const dispatch = useDispatch();
  const { quote, submit } = useSelector(selectLhOrders);
  const [copies, setCopies] = useState('10');
  const [colour, setColour] = useState('COLOUR');
  const [doubleSided, setDoubleSided] = useState(false);
  const [note, setNote] = useState('');

  const n = Number(copies);
  const copiesOk = Number.isInteger(n) && n >= 1 && n <= 10000;

  useEffect(() => () => dispatch(clearLhSendToPrint()), [dispatch]);
  useEffect(() => {
    if (!copiesOk) return;
    dispatch(lhQuoteRequested({ body: { documentId, copies: n, colour, doubleSided } }));
  }, [dispatch, documentId, n, colour, doubleSided, copiesOk]);

  const r = quote.result;
  const blocked = !r || r.rateMissing || !r.printable;
  const canSubmit = copiesOk && !blocked && !quote.loading && !submit.saving;

  const send = () => {
    if (!canSubmit) return;
    dispatch(
      lhSubmitOrderRequested({
        body: { documentId, copies: n, colour, doubleSided, paper: 'A4', ...(note.trim() ? { note: note.trim() } : {}) },
        onSuccess: (order) => {
          onSubmitted?.(order);
          onClose();
        },
      })
    );
  };

  return (
    <Modal
      title="Send to print"
      subtitle={refNo ? `Ref. no. ${refNo}${r?.document?.pages ? ` · ${r.document.pages} page(s)` : ''}` : undefined}
      onClose={onClose}
      busy={submit.saving}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={submit.saving}>Cancel</GhostButton>
          <PrimaryButton onClick={send} disabled={!canSubmit} title={blocked && r?.message ? r.message : ''}>
            {submit.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />} Submit order
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-3">
        {submit.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{submit.error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Copies" htmlFor="stp-copies" error={copies && !copiesOk ? '1–10,000' : null}>
            <input id="stp-copies" inputMode="numeric" value={copies} onChange={(e) => setCopies(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Paper" hint="Only A4 for now">
            <input value="A4" disabled className={inputCls} aria-label="Paper" />
          </Field>
        </div>
        <Field label="Print">
          <div className="flex flex-wrap gap-1.5">
            {[
              ['COLOUR', 'Colour'],
              ['BW', 'Black & white'],
            ].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setColour(v)} aria-pressed={colour === v} className={`rounded-full px-3 py-1 text-xs font-bold ${colour === v ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {l}
              </button>
            ))}
            <label className="ml-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked={doubleSided} onChange={(e) => setDoubleSided(e.target.checked)} /> Double-sided
            </label>
          </div>
        </Field>
        <Field label="Note for the printer" htmlFor="stp-note" hint="Optional">
          <input id="stp-note" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} className={inputCls} />
        </Field>

        <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-3">
          {quote.loading && !r ? (
            <p className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Calculating price…</p>
          ) : quote.error ? (
            <p className="text-xs font-semibold text-rose-600">{quote.error}</p>
          ) : r?.rateMissing || (r && !r.printable) ? (
            <p className="flex items-start gap-1.5 text-xs font-semibold text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {r.message || 'Letterhead print rate is not set yet'}
            </p>
          ) : r?.amount ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-teal-800">Price {quote.loading && <Loader2 className="ml-1 inline h-3 w-3 animate-spin" />}</span>
                <span className="text-xl font-black text-teal-800">{r.amount.total.formatted}</span>
              </div>
              <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-600">
                {r.amount.breakdown.map((b) => (
                  <li key={b.key} className="flex justify-between gap-2">
                    <span className="min-w-0">{b.label}</span>
                    <span className="shrink-0 font-semibold">{b.formatted}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[10px] text-slate-500">The price is locked when you submit. Payment is due once the order is accepted.</p>
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default SendToPrintModal;
