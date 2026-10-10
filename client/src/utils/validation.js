export const validateRequired = (value) => {
  if (!value || value.toString().trim() === '') {
    return 'This field is required';
  }
  return null;
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password, minLength = 8) => {
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

export const validateNationalId = (id) => {
  if (!/^\d{10,18}$/.test(id)) {
    return 'National ID must be between 10 and 18 digits';
  }
  return null;
};

export const validateMatch = (value1, value2, fieldName = 'Fields') => {
  if (value1 !== value2) {
    return `${fieldName} do not match`;
  }
  return null;
};