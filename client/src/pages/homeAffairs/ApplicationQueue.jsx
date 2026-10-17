import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { listApplications } from '../../api/homeAffairsApi';
import { formatDate } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';

function ApplicationQueue() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { error: showError } = useNotification();

  const load = async () => {
    setLoading(true);
    try {
      const data = await listApplications({ search, status: statusFilter });
      setApps(data);
    } catch (err) {
      setError('Could not load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]); // Only reload on filter change, search can be manual

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { 
      key: 'citizen', 
      label: 'Citizen',
      render: (r) => `${r.first_name} ${r.last_name} (${r.citizen_national_id})`
    },
    { 
      key: 'serviceName', 
      label: 'Service',
      render: (r) => r.data?.serviceName || '—'
    },
    { 
      key: 'branch_name', 
      label: 'Collection Branch',
      render: (r) => r.branch_name || '—'
    },
    { 
      key: 'submitted_at', 
      label: 'Submitted',
      render: (r) => formatDate(r.submitted_at)
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge variant={r.status.toLowerCase()} label={r.status.replace(/_/g, ' ')} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <Button variant="primary" size="small" onClick={() => navigate(`/home-affairs/applications/${r.id}`)}>
          Process
        </Button>
      )
    }
  ];

  return (
    <PageWrapper title="Application Queue" showBack backPath="/home-affairs/dashboard">
      <h1>Home Affairs Applications</h1>
      <p className="text-muted">Review and process citizen applications.</p>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Search</label>
            <input 
              type="text" 
              className="filter-input" 
              placeholder="Name or Reference" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PRODUCTION">In Production</option>
              <option value="READY_FOR_COLLECTION">Ready for Collection</option>
              <option value="COLLECTED">Collected</option>
            </select>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {loading ? <p>Loading...</p> : (
        apps.length === 0 ? <p>No applications found.</p> : <Table columns={columns} data={apps} />
      )}
    </PageWrapper>
  );
}

export default ApplicationQueue;