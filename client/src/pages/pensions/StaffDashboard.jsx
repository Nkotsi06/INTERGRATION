import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getStaffStats } from '../../api/pensionsApi';

function PensionsStaffDashboard() {
  const { data: stats, loading } = useFetch(getStaffStats, []);
  const navigate = useNavigate();

  return (
    <PageWrapper title="Pensions Staff Dashboard" accentColour="#7D3C98">
      <h1>Pensions staff dashboard</h1>

      {loading ? (
        <StatsSkeleton count={3} />
      ) : (
        <div className="stats-grid">
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.activePensioners ?? 0}</div>
              <div className="stat-label">Active pensioners</div>
            </div>
          </Card>

          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.verificationsDue ?? 0}</div>
              <div className="stat-label">Verifications due</div>
            </div>
          </Card>

          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.paymentsProcessed ?? 0}</div>
              <div className="stat-label">Payments processed</div>
            </div>
          </Card>
        </div>
      )}

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/pensions/process')}>
          Process verifications
        </Button>
      </div>
    </PageWrapper>
  );
}

export default PensionsStaffDashboard;