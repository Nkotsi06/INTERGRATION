export const CERTIFICATE_TYPES = [
  { value: 'BIRTH', label: 'Birth certificate' },
  { value: 'DEATH', label: 'Death certificate' },
  { value: 'MARRIAGE', label: 'Marriage certificate' },
  { value: 'DIVORCE', label: 'Divorce certificate' },
];

export const CERTIFICATE_STATUS = {
  PENDING: { label: 'Pending', variant: 'captured' },
  ISSUED: { label: 'Issued', variant: 'verified' },
  REJECTED: { label: 'Rejected', variant: 'rejected' },
  CANCELLED: { label: 'Cancelled', variant: 'awaiting' },
};

export function typeLabel(type) {
  const t = CERTIFICATE_TYPES.find((c) => c.value === type);
  return t ? t.label : type;
}

export function statusLabel(status) {
  const s = CERTIFICATE_STATUS[status];
  return s ? s.label : status;
}