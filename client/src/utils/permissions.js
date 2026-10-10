export const ROLES = {
  CITIZEN: 'CITIZEN',
  ADMIN: 'ADMIN',
  HOME_AFFAIRS: 'HOME_AFFAIRS',
  TRAFFIC: 'TRAFFIC',
  POLICE: 'POLICE',
  FINANCE: 'FINANCE',
  PENSIONS: 'PENSIONS',
  PASSPORT: 'PASSPORT',
};

export const STAFF_ROLES = [
  ROLES.HOME_AFFAIRS,
  ROLES.TRAFFIC,
  ROLES.POLICE,
  ROLES.FINANCE,
  ROLES.PENSIONS,
  ROLES.PASSPORT,
];

export const canAccess = (userRole, allowedRoles) => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

export const getDashboardPath = (role) => {
  switch (role) {
    case ROLES.CITIZEN:
      return '/citizen/dashboard';
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.HOME_AFFAIRS:
      return '/home-affairs/dashboard';
    case ROLES.TRAFFIC:
      return '/traffic/staff';
    case ROLES.POLICE:
      return '/police/staff';
    case ROLES.FINANCE:
      return '/finance/staff';
    case ROLES.PENSIONS:
      return '/pensions/staff';
    case ROLES.PASSPORT:
      return '/passport/staff';
    default:
      return '/';
  }
};