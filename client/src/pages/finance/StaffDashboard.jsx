import { useNavigate } from 'react-router-dom';
import {
  FiBriefcase,
  FiTrendingUp,
  FiDollarSign,
  FiFolder,
  FiBook,
  FiShield,
  FiFileText,
  FiCreditCard,
  FiUsers,
} from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const QUICK_LINKS = [
  { to: '/finance/treasury',     label: 'Treasury Payments',     icon: <FiDollarSign /> },
  { to: '/finance/budget',       label: 'Budget Allocations',    icon: <FiBriefcase /> },
  { to: '/finance/debt',         label: 'Debt & Aid',            icon: <FiTrendingUp /> },
  { to: '/finance/procurement',  label: 'Procurement',           icon: <FiFolder /> },
  { to: '/finance/tax-policy',   label: 'Tax Policy',            icon: <FiBook /> },
  { to: '/finance/audit',        label: 'Internal Audit',        icon: <FiShield /> },
];

const PROCESSING_LINKS = [
  { to: '/finance/processing',       label: 'Tax Registrations', icon: <FiUsers /> },
  { to: '/finance/staff/vat',        label: 'VAT Applications',  icon: <FiFileText /> },
  { to: '/finance/staff/returns',    label: 'Tax Returns',       icon: <FiFileText /> },
  { to: '/finance/staff/plans',      label: 'Payment Plans',     icon: <FiCreditCard /> },
  { to: '/finance/staff/businesses', label: 'Business Regs',     icon: <FiBriefcase /> },
];

function FinanceStaffDashboard() {
  const navigate = useNavigate();

  return (
    <PageWrapper title="Finance Staff Dashboard" accentColour="#117864">
      <h1>Finance staff dashboard</h1>
      <p className="text-muted">
        Ministry of Finance — Treasury, Budget, Debt, Procurement, Tax Policy,
        Internal Audit, and citizen application processing.
      </p>

      <section className="dashboard-section">
        <h2>Ministry dashboards</h2>
        <div className="services-grid">
          {QUICK_LINKS.map((link) => (
            <Card
              key={link.to}
              variant="bordered"
              className="service-card"
              onClick={() => navigate(link.to)}
            >
              <div className="stat-icon">{link.icon}</div>
              <div className="service-card-body">
                <span className="service-card-name">{link.label}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Citizen processing</h2>
        <div className="services-grid">
          {PROCESSING_LINKS.map((link) => (
            <Card
              key={link.to}
              variant="bordered"
              className="service-card"
              onClick={() => navigate(link.to)}
            >
              <div className="stat-icon">{link.icon}</div>
              <div className="service-card-body">
                <span className="service-card-name">{link.label}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/finance/processing')}>
          Process tax registrations
        </Button>
      </div>
    </PageWrapper>
  );
}

export default FinanceStaffDashboard;