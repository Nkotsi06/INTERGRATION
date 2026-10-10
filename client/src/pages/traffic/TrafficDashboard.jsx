import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

const SERVICES = [
  { code: 'VIEW', name: 'View driving licence', routePrefix: 'traffic/licence', colourHex: '#B9770E' },
  { code: 'RENEW', name: 'Renew driving licence', routePrefix: 'traffic/renew', colourHex: '#B9770E' },
  { code: 'TEST', name: 'Book driving test', routePrefix: 'traffic/book-test', colourHex: '#B9770E' },
  { code: 'APPOINTMENTS', name: 'My appointments', routePrefix: 'traffic/appointments', colourHex: '#B9770E' },
];

function TrafficDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="TRAFFIC"
      title="Traffic Services"
      accentColour="#B9770E"
      intro="Welcome. Manage your driving licence and appointments."
      services={SERVICES}
    />
  );
}

export default TrafficDashboard;