/**
 * Indian Localization Utilities (Date, 24-Hour Time, Timezone & Currency)
 * Standard Date: DD/MM/YYYY
 * Standard Time: 24-hour format (HH:mm or HH:mm:ss)
 * Default Timezone: Asia/Kolkata
 * Default Currency: INR (₹)
 */

const TIMEZONE = 'Asia/Kolkata';
const LOCALE = 'en-IN';

/**
 * Format date in DD/MM/YYYY format with Asia/Kolkata timezone.
 * @param {string|Date|number} dateInput
 * @returns {string} e.g. "01/11/2026"
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

/**
 * Format time in 24-hour format (HH:mm or HH:mm:ss) with Asia/Kolkata timezone.
 * @param {string|Date|number} dateInput
 * @param {boolean} [includeSeconds=false]
 * @returns {string} e.g. "20:45" or "20:45:16"
 */
export const formatTime = (dateInput, includeSeconds = false) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: false,
  }).format(d);
};

/**
 * Format datetime in DD/MM/YYYY, HH:mm:ss format with Asia/Kolkata timezone.
 * @param {string|Date|number} dateInput
 * @param {boolean} [includeSeconds=true]
 * @returns {string} e.g. "01/11/2026, 20:45:16"
 */
export const formatDateTime = (dateInput, includeSeconds = true) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const datePart = formatDate(d);
  const timePart = formatTime(d, includeSeconds);
  return `${datePart}, ${timePart}`;
};

/**
 * Format currency in Indian Rupees (₹).
 * @param {number|string} amount
 * @returns {string} e.g. "₹1,500"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0';
  }
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount));
};

