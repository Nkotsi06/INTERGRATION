import {
  FiActivity,
  FiArchive,
  FiArrowLeft,
  FiArrowRight,
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiCreditCard,
  FiDollarSign,
  FiDownload,
  FiEdit2,
  FiFileText,
  FiGlobe,
  FiGrid,
  FiHelpCircle,
  FiHome,
  FiInfo,
  FiKey,
  FiLayers,
  FiLogIn,
  FiLogOut,
  FiMapPin,
  FiMenu,
  FiPlus,
  FiPrinter,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiSend,
  FiSettings,
  FiShield,
  FiTrash2,
  FiAlertTriangle,
  FiUpload,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
  FiEye,
} from 'react-icons/fi';

const BUTTON_ACTIONS = [
  [/\b(download|export)\b/i, FiDownload],
  [/\b(print)\b/i, FiPrinter],
  [/\b(view|show|open|details)\b/i, FiEye],
  [/\b(search|find)\b/i, FiSearch],
  [/\b(refresh|reload|retry)\b/i, FiRefreshCw],
  [/\b(add|new|create)\b/i, FiPlus],
  [/\b(delete|remove)\b/i, FiTrash2],
  [/\b(edit|update|change)\b/i, FiEdit2],
  [/\b(approve|issue|verify|confirm|complete|collect)\b/i, FiCheck],
  [/\b(reject|decline)\b/i, FiX],
  [/\b(upload|attach|browse)\b/i, FiUpload],
  [/\b(save)\b/i, FiSave],
  [/\b(submit|send|apply|pay)\b/i, FiSend],
  [/\b(cancel|close|dismiss)\b/i, FiX],
  [/\b(back|previous|return)\b/i, FiArrowLeft],
  [/\b(next|continue|proceed)\b/i, FiArrowRight],
  [/\b(log ?in|sign ?in)\b/i, FiLogIn],
  [/\b(log ?out|sign ?out)\b/i, FiLogOut],
  [/\b(reset|clear)\b/i, FiRefreshCw],
];

export function getButtonIcon(label) {
  if (typeof label !== 'string') return null;
  return BUTTON_ACTIONS.find(([pattern]) => pattern.test(label))?.[1] || null;
}

const NAVIGATION_ICONS = [
  [/\b(dashboard|home)\b/i, FiHome],
  [/\b(profile|account|user management)\b/i, FiUser],
  [/\b(citizens|users|employees)\b/i, FiUsers],
  [/\b(application|registration|queue|processing)s?\b/i, FiClipboard],
  [/\b(documents?|certificates?|passports?|licences?|licenses?|id cards?)\b/i, FiFileText],
  [/\b(audit logs?)\b/i, FiActivity],
  [/\b(police|cases?|clearances?|criminal)\b/i, FiShield],
  [/\b(payments?|treasury|debts?|budgets?|finance|fees?|aid|procurement)\b/i, FiDollarSign],
  [/\b(pensions?|verifications?)\b/i, FiCheckCircle],
  [/\b(branch(es)?|districts?|locations?)\b/i, FiMapPin],
  [/\b(reports?|analytics|audit)\b/i, FiActivity],
  [/\b(settings?|system|status types|document types|reference formats|languages?|biometrics?)\b/i, FiSettings],
  [/\b(service catalogue|services)\b/i, FiLayers],
  [/\b(employer|government)\b/i, FiBriefcase],
  [/\b(notification)\b/i, FiBell],
  [/\b(help|support)\b/i, FiHelpCircle],
  [/\bministr(y|ies)\b/i, FiArchive],
  [/\b(payment|card)\b/i, FiCreditCard],
  [/\b(guide|getting started)\b/i, FiBookOpen],
  [/\b(password|security)\b/i, FiKey],
];

export function getNavigationIcon(label) {
  if (typeof label !== 'string') return FiGrid;
  return NAVIGATION_ICONS.find(([pattern]) => pattern.test(label))?.[1] || FiGrid;
}

export function getAlertIcon(type) {
  if (type === 'success') return FiCheckCircle;
  if (type === 'warning') return FiAlertTriangle;
  if (type === 'error') return FiXCircle;
  return FiInfo;
}

export function getStatusIcon(variant) {
  if (['verified', 'approved', 'completed', 'collected', 'issued', 'resolved'].includes(variant)) {
    return FiCheckCircle;
  }
  if (['rejected', 'error'].includes(variant)) return FiXCircle;
  if (['pending', 'submitted', 'under_review', 'inReview', 'in_progress', 'open'].includes(variant)) {
    return FiActivity;
  }
  return FiArchive;
}

export { FiArrowLeft, FiBell, FiGlobe, FiLogOut, FiMenu, FiX };
