import { useNavigate } from 'react-router-dom';
import { FiClock, FiCalendar, FiCreditCard } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useFetch from '../../hooks/useFetch';
import { getStaffStats } from '../../api/trafficApi';

function TrafficStaffDashboard() {
  const { data: stats, loading } = useFetch(getStaffStats, []);
  const navigate = useNavigate();

  return (
    <PageWrapper title="Traffic Staff Dashboard" accentColour="#B9770E">
      <h1>Traffic staff dashboard</h1>

      <div className="stats-grid">
        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiClock /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.pending ?? 0}</div>
            <div className="stat-label">Pending applications</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiCalendar /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.todayAppointments ?? 0}</div>
            <div className="stat-label">Today's appointments</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiCreditCard /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.licencesIssued ?? 0}</div>
            <div className="stat-label">Licences issued</div>
          </div>
        </Card>
      </div>

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/traffic/processing')}>
          Process applications
        </Button>
      </div>
    </PageWrapper>
  );
}

export default TrafficStaffDashboard;