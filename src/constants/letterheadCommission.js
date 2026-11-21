// letterheadCommission.js — letterhead PRINT rates + orders (ID card commission se alag). Server paise bhejta hai.
import { formatInr, formatInrShort } from '../utils/money.js';

export const LH_SECTORS = Object.freeze([
  { value: 'ACADEMIC', label: 'Schools' },
  { value: 'MEDICAL', label: 'Clinics' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'NGO', label: 'NGO' },
  { value: 'GENERAL', label: 'General' },
]);
export const LH_SECTOR_LABEL = Object.fromEntries(LH_SECTORS.map((s) => [s.value, s.label]));

export const LH_UNITS = Object.freeze([
  { value: 'PER_PAGE', label: 'Per page', short: 'page' },
  { value: 'PER_SHEET', label: 'Per sheet', short: 'sheet' },
  { value: 'PER_COPY', label: 'Per copy', short: 'copy' },
]);
export const LH_UNIT_SHORT = Object.fromEntries(LH_UNITS.map((u) => [u.value, u.short]));
export const LH_SCOPE_LABEL = { GLOBAL: 'Global', SEGMENT: 'Sector', ORGANISATION: 'Organisation' };

export const LH_ORDER_STATUS_VIEW = Object.freeze({
  SUBMITTED: { label: 'New', tone: 'amber' },
  ACCEPTED: { label: 'Accepted', tone: 'blue' },
  PRINTING: { label: 'Printing', tone: 'violet' },
  COMPLETED: { label: 'Completed', tone: 'emerald' },
  DECLINED: { label: 'Declined', tone: 'red' },
  CANCELLED: { label: 'Cancelled', tone: 'slate' },
});
export const LH_PAYMENT_STATUS_VIEW = Object.freeze({
  NOT_DUE: { label: 'Not due', tone: 'slate' },
  PENDING: { label: 'Pending payment', tone: 'amber' },
  PAID: { label: 'Paid', tone: 'emerald' },
  VOID: { label: 'Not charged', tone: 'slate' },
});
export const LH_ORDER_TABS = Object.freeze([
  { key: 'NEW', label: 'New', status: 'SUBMITTED', tone: 'amber' },
  { key: 'IN_PRINT', label: 'In Print', status: 'ACCEPTED,PRINTING', tone: 'violet' },
  { key: 'COMPLETED', label: 'Completed', status: 'COMPLETED', tone: 'emerald' },
  { key: 'DECLINED', label: 'Declined', status: 'DECLINED,CANCELLED', tone: 'red' },
  { key: 'ALL', label: 'All', status: '', tone: 'indigo' },
  { key: 'PAYMENTS', label: 'Payments', status: null, tone: 'blue' },
]);
export const LH_PAYMENT_METHODS = Object.freeze([
  { value: 'UPI_QR', label: 'UPI / QR' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTHER', label: 'Other' },
]);
export const LH_REFERENCE_REQUIRED = ['UPI_QR', 'BANK_TRANSFER'];
export const LH_METHOD_LABEL = Object.fromEntries(LH_PAYMENT_METHODS.map((m) => [m.value, m.label]));

/** Paise → "₹1,234.50" (sirf dikhana) */
export const formatPaise = (paise) => formatInr((Number(paise) || 0) / 100);
export const formatPaiseShort = (paise) => formatInrShort((Number(paise) || 0) / 100);

/** Rupee input ("12.5") → paise (1250) — sirf form input; hisaab server karta hai */
export const rupeesToPaise = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || !/^\d+(\.\d{1,2})?$/.test(String(value).trim())) return NaN;
  return Math.round(n * 100);
};
export const paiseToRupeesInput = (paise) => (paise === null || paise === undefined ? '' : String(paise / 100));

/** Rate ka chhota summary: "₹12 / page · B/W ₹6" */
export const rateSummary = (rate) => {
  if (!rate) return '';
  const unit = LH_UNIT_SHORT[rate.unit] || 'page';
  const bw = rate.bwRatePaise !== null && rate.bwRatePaise !== undefined && rate.bwRatePaise !== rate.colourRatePaise ? ` · B/W ${formatPaiseShort(rate.bwRatePaise)}` : '';
  return `${formatPaiseShort(rate.colourRatePaise)} / ${unit}${bw}`;
};
