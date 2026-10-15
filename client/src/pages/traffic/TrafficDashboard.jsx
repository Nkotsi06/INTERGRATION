import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

function TrafficDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="TRAFFIC"
      title="Traffic Services"
      accentColour="#B9770E"
      intro="Welcome. Manage your driving licence, vehicles, and appointments."
    />
  );
}

export default TrafficDashboard;