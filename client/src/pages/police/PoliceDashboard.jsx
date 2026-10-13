import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

const SERVICES = [
  { code: 'REPORT',     name: 'Report a case',                  routePrefix: 'police/report',            colourHex: '#922B21' },
  { code: 'CASES',      name: 'My cases',                       routePrefix: 'police/cases',             colourHex: '#922B21' },
  { code: 'CLEARANCE',  name: 'Request clearance certificate',  routePrefix: 'police/clearance',         colourHex: '#922B21' },
  { code: 'CRIMINAL',   name: 'Criminal record',                routePrefix: 'police/criminal-records',  colourHex: '#922B21' },
];

function PoliceDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="POLICE"
      title="Police Services"
      accentColour="#922B21"
      intro="Welcome. Report incidents, track cases and request records."
      services={SERVICES}
    />
  );
}

export default PoliceDashboard;