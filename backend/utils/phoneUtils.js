/**
 * Indian Phone Number Utilities for Backend
 * Standard Indian mobile numbers are 10 digits starting with 6, 7, 8, or 9.
 * Also accommodates national emergency helplines (112, 108, 100, 101, 1091, 1363)
 * and toll-free numbers (1800...).
 */

/**
 * Validate whether a phone number matches Indian mobile or emergency format.
 * Accepts numbers with or without +91, with leading 0, spaces, dashes, or parentheses.
 *
 * @param {string} phone
 * @param {boolean} [allowEmergency=true]
 * @returns {boolean}
 */
const validateIndianPhone = (phone, allowEmergency = true) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  if (allowEmergency) {
    if (['112', '108', '100', '101', '1091', '1363'].includes(cleaned)) {
      return true;
    }
    if (/^1800\d{6,7}$/.test(cleaned) || /^\+911800\d{6,7}$/.test(cleaned)) {
      return true;
    }
  }

  // Mobile: optional country code (+91, 91) or leading 0, followed by 6, 7, 8, 9 and 9 digits
  const mobileRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  return mobileRegex.test(cleaned);
};

/**
 * Formats an Indian phone number into standard "+91 98765 43210" display.
 *
 * @param {string} phone
 * @returns {string}
 */
const formatIndianPhone = (phone) => {
  if (!phone) return '';
  const str = String(phone).trim();
  const cleaned = str.replace(/[\s\-\(\)\.]/g, '');

  // Emergency short codes
  if (['112', '108', '100', '101', '1091', '1363'].includes(cleaned)) {
    return cleaned;
  }

  // Toll-free
  if (cleaned.startsWith('1800') || cleaned.startsWith('+911800')) {
    const digits = cleaned.replace(/^\+91/, '');
    if (digits.length >= 10) {
      return `1800 ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    return digits;
  }

  // Match 10-digit mobile number with optional prefix
  const match = cleaned.match(/(?:(?:\+?91|0))?([6-9]\d{9})$/);
  if (match) {
    const tenDigits = match[1];
    return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
  }

  // If already standard +91 followed by 10 digits
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }

  return str;
};

/**
 * Normalizes phone numbers to standard format "+91 98765 43210".
 *
 * @param {string} phone
 * @returns {string}
 */
const normalizeIndianPhone = (phone) => {
  if (!phone) return '';
  const str = String(phone).trim();
  const cleaned = str.replace(/[\s\-\(\)\.]/g, '');

  if (['112', '108', '100', '101', '1091', '1363'].includes(cleaned)) {
    return cleaned;
  }

  const match = cleaned.match(/(?:(?:\+?91|0))?([6-9]\d{9})$/);
  if (match) {
    const tenDigits = match[1];
    return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
  }

  return formatIndianPhone(str);
};

module.exports = {
  validateIndianPhone,
  formatIndianPhone,
  normalizeIndianPhone,
};

