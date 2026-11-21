// LhOrderModals.jsx — Letterhead orders: decline (reason), undo payment (reason), Mark as Paid (LetterheadPayment).
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Upload, X } from 'lucide-react';
import { Modal, Field, inputCls, PrimaryButton, GhostButton } from '../letterheadCommission/LhBits.jsx';
import {
  fetchLhPendingRequested,
  lhMarkPaidRequested,
  clearLhOrderErrors,
  selectLhOrders,
} from '../../features/letterheadOrders/letterheadOrdersSlice.js';
import { uploadPaymentProof } from '../../features/commission/commissionApi.js';
import { LH_PAYMENT_METHODS, LH_REFERENCE_REQUIRED, formatPaise } from '../../constants/letterheadCommission.js';

/** Reason modal (decline / undo) — min 5 chars */
export const ReasonModal = ({ title, subtitle, confirmLabel, busy, error, onConfirm, onClose, tone = 'rose' }) => {
  const [reason, setReason] = useState('');
  const short = reason.trim().length < 5;
  return (
    <Modal
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      busy={busy}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={busy}>Cancel</GhostButton>
          <button
            type="button"
            disabled={short || busy}
            onClick={() => onConfirm(reason.trim())}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white disabled:opacity-50 ${tone === 'rose' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} {confirmLabel}
          </button>
        </>
      }
    >
      {error && <p className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}
      <Field label="Reason" htmlFor="lh-reason" hint="At least 5 characters">
        <textarea id="lh-reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} autoFocus />
      </Field>
    </Modal>
  );
};

/**
 * Mark as Paid: ek organisation ke PENDING orders chuno → ek receipt
 * @param {{ collegeId: string, name: string, preselect?: string[] }} props.organisation
 */
export const LhMarkPaidModal = ({ organisation, onClose }) => {
  const dispatch = useDispatch();
  const { pending, markPaid } = useSelector(selectLhOrders);
  // null = user ne abhi kuch nahi chhua → default: preselect, warna saare pending
  const [picked, setPicked] = useState(() => (organisation.preselect?.length ? new Set(organisation.preselect) : null));
  const [method, setMethod] = useState('UPI_QR');
  const [referenceNo, setReferenceNo] = useState('');
  const [paidOn, setPaidOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [proof, setProof] = useState(null);
  const [proofBusy, setProofBusy] = useState(false);
  const [proofError, setProofError] = useState(null);

  useEffect(() => {
    dispatch(clearLhOrderErrors());
    dispatch(fetchLhPendingRequested({ collegeId: organisation.collegeId }));
  }, [dispatch, organisation.collegeId]);

  const items = pending.items;
  const selected = useMemo(() => {
    const ids = new Set(items.map((o) => o.id));
    return new Set([...(picked ?? ids)].filter((id) => ids.has(id)));
  }, [picked, items]);

  const total = useMemo(() => items.filter((o) => selected.has(o.id)).reduce((s, o) => s + (o.pricing?.totalPaise || 0), 0), [items, selected]);
  const refNeeded = LH_REFERENCE_REQUIRED.includes(method);
  const refError = refNeeded && referenceNo.trim().length < 3 ? 'UTR / transaction ID is required (min 3 characters)' : null;
  const canSave = selected.size > 0 && !refError && !proofBusy && !markPaid.saving;

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  };

  const onFile = async (file) => {
    if (!file) return;
    setProofError(null);
    if (file.size > 5 * 1024 * 1024) return setProofError('File is larger than 5 MB');
    setProofBusy(true);
    try {
      const res = await uploadPaymentProof(organisation.collegeId, file);
      const p = (res?.data ?? res)?.proof;
      setProof(p ? { url: p.url, publicId: p.publicId || null, name: file.name } : null);
    } catch (e) {
      setProofError(e?.message || 'Upload failed');
    } finally {
      setProofBusy(false);
    }
  };

  const save = () => {
    if (!canSave) return;
    dispatch(
      lhMarkPaidRequested({
        body: {
          collegeId: organisation.collegeId,
          orderIds: [...selected],
          method,
          ...(referenceNo.trim() ? { referenceNo: referenceNo.trim() } : {}),
          paidOn: new Date(`${paidOn}T12:00:00`).toISOString(),
          ...(proof ? { proof: { url: proof.url, publicId: proof.publicId } } : {}),
          ...(note.trim() ? { note: note.trim() } : {}),
        },
        onSuccess: onClose,
      })
    );
  };

  return (
    <Modal
      title="Mark as Paid — letterhead printing"
      subtitle={organisation.name}
      onClose={onClose}
      busy={markPaid.saving}
      wide
      footer={
        <>
          <GhostButton onClick={onClose} disabled={markPaid.saving}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={!canSave}>
            {markPaid.saving && <Loader2 className="h-4 w-4 animate-spin" />} Record {formatPaise(total)}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-3">
        {markPaid.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{markPaid.error}</p>}
        <div>
          <p className="mb-1.5 text-xs font-bold text-slate-700">Pending orders</p>
          {pending.loading ? (
            <p className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…</p>
          ) : !items.length ? (
            <p className="text-xs text-slate-500">No orders are pending payment for this organisation.</p>
          ) : (
            <ul className="max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-100">
              {items.map((o) => (
                <li key={o.id}>
                  <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm">
                    <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-mono text-xs font-bold">{o.orderNumber}</span> · {o.pages}p × {o.copies}
                    </span>
                    <span className="shrink-0 font-semibold">{o.pricing?.total?.formatted}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Method" htmlFor="lh-method">
            <select id="lh-method" value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
              {LH_PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>
          <Field label={`Reference no.${refNeeded ? ' *' : ''}`} htmlFor="lh-ref" error={referenceNo && refError ? refError : null} hint={refNeeded ? 'UTR / transaction ID' : 'Optional'}>
            <input id="lh-ref" value={referenceNo} maxLength={100} onChange={(e) => setReferenceNo(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Paid on" htmlFor="lh-paidon">
            <input id="lh-paidon" type="date" value={paidOn} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setPaidOn(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Proof" hint="Optional · image or PDF, up to 5 MB" error={proofError}>
            {proof ? (
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                <span className="min-w-0 flex-1 truncate">{proof.name}</span>
                <button type="button" onClick={() => setProof(null)} className="text-slate-500" aria-label="Remove proof"><X className="h-3.5 w-3.5" /></button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-teal-400">
                {proofBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {proofBusy ? 'Uploading…' : 'Upload proof'}
                <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
              </label>
            )}
          </Field>
        </div>
        <Field label="Note" htmlFor="lh-pnote" hint="Optional">
          <input id="lh-pnote" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} className={inputCls} />
        </Field>
      </div>
    </Modal>
  );
};

export default LhMarkPaidModal;
