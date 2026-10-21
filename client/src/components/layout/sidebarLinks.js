const HELP_LINK = { to: '/help', label: 'Help & Support' };
const NOTIFICATIONS_LINK = { to: '/notifications', label: 'Notifications' };

export const SIDEBAR_BY_ROLE = {
  CITIZEN: {
    label: 'Citizen workspace',
    links: [
      { to: '/citizen/dashboard', label: 'Dashboard' },
      { to: '/citizen/profile', label: 'My Profile' },
      { to: '/citizen/applications', label: 'My Applications' },
      { to: '/citizen/documents', label: 'My Documents' },
      { to: '/citizen/certificates', label: 'My Certificates' },
      { to: '/police/cases', label: 'My Police Cases' },
      NOTIFICATIONS_LINK,
      HELP_LINK,
    ],
  },

  ADMIN: {
    label: 'Administration',
    links: [
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/users', label: 'User Management' },
      { to: '/admin/audit-logs', label: 'Audit Logs' },
      { to: '/admin/branches', label: 'Branches' },
      { to: '/admin/settings', label: 'System Settings' },
      { to: '/admin/settings/ministries', label: 'Ministries' },
      { to: '/admin/settings/document-types', label: 'Document Types' },
      { to: '/admin/settings/statuses', label: 'Status Types' },
      { to: '/admin/settings/reference-formats', label: 'Reference Formats' },
      { to: '/admin/settings/languages', label: 'Languages' },
      { to: '/admin/settings/biometrics', label: 'Biometrics' },
      { to: '/admin/service-catalogue', label: 'Service Catalogue' },
      NOTIFICATIONS_LINK,
      HELP_LINK,
    ],
  },

  HOME_AFFAIRS: {
    label: 'Home Affairs workspace',
    links: [
      { to: '/home-affairs/dashboard', label: 'Dashboard' },
      { to: '/home-affairs/birth-applications', label: 'Birth Certificate Applications' },
      { to: '/home-affairs/registrations', label: 'New Registrations' },
      { to: '/home-affairs/search', label: 'Citizen Search' },
      { to: '/home-affairs/certificates', label: 'Certificates' },
      { to: '/home-affairs/reports', label: 'Reports' },
      NOTIFICATIONS_LINK,
      HELP_LINK,
    ],
  },

  TRAFFIC: {
    label: 'Traffic workspace',
    links: [
      { to: '/traffic/staff', label: 'Dashboard' },
      { to: '/traffic/processing', label: 'Process Applications' },
      NOTIFICATIONS_LINK,
      HELP_LINK,
    ],
  },

  POLICE: {
    label: 'Police workspace',
    links: [
      { to: '/police/staff', label: 'Dashboard' },
      { to: '/police/manage', label: 'Manage Cases' },
      { to: '/police/staff/clearances', label: 'Clearances' },
      { to: '/police/staff/criminal-records', label: 'Criminal Records' },
      NOTIFICATIONS_LINK,
      HELP_LINK,
    ],
  },

  FINANCE: {
    label: 'Finance workspace',
    links: [
      { to: '/finance/staff', label: 'Dashboard' },
      { to: '/finance/treasury', label: 'Treasury Payments' },
      { to: '/finance/budget', label: 'Budget Allocations' },
      { to: '/finance/debt', label: 'Debt & Aid' },
      { to: '/finance/procurement', label: 'Procurement' },
      { to: '/finance/audit', label: 'Internal Audit' },
      { to: '/finance/payments', label: 'Payments Received' },
      { to: '/finance/fee-schedule', label: 'Fee Schedule' },
      NOTIFICATIONS_LINK,
      HELP_LINK,
    ],
  },

  PENSIONS: {
    label: 'Pensions workspace',
    links: [
      { to: '/pensions/staff', label: 'Dashboard' },
      { to: '/pensions/process', label: 'Process Verifications' },
      NOTIFICATIONS_LINK,
      HELP_LINK,
    ],
  },

  PASSPORT: {
    label: 'Passport workspace',
    links: [
      { to: '/passport/staff', label: 'Dashboard' },
      { to: '/passport/process', label: 'Process Applications' },
      { to: '/passport/history', label: 'Application History' },
      NOTIFICATIONS_LINK,
      HELP_LINK,
    ],
  },
};

export function getSidebarConfig(role) {
  return SIDEBAR_BY_ROLE[role] || null;
}