import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getDashboardStats } from '../../api/homeAffairsApi';

function HAStaffDashboard() {
  const { data: stats, loading } = useFetch(getDashboardStats, []);
  const navigate = useNavigate();

  return (
    <PageWrapper title="Home Affairs Dashboard" accentColour="#1A5276">
      <h1>Home Affairs Dashboard</h1>

      {loading ? (
        <StatsSkeleton count={5} />
      ) : (
        <div className="stats-grid">
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.awaiting ?? 0}</div>
              <div className="stat-label">New registrations</div>
            </div>
          </Card>

          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.captured ?? 0}</div>
              <div className="stat-label">Details captured</div>
            </div>
          </Card>

          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.verified ?? 0}</div>
              <div className="stat-label">Verified citizens</div>
            </div>
          </Card>

          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.pendingCertificates ?? 0}</div>
              <div className="stat-label">Pending certificates</div>
            </div>
          </Card>

          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.updatedToday ?? 0}</div>
              <div className="stat-label">Updated today</div>
            </div>
          </Card>
        </div>
      )}

      <div className="quick-actions">
        <Button
          variant="primary"
          onClick={() => navigate('/home-affairs/registrations')}
        >
          Review new registrations
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/home-affairs/search')}
        >
          Search citizen
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/home-affairs/certificates')}
        >
          Certificates
        </Button>
      </div>
    </PageWrapper>
  );
}

export default HAStaffDashboard;