import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

const SERVICES = [
  { code: 'REGISTER',    name: 'Register for tax',        routePrefix: 'finance/tax/register',   colourHex: '#117864' },
  { code: 'PROFILE',     name: 'View tax profile',        routePrefix: 'finance/tax/profile',    colourHex: '#117864' },
  { code: 'PAY',         name: 'Make a payment',          routePrefix: 'finance/payment',        colourHex: '#117864' },
  { code: 'VAT',         name: 'VAT registration',        routePrefix: 'finance/vat',            colourHex: '#117864' },
  { code: 'RETURNS',     name: 'File tax return',         routePrefix: 'finance/returns',        colourHex: '#117864' },
  { code: 'PLANS',       name: 'Payment plans',           routePrefix: 'finance/payment-plans',  colourHex: '#117864' },
  { code: 'BUSINESS',    name: 'Business registration',   routePrefix: 'finance/businesses',     colourHex: '#117864' },
  { code: 'CLEARANCE',   name: 'Tax clearance',           routePrefix: 'finance/tax/clearance',  colourHex: '#117864' },
];

function FinanceDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="FINANCE"
      title="Finance Services"
      accentColour="#117864"
      intro="Manage your tax records, payments, VAT, returns, payment plans and business registration."
      services={SERVICES}
    />
  );
}

export default FinanceDashboard;