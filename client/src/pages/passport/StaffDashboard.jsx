import { useNavigate } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useFetch from '../../hooks/useFetch';
import { getStaffStats } from '../../api/passportApi';

function PassportStaffDashboard() {
  const { data: stats, loading } = useFetch(getStaffStats, []);
  const navigate = useNavigate();

  return (
    <PageWrapper title="Passport Staff Dashboard" accentColour="#17A2B8">
      <h1>Passport staff dashboard</h1>

      <div className="stats-grid">
        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiClock /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.pending ?? 0}</div>
            <div className="stat-label">Pending</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiCheckCircle /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.approvedToday ?? 0}</div>
            <div className="stat-label">Approved today</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiXCircle /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.rejectedToday ?? 0}</div>
            <div className="stat-label">Rejected today</div>
          </div>
        </Card>
      </div>

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/passport/process')}>
          Process applications
        </Button>
        <Button variant="secondary" onClick={() => navigate('/passport/history')}>
          View history
        </Button>
      </div>
    </PageWrapper>
  );
}

export default PassportStaffDashboard;