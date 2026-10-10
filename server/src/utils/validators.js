const { body, param, query } = require('express-validator');

const nationalIdRule = body('nationalId')
  .trim()
  .matches(/^\d{10,18}$/)
  .withMessage('National ID must be 10-18 digits');

const emailRule = body('email')
  .trim()
  .isEmail()
  .withMessage('Invalid email address')
  .normalizeEmail();

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/\d/)
  .withMessage('Password must contain a number');

const usernameRule = body('username')
  .trim()
  .isLength({ min: 3, max: 50 })
  .withMessage('Username must be 3-50 characters')
  .matches(/^[a-zA-Z0-9_.-]+$/)
  .withMessage('Username may contain letters, numbers, dots, dashes, underscores only');

module.exports = {
  nationalIdRule,
  emailRule,
  passwordRule,
  usernameRule,
  body,
  param,
  query,
};