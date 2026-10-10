export const setSessionItem = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getSessionItem = (key) => {
  const item = sessionStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const removeSessionItem = (key) => {
  sessionStorage.removeItem(key);
};

export const clearSession = () => {
  sessionStorage.clear();
};

export const setLocalItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalItem = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const removeLocalItem = (key) => {
  localStorage.removeItem(key);
};