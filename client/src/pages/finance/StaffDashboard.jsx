import { useNavigate } from 'react-router-dom';
import { FiUsers, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useFetch from '../../hooks/useFetch';
import { getStaffStats } from '../../api/financeApi';

function FinanceStaffDashboard() {
  const { data: stats, loading } = useFetch(getStaffStats, []);
  const navigate = useNavigate();

  return (
    <PageWrapper title="Finance Staff Dashboard" accentColour="#117864">
      <h1>Finance staff dashboard</h1>

      <div className="stats-grid">
        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiUsers /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.registeredTaxpayers ?? 0}</div>
            <div className="stat-label">Registered taxpayers</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiDollarSign /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.paymentsToday ?? 0}</div>
            <div className="stat-label">Payments today</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiTrendingUp /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.outstanding ?? 0}</div>
            <div className="stat-label">Outstanding balances</div>
          </div>
        </Card>
      </div>

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/finance/processing')}>
          Process tax registrations
        </Button>
      </div>
    </PageWrapper>
  );
}

export default FinanceStaffDashboard;