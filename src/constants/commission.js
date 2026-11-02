// commission.js — payment mode ke values backend constants/commission.js ke saath same

export const PAYMENT_MODE_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTHER', label: 'Other' },
];

export const PAYMENT_MODE_LABELS = Object.fromEntries(PAYMENT_MODE_OPTIONS.map(({ value, label }) => [value, label]));

// Print request list ka payment filter (label backend ke PAYMENT_STATUS_VIEW jaise)
export const PAYMENT_STATUS_OPTIONS = [
  { value: 'NOT_DUE', label: 'Not due' },
  { value: 'PENDING', label: 'Pending Payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'VOID', label: 'Not charged' },
];

export const RATE_MIN = 1;
export const RATE_MAX = 1000;
export const RATE_NOTE_MAX = 300;
export const PAYMENT_REFERENCE_MAX = 100;
export const PAYMENT_NOTE_MAX = 500;
