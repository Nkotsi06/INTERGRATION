import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiUserCheck,
  FiActivity,
  FiServer,
  FiUserPlus,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import useFetch from '../../hooks/useFetch';
import { getDashboardStats, getHealth, getRecentActivity } from '../../api/adminApi';
import { formatDate } from '../../utils/formatters';

function AdminDashboard() {
  const { data: stats, loading } = useFetch(getDashboardStats, []);
  const { data: health } = useFetch(getHealth, []);
  const { data: activity } = useFetch(() => getRecentActivity(5), []);
  const navigate = useNavigate();

  const today = formatDate(new Date().toISOString());

  return (
    <AdminLayout title="Admin Dashboard">
      <h1>Admin Dashboard</h1>
      <p className="text-muted">
        Integrated Government Services · System overview · {today}
      </p>

      <div className="stats-grid">
        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiUsers /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.totalUsers ?? 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiUserCheck /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.activeStaff ?? 0}</div>
            <div className="stat-label">Active Staff</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiActivity /></div>
          <div className="stat-body">
            <div className="stat-value">{loading ? '—' : stats?.pendingActions ?? 0}</div>
            <div className="stat-label">Pending Actions</div>
          </div>
        </Card>

        <Card variant="bordered" className="stat-card">
          <div className="stat-icon"><FiServer /></div>
          <div className="stat-body">
            <div className="stat-value">{stats?.systemHealth || 'Healthy'}</div>
            <div className="stat-label">System Health</div>
          </div>
        </Card>
      </div>

      {health?.ok ? (
        <div className="admin-health-banner admin-health-ok">
          <FiCheckCircle />
          <div>
            <strong>System operational</strong>
            <p className="text-muted">
              All ministry services are available. Last checked at {health.checkedAt || '—'}.
            </p>
          </div>
        </div>
      ) : (
        <div className="admin-health-banner admin-health-error">
          <FiAlertCircle />
          <div>
            <strong>System check failed</strong>
            <p className="text-muted">
              {health?.message || 'One or more services are not responding. Please check the backend.'}
            </p>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/admin/users/add')}>
          <FiUserPlus /> Add New User
        </Button>
        <Button variant="secondary" onClick={() => navigate('/admin/audit-logs')}>
          <FiFileText /> View Audit Logs
        </Button>
      </div>

      <h2>Recent activity</h2>

      {!activity || activity.length === 0 ? (
        <Alert type="info" message="No activity to show yet." />
      ) : (
        <ul className="admin-activity-list">
          {activity.map((entry) => (
            <li key={entry.id} className="admin-activity-item">
              <span className="admin-activity-time">{entry.time}</span>
              <span className="admin-activity-user">{entry.username}</span>
              <span className="admin-activity-action">{entry.action}</span>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;