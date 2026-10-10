// Only truly static server-side constants.
// Everything else is loaded from database.

module.exports = {
  ROLES: {
    CITIZEN: 'CITIZEN',
    ADMIN: 'ADMIN',
    HOME_AFFAIRS: 'HOME_AFFAIRS',
    TRAFFIC: 'TRAFFIC',
    POLICE: 'POLICE',
    FINANCE: 'FINANCE',
    PENSIONS: 'PENSIONS',
    PASSPORT: 'PASSPORT',
  },

  STAFF_ROLES: [
    'HOME_AFFAIRS',
    'TRAFFIC',
    'POLICE',
    'FINANCE',
    'PENSIONS',
    'PASSPORT',
  ],

  MINISTRY_ROLES: {
    HOME_AFFAIRS: 'HOME_AFFAIRS',
    TRAFFIC: 'TRAFFIC',
    POLICE: 'POLICE',
    FINANCE: 'FINANCE',
    PENSIONS: 'PENSIONS',
    PASSPORT: 'PASSPORT',
  },
};