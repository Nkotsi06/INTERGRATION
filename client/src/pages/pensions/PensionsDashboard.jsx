import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

const SERVICES = [
  { code: 'INFO', name: 'View pension information', routePrefix: 'pensions/info', colourHex: '#7D3C98' },
  { code: 'VERIFY', name: 'Perform existence verification', routePrefix: 'pensions/verify', colourHex: '#7D3C98' },
  { code: 'HISTORY', name: 'Verification history', routePrefix: 'pensions/history', colourHex: '#7D3C98' },
];

function PensionsDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="PENSIONS"
      title="Pensions Services"
      accentColour="#7D3C98"
      intro="Welcome. View your pension and keep your verification up to date."
      services={SERVICES}
    />
  );
}

export default PensionsDashboard;