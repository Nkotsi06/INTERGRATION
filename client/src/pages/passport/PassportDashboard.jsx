import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

function PassportDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="PASSPORT"
      title="Passport Services"
      accentColour="#17A2B8"
      intro="Apply, renew, and track your passport."
    />
  );
}

export default PassportDashboard;