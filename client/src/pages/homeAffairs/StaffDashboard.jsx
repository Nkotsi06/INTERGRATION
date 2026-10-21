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

      <div className="quick-actions" style={{ flexWrap: 'wrap', gap: 10 }}>
        <Button variant="primary" onClick={() => navigate('/home-affairs/birth-applications')}>
          Birth Certificate Applications
        </Button>
        <Button variant="primary" onClick={() => navigate('/home-affairs/applications')}>
          Process Applications
        </Button>
        <Button variant="secondary" onClick={() => navigate('/home-affairs/enquiries')}>
          Enquiries
        </Button>
        <Button variant="secondary" onClick={() => navigate('/home-affairs/verify-document')}>
          Verify Document
        </Button>
        <Button variant="secondary" onClick={() => navigate('/home-affairs/information')}>
          Info Services
        </Button>
        <Button variant="secondary" onClick={() => navigate('/home-affairs/registrations')}>
          New Registrations
        </Button>
        <Button variant="secondary" onClick={() => navigate('/home-affairs/certificates')}>
          Certificates
        </Button>
        <Button variant="secondary" onClick={() => navigate('/home-affairs/search')}>
          Search Citizens
        </Button>
      </div>
    </PageWrapper>
  );
}

export default HAStaffDashboard;