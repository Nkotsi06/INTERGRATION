import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getStaffStats } from '../../api/trafficApi';

function TrafficStaffDashboard() {
  const { data: stats, loading } = useFetch(getStaffStats, []);
  const navigate = useNavigate();

  return (
    <PageWrapper title="Traffic Staff Dashboard" accentColour="#B9770E">
      <h1>Traffic staff dashboard</h1>

      {loading ? (
        <StatsSkeleton count={3} />
      ) : (
        <div className="stats-grid">
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.pending ?? 0}</div>
              <div className="stat-label">Pending applications</div>
            </div>
          </Card>
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.todayAppointments ?? 0}</div>
              <div className="stat-label">Today's appointments</div>
            </div>
          </Card>
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.licencesIssued ?? 0}</div>
              <div className="stat-label">Licences issued</div>
            </div>
          </Card>
        </div>
      )}

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/traffic/processing')}>
          Process applications
        </Button>
        <Button variant="secondary" onClick={() => navigate('/traffic/processing')}>
          Inspections &amp; permits
        </Button>
      </div>
    </PageWrapper>
  );
}

export default TrafficStaffDashboard;