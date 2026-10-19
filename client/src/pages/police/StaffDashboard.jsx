import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getStaffStats } from '../../api/policeApi';

function PoliceStaffDashboard() {
  const { data: stats, loading } = useFetch(getStaffStats, []);
  const navigate = useNavigate();

  return (
    <PageWrapper title="Police Staff Dashboard" accentColour="#922B21">
      <h1>Police staff dashboard</h1>

      {loading ? (
        <StatsSkeleton count={3} />
      ) : (
        <div className="stats-grid">
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.openCases ?? 0}</div>
              <div className="stat-label">Open cases</div>
            </div>
          </Card>

          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.closedCases ?? 0}</div>
              <div className="stat-label">Closed cases</div>
            </div>
          </Card>

          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.pendingUpdates ?? 0}</div>
              <div className="stat-label">Pending updates</div>
            </div>
          </Card>
        </div>
      )}

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/police/manage')}>
          Manage cases
        </Button>
        <Button variant="secondary" onClick={() => navigate('/police/staff/clearances')}>
          Manage clearances
        </Button>
        <Button variant="secondary" onClick={() => navigate('/police/staff/criminal-records')}>
          Manage criminal records
        </Button>
      </div>
    </PageWrapper>
  );
}

export default PoliceStaffDashboard;