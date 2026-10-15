import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

function FinanceDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="FINANCE"
      title="Finance Services"
      accentColour="#117864"
      intro="Manage your tax, payments, and clearances."
    />
  );
}

export default FinanceDashboard;