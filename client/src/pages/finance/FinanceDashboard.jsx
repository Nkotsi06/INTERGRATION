import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

const SERVICES = [
  { code: 'REGISTER', name: 'Register for tax', routePrefix: 'finance/tax/register', colourHex: '#117864' },
  { code: 'PROFILE', name: 'View tax profile', routePrefix: 'finance/tax/profile', colourHex: '#117864' },
  { code: 'PAY', name: 'Make payment', routePrefix: 'finance/payment', colourHex: '#117864' },
  { code: 'HISTORY', name: 'Payment history', routePrefix: 'finance/tax/profile', colourHex: '#117864' },
  { code: 'CLEARANCE', name: 'Tax clearance', routePrefix: 'finance/tax/clearance', colourHex: '#117864' },
];

function FinanceDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="FINANCE"
      title="Finance Services"
      accentColour="#117864"
      intro="Welcome. Manage your tax records and payments."
      services={SERVICES}
    />
  );
}

export default FinanceDashboard;