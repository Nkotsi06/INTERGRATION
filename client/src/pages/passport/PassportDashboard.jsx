import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

const SERVICES = [
  { code: 'APPLY', name: 'Apply for passport', routePrefix: 'passport/apply', colourHex: '#17A2B8' },
  { code: 'RENEW', name: 'Renew passport', routePrefix: 'passport/renew', colourHex: '#17A2B8' },
  { code: 'STATUS', name: 'Check application status', routePrefix: 'passport/status', colourHex: '#17A2B8' },
];

function PassportDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="PASSPORT"
      title="Passport Services"
      accentColour="#17A2B8"
      intro="Welcome. Apply, renew, and track your passport."
      services={SERVICES}
    />
  );
}

export default PassportDashboard;