import { useNavigate } from 'react-router-dom';
import {
  FiUserPlus,
  FiEdit3,
  FiCheckCircle,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useFetch from '../../hooks/useFetch';
import { getDashboardStats } from '../../api/homeAffairsApi';

function HAStaffDashboard() {
  const { data: stats, loading } = useFetch(getDashboardStats, []);
  const navigate = useNavigate();

  return (
    <PageWrapper title="Home Affairs Dashboard" accentColour="#1A5276">
      <h1>Home Affairs Dashboard</h1>

      <div className="stats-grid">
        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiUserPlus /></div>
          <div className="stat-body">
            <div className="stat-value">
              {loading ? '—' : stats?.awaiting ?? 0}
            </div>
            <div className="stat-label">New registrations</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiEdit3 /></div>
          <div className="stat-body">
            <div className="stat-value">
              {loading ? '—' : stats?.captured ?? 0}
            </div>
            <div className="stat-label">Details captured</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiCheckCircle /></div>
          <div className="stat-body">
            <div className="stat-value">
              {loading ? '—' : stats?.verified ?? 0}
            </div>
            <div className="stat-label">Verified citizens</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiRefreshCw /></div>
          <div className="stat-body">
            <div className="stat-value">
              {loading ? '—' : stats?.updatedToday ?? 0}
            </div>
            <div className="stat-label">Updated today</div>
          </div>
        </Card>
      </div>

      <div className="quick-actions">
        <Button
          variant="primary"
          onClick={() => navigate('/home-affairs/registrations')}
        >
          <FiUserPlus /> Review new registrations
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/home-affairs/search')}
        >
          <FiSearch /> Search citizen
        </Button>
      </div>
    </PageWrapper>
  );
}

export default HAStaffDashboard;