/**
 * Indian Emergency Services & Helplines Configuration
 * Primary Emergency Helpline: 112 (National Emergency Response Support System - ERSS)
 * Medical/Ambulance: 108
 * Police Assistance: 100
 * Fire & Rescue: 101
 * Women Helpline: 1091
 * Tourist Helpline: 1363 (24/7 Multi-lingual Tourist Helpline)
 */

export const DEFAULT_INDIAN_EMERGENCY_HELPLINES = [
  {
    id: 'erss-112',
    number: '112',
    name: 'National Emergency Helpline (ERSS)',
    subtitle: 'Unified All-in-One Emergency (Police, Fire, Ambulance, Disaster)',
    category: 'primary',
    isPrimary: true,
    color: '#ef4444',
    bg: '#fee2e2',
    badge: 'PRIMARY 24/7',
    description: 'Single emergency number across India. Direct integration with State Emergency Response Centers.',
  },
  {
    id: 'ambulance-108',
    number: '108',
    name: 'Emergency Medical & Ambulance',
    subtitle: 'Free 24/7 Emergency Ambulance Service',
    category: 'ambulance',
    isPrimary: false,
    color: '#dc2626',
    bg: '#fef2f2',
    badge: 'MEDICAL / 108',
    description: 'Immediate trauma, cardiac, obstetric, and disaster medical dispatch response.',
  },
  {
    id: 'police-100',
    number: '100',
    name: 'Police Emergency Assistance',
    subtitle: 'Direct Police Control Room Dispatch',
    category: 'police',
    isPrimary: false,
    color: '#2563eb',
    bg: '#eff6ff',
    badge: 'POLICE / 100',
    description: 'Direct connection to local city and highway police patrol units.',
  },
  {
    id: 'tourist-1363',
    number: '1363',
    name: 'National Tourist Helpline',
    subtitle: 'Ministry of Tourism, Govt of India',
    category: 'tourist',
    isPrimary: false,
    color: '#0d9488',
    bg: '#ccfbf1',
    badge: 'TOURIST / 1363',
    description: 'Toll-free 24/7 assistance in 12 languages (including Hindi, English, foreign languages).',
  },
  {
    id: 'women-1091',
    number: '1091',
    name: 'Women Safety Helpline',
    subtitle: '24/7 Women in Distress Support',
    category: 'safety',
    isPrimary: false,
    color: '#db2777',
    bg: '#fce7f3',
    badge: 'WOMEN / 1091',
    description: 'Dedicated women safety cells, tourist harassment reporting, and counseling support.',
  },
  {
    id: 'fire-101',
    number: '101',
    name: 'Fire & Rescue Service',
    subtitle: 'Municipal Fire Brigade & Hazard Response',
    category: 'fire',
    isPrimary: false,
    color: '#ea580c',
    bg: '#ffedd5',
    badge: 'FIRE / 101',
    description: 'Fire suppression, building collapse rescue, and disaster relief.',
  },
];

const STORAGE_KEY = 'tourist_indian_emergency_helplines';

/**
 * Get current configured emergency helplines.
 * Defaults to official Indian helplines if not modified.
 */
export const getEmergencyHelplines = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read emergency helplines from localStorage:', err);
  }
  return DEFAULT_INDIAN_EMERGENCY_HELPLINES;
};

/**
 * Save customized emergency helpline numbers.
 */
export const saveEmergencyHelplines = (helplines) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(helplines));
  } catch (err) {
    console.warn('Could not save emergency helplines to localStorage:', err);
  }
};

/**
 * Reset emergency helplines to standard defaults.
 */
export const resetEmergencyHelplines = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Could not reset emergency helplines:', err);
  }
  return DEFAULT_INDIAN_EMERGENCY_HELPLINES;
};

