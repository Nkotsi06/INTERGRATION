import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

function PensionsDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="PENSIONS"
      title="Pensions Services"
      accentColour="#7D3C98"
      intro="View your pension and keep your verification up to date."
    />
  );
}

export default PensionsDashboard;