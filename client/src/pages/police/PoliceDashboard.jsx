import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

function PoliceDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="POLICE"
      title="Police Services"
      accentColour="#922B21"
      intro="Report incidents, track cases, and request clearances."
    />
  );
}

export default PoliceDashboard;