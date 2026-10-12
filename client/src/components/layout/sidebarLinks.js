// Sidebar link definitions per role.
// The sidebar reads this file and renders whatever it finds.

const HELP_LINK = { to: '/help', label: 'Help & Support' };

export const SIDEBAR_BY_ROLE = {
  CITIZEN: {
    label: 'Citizen workspace',
    links: [
      { to: '/citizen/dashboard',     label: 'Dashboard' },
      { to: '/citizen/profile',       label: 'My Profile' },
      { to: '/citizen/applications',  label: 'My Applications' },
      { to: '/citizen/documents',     label: 'My Documents' },
      { to: '/citizen/notifications', label: 'Notifications' },
      HELP_LINK,
    ],
  },

  ADMIN: {
    label: 'Administration',
    links: [
      { to: '/admin/dashboard',  label: 'Dashboard' },
      { to: '/admin/users',      label: 'User Management' },
      { to: '/admin/audit-logs', label: 'Audit Logs' },

      { to: '/admin/settings',                   label: 'System Settings' },
      { to: '/admin/settings/ministries',        label: 'Ministries' },
      { to: '/admin/settings/document-types',    label: 'Document Types' },
      { to: '/admin/settings/statuses',          label: 'Status Types' },
      { to: '/admin/settings/reference-formats', label: 'Reference Formats' },
      { to: '/admin/settings/languages',         label: 'Languages' },
      { to: '/admin/settings/logo',              label: 'System Logo' },
      { to: '/admin/settings/biometrics',        label: 'Biometrics' },

      HELP_LINK,
    ],
  },

  HOME_AFFAIRS: {
    label: 'Home Affairs workspace',
    links: [
      { to: '/home-affairs/dashboard',     label: 'Dashboard' },
      { to: '/home-affairs/registrations', label: 'New Registrations' },
      { to: '/home-affairs/search',        label: 'Citizen Search' },
      { to: '/home-affairs/reports',       label: 'Reports' },
      HELP_LINK,
    ],
  },

  TRAFFIC: {
    label: 'Traffic workspace',
    links: [
      { to: '/traffic/staff',      label: 'Dashboard' },
      { to: '/traffic/processing', label: 'Process Applications' },
      HELP_LINK,
    ],
  },

  POLICE: {
    label: 'Police workspace',
    links: [
      { to: '/police/staff',  label: 'Dashboard' },
      { to: '/police/manage', label: 'Manage Cases' },
      HELP_LINK,
    ],
  },

  FINANCE: {
    label: 'Finance workspace',
    links: [
      { to: '/finance/staff',      label: 'Dashboard' },
      { to: '/finance/processing', label: 'Process Registrations' },
      HELP_LINK,
    ],
  },

  PENSIONS: {
    label: 'Pensions workspace',
    links: [
      { to: '/pensions/staff',   label: 'Dashboard' },
      { to: '/pensions/process', label: 'Process Verifications' },
      HELP_LINK,
    ],
  },

  PASSPORT: {
    label: 'Passport workspace',
    links: [
      { to: '/passport/staff',   label: 'Dashboard' },
      { to: '/passport/process', label: 'Process Applications' },
      { to: '/passport/history', label: 'Application History' },
      HELP_LINK,
    ],
  },
};

export function getSidebarConfig(role) {
  return SIDEBAR_BY_ROLE[role] || null;
}