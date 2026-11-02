// money.js — sirf dikhane ke liye. Amount hamesha server calculate karta hai, frontend nahi.
const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

/**
 * @param {number|null|undefined} amount - rupees (API ka amount / rate)
 * @returns {string} e.g. '₹1,250.00'; amount nahi to '—'
 */
export const formatInr = (amount) => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '—';
  return inrFormatter.format(Number(amount));
};

/**
 * Rate ke liye: poore rupee par .00 nahi
 * @param {number|null|undefined} amount - rupees
 * @returns {string} e.g. '₹60', '₹12.50'; amount nahi to '—'
 */
export const formatInrShort = (amount) => formatInr(amount).replace(/\.00$/, '');

export default { formatInr, formatInrShort };
