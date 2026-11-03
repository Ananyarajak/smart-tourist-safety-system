/**
 * Indian Phone Number Utilities for Frontend
 * Standard Indian mobile numbers are 10 digits starting with 6, 7, 8, or 9.
 * Accepts numbers with or without +91 prefix, leading 0, spaces, and hyphens.
 */

/**
 * Validates whether the given string is a valid Indian mobile number or emergency helpline.
 * @param {string} phone
 * @param {boolean} [allowEmergency=true]
 * @returns {boolean}
 */
export const validateIndianPhone = (phone, allowEmergency = true) => {
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

  // 10 digits starting with 6, 7, 8, or 9 with optional +91, 91, or 0
  const mobileRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  return mobileRegex.test(cleaned);
};

/**
 * Formats a phone number consistently into "+91 98765 43210" or clean shortcode format.
 * @param {string|number} phone
 * @returns {string}
 */
export const formatIndianPhone = (phone) => {
  if (!phone) return '';
  const str = String(phone).trim();
  const cleaned = str.replace(/[\s\-\(\)\.]/g, '');

  // Emergency short codes (112, 108, 100, 101, 1091, 1363)
  if (['112', '108', '100', '101', '1091', '1363'].includes(cleaned)) {
    return cleaned;
  }

  // Toll-free (e.g. 1800 233 7777)
  if (cleaned.startsWith('1800') || cleaned.startsWith('+911800')) {
    const digits = cleaned.replace(/^\+91/, '');
    if (digits.length >= 10) {
      return `1800 ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    return digits;
  }

  // Mobile number 10 digits
  const match = cleaned.match(/(?:(?:\+?91|0))?([6-9]\d{9})$/);
  if (match) {
    const tenDigits = match[1];
    return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
  }

  // Standard +91 followed by 10 digits
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }

  return str;
};

/**
 * Cleans phone for tel: links
 * @param {string|number} phone
 * @returns {string}
 */
export const cleanPhoneForDial = (phone) => {
  if (!phone) return '';
  const str = String(phone).trim();
  const cleaned = str.replace(/[\s\-\(\)\.]/g, '');
  if (['112', '108', '100', '101', '1091', '1363'].includes(cleaned)) {
    return cleaned;
  }
  const match = cleaned.match(/(?:(?:\+?91|0))?([6-9]\d{9})$/);
  if (match) {
    return `+91${match[1]}`;
  }
  return cleaned.startsWith('+') ? cleaned : `+91${cleaned.replace(/^0/, '')}`;
};

