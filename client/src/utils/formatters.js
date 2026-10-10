export const formatDate = (date, format = 'DD MMM YYYY') => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en', { month: 'short' });
  const year = d.getFullYear();
  return format
    .replace('DD', day)
    .replace('MMM', month)
    .replace('YYYY', year);
};

export const formatCurrency = (amount, currency = 'LSL') => {
  return `${currency} ${Number(amount).toFixed(2)}`;
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
};

export const capitalizeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const truncate = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
};