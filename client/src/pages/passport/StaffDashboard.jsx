import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import Alert from '../../components/common/Alert';
import useFetch from '../../hooks/useFetch';
import { getStaffStats } from '../../api/passportApi';

function PassportStaffDashboard() {
  const { data: stats, loading, error, refetch } = useFetch(getStaffStats, []);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(refetch, 30000);
    return () => window.clearInterval(timer);
  }, [refetch]);

  return (
    <PageWrapper title="Passport Staff Dashboard" accentColour="#17A2B8">
      <h1>Passport staff dashboard</h1>
      {error && <Alert type="error" message={error} />}

      {loading ? (
        <StatsSkeleton count={3} />
      ) : (
        <div className="stats-grid">
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.pending ?? 0}</div>
              <div className="stat-label">Pending</div>
            </div>
          </Card>

          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.approvedToday ?? 0}</div>
              <div className="stat-label">Approved today</div>
            </div>
          </Card>

          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.rejectedToday ?? 0}</div>
              <div className="stat-label">Rejected today</div>
            </div>
          </Card>
        </div>
      )}

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