import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

function FinanceDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="FINANCE"
      title="Finance Services"
      accentColour="#117864"
      intro="View the government finance services currently available."
      showBack
      backPath="/finance/dashboard"
    />
  );
}

export default FinanceDashboard;
