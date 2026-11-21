// PaymentSettingsCard.jsx — Super Admin: schools kahan pay karein (QR image, UPI ID, payee name, bank details).
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, QrCode, Save, Trash2, Upload } from 'lucide-react';
import {
  fetchPaymentSettingsRequested,
  updatePaymentSettingsRequested,
  uploadPaymentQrRequested,
} from '../../features/commission/commissionSlice.js';
import {
  selectPaymentSettings,
  selectPaymentSettingsError,
  selectPaymentSettingsLoading,
  selectPaymentSettingsSaving,
} from '../../features/commission/commissionSelectors.js';
import { PAYMENT_PROOF_MAX_BYTES, PAYMENT_QR_ACCEPT } from '../../constants/commission.js';
import { formatDateTime } from '../../utils/idCardFormat.js';

const inputClass =
  'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white';
const labelClass = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5';
const UPI_PATTERN = /^[\w.-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;

export const PaymentSettingsCard = () => {
  const dispatch = useDispatch();
  const settings = useSelector(selectPaymentSettings);
  const loading = useSelector(selectPaymentSettingsLoading);
  const saving = useSelector(selectPaymentSettingsSaving);
  const error = useSelector(selectPaymentSettingsError);
  const fileRef = useRef(null);
  const [form, setForm] = useState({ upiId: '', payeeName: '', bankDetails: '' });
  const [seen, setSeen] = useState(null);
  const [fileError, setFileError] = useState(null);

  useEffect(() => {
    dispatch(fetchPaymentSettingsRequested());
  }, [dispatch]);

  // Server data aaye to form bharo (edit ke beech nahi)
  if (settings && settings !== seen) {
    setSeen(settings);
    setForm({ upiId: settings.upiId || '', payeeName: settings.payeeName || '', bankDetails: settings.bankDetails || '' });
  }

  const upiInvalid = form.upiId.trim() !== '' && !UPI_PATTERN.test(form.upiId.trim());

  const pickQr = (file) => {
    setFileError(null);
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return setFileError('Choose a PNG, JPEG or WEBP image.');
    if (file.size > PAYMENT_PROOF_MAX_BYTES) return setFileError('Image size cannot exceed 5 MB.');
    dispatch(uploadPaymentQrRequested({ file, onSuccess: () => fileRef.current && (fileRef.current.value = '') }));
    return null;
  };

  const save = (e) => {
    e.preventDefault();
    if (upiInvalid || saving) return;
    dispatch(updatePaymentSettingsRequested({ body: { upiId: form.upiId.trim(), payeeName: form.payeeName.trim(), bankDetails: form.bankDetails.trim() } }));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100/80 bg-white shadow-sm">
      <div className="h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[200px_1fr]">
        <div className="space-y-2">
          <span className={labelClass}>Payment QR</span>
          <div className="flex aspect-square w-full max-w-[200px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {loading && !settings ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : settings?.qrUrl ? (
              <img src={settings.qrUrl} alt="Payment QR" className="h-full w-full object-contain" />
            ) : (
              <QrCode className="h-10 w-10 text-slate-300" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm ${saving ? 'pointer-events-none opacity-60' : ''}`}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {settings?.qrUrl ? 'Replace QR' : 'Upload QR'}
              <input ref={fileRef} type="file" accept={PAYMENT_QR_ACCEPT} className="sr-only" onChange={(e) => pickQr(e.target.files?.[0] || null)} />
            </label>
            {settings?.qrUrl && (
              <button
                type="button"
                disabled={saving}
                onClick={() => dispatch(updatePaymentSettingsRequested({ body: { qr: null } }))}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
          {fileError && <p className="text-xs text-rose-600" role="alert">{fileError}</p>}
        </div>

        <form onSubmit={save} noValidate className="space-y-3">
          <p className="text-sm text-slate-600">Schools see these details in a <strong>Pay now</strong> box on their dashboard.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="pay-upi" className={labelClass}>UPI ID</label>
              <input id="pay-upi" className={inputClass} value={form.upiId} maxLength={100} placeholder="name@bank" onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))} aria-invalid={upiInvalid} />
              {upiInvalid && <p className="mt-1 text-xs text-rose-600">UPI ID must look like name@bank.</p>}
            </div>
            <div>
              <label htmlFor="pay-payee" className={labelClass}>Payee name</label>
              <input id="pay-payee" className={inputClass} value={form.payeeName} maxLength={100} onChange={(e) => setForm((f) => ({ ...f, payeeName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label htmlFor="pay-bank" className={labelClass}>
              Bank details <span className="text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <textarea id="pay-bank" rows={3} className={`${inputClass} resize-none`} value={form.bankDetails} maxLength={500} placeholder="Account name, number, IFSC, branch" onChange={(e) => setForm((f) => ({ ...f, bankDetails: e.target.value }))} />
          </div>
          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">{settings?.updatedAt ? `Last updated ${formatDateTime(settings.updatedAt)}` : 'Not set yet'}</span>
            <button
              type="submit"
              disabled={saving || upiInvalid}
              className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentSettingsCard;
