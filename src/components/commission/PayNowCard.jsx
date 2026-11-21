// PayNowCard.jsx — School Admin dashboard: Super Admin ko kaise pay karein (QR, UPI ID copy, payee, bank, pending).
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Copy, ExternalLink, QrCode, Smartphone, X } from 'lucide-react';
import { fetchPaymentSettingsRequested } from '../../features/commission/commissionSlice.js';
import { selectPaymentSettings } from '../../features/commission/commissionSelectors.js';
import { formatInr } from '../../utils/money.js';

/**
 * @param {{ pendingAmount?: number|null }} props - rupees (dashboard overview.pendingPayment.amount)
 */
export const PayNowCard = ({ pendingAmount = null }) => {
  const dispatch = useDispatch();
  const settings = useSelector(selectPaymentSettings);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    dispatch(fetchPaymentSettingsRequested());
  }, [dispatch]);

  useEffect(() => {
    if (!zoom) return undefined;
    const onKey = (e) => e.key === 'Escape' && setZoom(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  if (!settings?.isConfigured) return null;

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(settings.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  // Phone par seedha UPI app (amount bhara hua)
  const upiLink = settings.upiId
    ? `upi://pay?pa=${encodeURIComponent(settings.upiId)}${settings.payeeName ? `&pn=${encodeURIComponent(settings.payeeName)}` : ''}${pendingAmount > 0 ? `&am=${Number(pendingAmount).toFixed(2)}` : ''}&cu=INR`
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-linear-to-br from-emerald-50 via-white to-teal-50 shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
        {settings.qrUrl ? (
          <button
            type="button"
            onClick={() => setZoom(true)}
            className="mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-emerald-200 bg-white p-1.5 shadow-sm hover:shadow-md sm:mx-0"
            aria-label="Enlarge payment QR"
          >
            <img src={settings.qrUrl} alt="Payment QR" className="h-full w-full object-contain" />
          </button>
        ) : (
          <span className="mx-auto flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-white sm:mx-0">
            <QrCode className="h-10 w-10 text-emerald-200" />
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-extrabold text-slate-800">Pay now</h3>
            {pendingAmount > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">Pending {formatInr(pendingAmount)}</span>
            )}
          </div>
          {settings.payeeName && <p className="text-sm text-slate-700">Pay to <strong>{settings.payeeName}</strong></p>}
          {settings.upiId && (
            <div className="flex items-center gap-2">
              <code className="min-w-0 truncate rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 ring-1 ring-emerald-200">{settings.upiId}</code>
              <button type="button" onClick={copyUpi} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
          {upiLink && (
            <a href={upiLink} className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/25 sm:hidden">
              <Smartphone className="h-3.5 w-3.5" /> Open UPI app
            </a>
          )}
          {settings.bankDetails && <p className="whitespace-pre-line rounded-xl bg-white/70 px-3 py-2 text-xs text-slate-600 ring-1 ring-emerald-100">{settings.bankDetails}</p>}
          <p className="text-xs font-medium text-slate-500">After paying, share the UTR / reference number with the Super Admin.</p>
        </div>
      </div>

      {zoom && settings.qrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Payment QR" onClick={() => setZoom(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Scan to pay</span>
              <button type="button" onClick={() => setZoom(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <img src={settings.qrUrl} alt="Payment QR" className="w-full rounded-xl" />
            <a href={settings.qrUrl} target="_blank" rel="noopener noreferrer" download className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <ExternalLink className="h-3.5 w-3.5" /> Open / download QR
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayNowCard;
