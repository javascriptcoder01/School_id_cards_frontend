// commissionForm.js — SetRateModal aur MarkPaidModal ke form helpers
import { RATE_MAX, RATE_MIN } from '../constants/commission.js';
import { formatInr, formatInrShort } from './money.js';

const pad = (value) => String(value).padStart(2, '0');

export const DATE_RANGE_PRESETS = [
  { key: 'THIS_MONTH', label: 'This month' },
  { key: 'LAST_MONTH', label: 'Last month' },
  { key: 'THIS_YEAR', label: 'This year' },
  { key: 'ALL_TIME', label: 'All time' },
  { key: 'CUSTOM', label: 'Custom' },
];

// Browser ke din ke hisaab se poora din: din ki shuruaat se din ke aakhir tak
const startOfDay = (year, month, day) => new Date(year, month, day).toISOString();
const endOfDay = (year, month, day) => new Date(year, month, day, 23, 59, 59, 999).toISOString();

/**
 * Filter → API ke { from, to }. All time / khaali custom → {}.
 * @param {{ preset: string, customFrom?: string, customTo?: string }} filter - custom dates YYYY-MM-DD
 * @param {Date} [now]
 * @returns {{ from?: string, to?: string }}
 */
export const toDateRangeParams = ({ preset, customFrom = '', customTo = '' }, now = new Date()) => {
  const year = now.getFullYear();
  const month = now.getMonth();

  if (preset === 'THIS_MONTH') {
    return { from: startOfDay(year, month, 1), to: endOfDay(year, month + 1, 0) };
  }
  if (preset === 'LAST_MONTH') {
    return { from: startOfDay(year, month - 1, 1), to: endOfDay(year, month, 0) };
  }
  if (preset === 'THIS_YEAR') {
    return { from: startOfDay(year, 0, 1), to: endOfDay(year, 11, 31) };
  }
  if (preset === 'CUSTOM') {
    const params = {};
    if (customFrom) {
      const [y, m, d] = customFrom.split('-').map(Number);
      params.from = startOfDay(y, m - 1, d);
    }
    if (customTo) {
      const [y, m, d] = customTo.split('-').map(Number);
      params.to = endOfDay(y, m - 1, d);
    }
    return params;
  }
  return {};
};

// API ka pagination (totalItems) → StudentPagination ke props (total)
export const toPaginationProps = (pagination) =>
  pagination ? { ...pagination, total: pagination.totalItems ?? 0 } : undefined;

// "1 card", "20 cards"
export const cardsLabel = (count) => `${count ?? 0} ${count === 1 ? 'card' : 'cards'}`;

// Approve confirm ki line: "20 cards × ₹60 = ₹1,200.00 will be added to Pending Payment."
export const approveAmountMessage = (request) => {
  const estimate = request?.estimate;
  if (!estimate) return 'ID card rate is not set yet. Ask the Super Admin.';
  return `${cardsLabel(estimate.cardCount)} × ${formatInrShort(estimate.rate)} = ${formatInr(estimate.amount)} will be added to Pending Payment.`;
};

// Galat ho to message, sahi ho to null
export const validateRateInput = (value) => {
  const text = String(value ?? '').trim();
  if (!text) return 'Enter the rate per card.';
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return 'Enter a valid amount with at most 2 decimals.';
  const rate = Number(text);
  if (rate < RATE_MIN || rate > RATE_MAX) return `Rate must be between ₹${RATE_MIN} and ₹${RATE_MAX}.`;
  return null;
};

// Browser ki apni date (YYYY-MM-DD) — toISOString UTC deta, raat mein kal ki date ban jaati
export const toLocalDateInput = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Aaj → abhi ka time; purani date → us din dopahar. Sirf date bhejne par server use UTC raat 12 maanta
// aur subah ke waqt aaj ki date bhi "future" ho sakti thi.
export const toPaidAtIso = (dateInput, now = new Date()) => {
  if (dateInput === toLocalDateInput(now)) return now.toISOString();
  const [year, month, day] = dateInput.split('-').map(Number);
  return new Date(year, month - 1, day, 12).toISOString();
};
