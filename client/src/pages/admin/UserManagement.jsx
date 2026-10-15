import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { getUsers, activateUser, deactivateUser, deleteUser } from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';
import DeactivatePanel from '../../components/admin/DeactivatePanel';
import DeletePanel from '../../components/admin/DeletePanel';

const PAGE_SIZE = 10;

function UserManagement() {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [filters, setFilters] = useState({
    username: '',
    role: '',
    status: '',
  });
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [activateTarget, setActivateTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getUsers({
        username: filters.username || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setData({ rows: result.rows || [], total: result.total || 0 });
    } catch (err) {
      setLoadError('Could not load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const [usernameInput, setUsernameInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, username: usernameInput }));
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [usernameInput]);

  const hasActiveFilters = !!(filters.username || filters.role || filters.status);

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'roleLabel', label: 'Role' },
    { key: 'ministryLabel', label: 'Ministry' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`user-status user-status-${row.status}`}>
          {row.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="user-row-actions">
          <button
            type="button"
            className="btn-link"
            onClick={() => navigate(`/admin/users/edit/${row.id}`)}
          >
            Edit
          </button>
          {row.status === 'ACTIVE' && (
            <button
              type="button"
              className="btn-link"
              onClick={() => setDeactivateTarget(row)}
            >
              Deactivate
            </button>
          )}
          {row.status === 'INACTIVE' && (
            <>
              <button
                type="button"
                className="btn-link"
                onClick={() => setActivateTarget(row)}
              >
                Activate
              </button>
              <button
                type="button"
                className="btn-link btn-link-danger"
                onClick={() => setDeleteTarget(row)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const confirmDeactivate = async () => {
    setActionLoading(true);
    try {
      await deactivateUser(deactivateTarget.id);
      success(`User ${deactivateTarget.username} deactivated.`);
      setDeactivateTarget(null);
      load();
    } catch (err) {
      showError(err.message || 'Could not deactivate the user.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmActivate = async () => {
    setActionLoading(true);
    try {
      await activateUser(activateTarget.id);
      success(`User ${activateTarget.username} activated.`);
      setActivateTarget(null);
      load();
    } catch (err) {
      showError(err.message || 'Could not activate the user.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    setActionLoading(true);
    try {
      await deleteUser(deleteTarget.id);
      success(`User ${deleteTarget.username} deleted. Audit records were kept.`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(err.message || 'Could not delete the user.');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const startRow = (page - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(page * PAGE_SIZE, data.total);

  return (
    <AdminLayout title="User Management">
      <h1>User Management</h1>
      <p className="text-muted">Manage user roles, ministry assignments, and account access.</p>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown" style={{ minWidth: 220 }}>
            <label className="filter-label">Username</label>
            <input
              type="text"
              className="filter-input"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Search username"
            />
          </div>

          <div className="filter-dropdown">
            <label className="filter-label">Role</label>
            <select
              className="filter-select"
              value={filters.role}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, role: e.target.value }));
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="CITIZEN">Citizen</option>
              <option value="HOME_AFFAIRS">Home Affairs</option>
              <option value="TRAFFIC">Traffic</option>
              <option value="POLICE">Police</option>
              <option value="FINANCE">Finance</option>
              <option value="PENSIONS">Pensions</option>
              <option value="PASSPORT">Passport</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, status: e.target.value }));
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="clear-filters"
            onClick={() => {
              setUsernameInput('');
              setFilters({ username: '', role: '', status: '' });
              setPage(1);
            }}
          >
            Clear filters
          </button>
        )}

        <Button variant="primary" onClick={() => navigate('/admin/users/add')}>
          Add New User
        </Button>
      </div>

      {loadError && <Alert type="error" message={loadError} />}

      {loading && <TableSkeleton rows={8} columns={5} />}

      {!loading && data.rows.length === 0 && (
        <EmptyState
          title="No users match these filters"
          message="Try changing the filters or the search text."
        />
      )}

      {!loading && data.rows.length > 0 && (
        <>
          <Table columns={columns} data={data.rows} />

          <div className="pagination">
            <span className="pagination-summary">
              Showing {startRow} to {endRow} of {data.total}
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="btn btn-secondary btn-small"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {deactivateTarget && (
        <DeactivatePanel
          user={deactivateTarget}
          action="deactivate"
          loading={actionLoading}
          onCancel={() => setDeactivateTarget(null)}
          onConfirm={confirmDeactivate}
        />
      )}

      {activateTarget && (
        <ConfirmDialog
          isOpen
          onClose={() => setActivateTarget(null)}
          onConfirm={confirmActivate}
          title="Activate this user?"
          message={`${activateTarget.username} will be able to sign in again.`}
          confirmLabel="Activate"
          variant="primary"
          loading={actionLoading}
        />
      )}

      {deleteTarget && (
        <DeletePanel
          user={deleteTarget}
          loading={actionLoading}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AdminLayout>
  );
}

export default UserManagement;