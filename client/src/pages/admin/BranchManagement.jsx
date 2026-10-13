import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Checkbox from '../../components/common/Checkbox';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { useSettings } from '../../context/SettingsContext';
import { useNotification } from '../../context/NotificationContext';
import { LESOTHO_DISTRICTS } from '../../utils/districts';
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../../api/adminApi';

const emptyForm = {
  ministryCode: '',
  name: '',
  district: '',
  address: '',
  phone: '',
  email: '',
  openingHours: '',
  isActive: true,
  displayOrder: 0,
};

function BranchManagement() {
  const { settings } = useSettings();
  const { success, error: showError } = useNotification();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [filterMinistry, setFilterMinistry] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterActive, setFilterActive] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const params = {};
      if (filterMinistry) params.ministryCode = filterMinistry;
      if (filterDistrict) params.district = filterDistrict;
      if (filterActive) params.activeOnly = 'true';
      setRows(await getBranches(params));
    } catch (err) {
      setLoadError('Could not load branches.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filterMinistry, filterDistrict, filterActive]);

  const ministries = settings.ministries || [];

  const handleNew = () => setEditing({ ...emptyForm });

  const handleSave = async () => {
    if (!editing.ministryCode) return showError('Ministry is required.');
    if (!editing.name) return showError('Name is required.');
    if (!editing.district) return showError('District is required.');

    setSaving(true);
    try {
      const payload = {
        ministryCode: editing.ministryCode,
        name: editing.name.trim(),
        district: editing.district,
        address: editing.address.trim() || null,
        phone: editing.phone.trim() || null,
        email: editing.email.trim() || null,
        openingHours: editing.openingHours.trim() || null,
        isActive: editing.isActive,
        displayOrder: parseInt(editing.displayOrder, 10) || 0,
      };
      if (editing.id) {
        await updateBranch(editing.id, payload);
        success('Branch updated');
      } else {
        await createBranch(payload);
        success('Branch created');
      }
      setEditing(null);
      load();
    } catch (err) {
      showError(err.message || 'Could not save the branch.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteBranch(deleting.id);
      success('Branch deleted');
      setDeleting(null);
      load();
    } catch (err) {
      showError(err.message || 'Could not delete the branch.');
    } finally {
      setSaving(false);
    }
  };

  const ministryOptions = ministries.map((m) => ({ value: m.code, label: m.name }));
  const districtOptions = LESOTHO_DISTRICTS.map((d) => ({ value: d, label: d }));

  const columns = [
    {
      key: 'ministry_code',
      label: 'Ministry',
      render: (r) => labelForMinistry(ministries, r.ministry_code),
    },
    { key: 'name', label: 'Branch' },
    { key: 'district', label: 'District' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
    {
      key: 'is_active',
      label: 'Status',
      render: (r) => (r.is_active ? 'Active' : 'Inactive'),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="small" onClick={() => setEditing({ ...r })}>
            Edit
          </Button>
          <Button variant="danger" size="small" onClick={() => setDeleting(r)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Branch Management" showBack backPath="/admin/dashboard">
      <h1>Branch management</h1>
      <p className="text-muted">
        Create and manage the branches where each ministry offers services.
      </p>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Ministry</label>
            <select
              className="filter-select"
              value={filterMinistry}
              onChange={(e) => setFilterMinistry(e.target.value)}
            >
              <option value="">All</option>
              {ministries.map((m) => (
                <option key={m.code} value={m.code}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <label className="filter-label">District</label>
            <select
              className="filter-select"
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
            >
              <option value="">All</option>
              {LESOTHO_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown" style={{ alignSelf: 'end' }}>
            <Checkbox
              label="Active only"
              checked={filterActive}
              onChange={(e) => setFilterActive(e.target.checked)}
            />
          </div>
        </div>

        <Button variant="primary" onClick={handleNew}>
          Add branch
        </Button>
      </div>

      {loadError && <Alert type="error" message={loadError} />}

      {loading ? (
        <p className="text-muted">Loading branches…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No branches yet"
          message="Click 'Add branch' to create the first one."
        />
      ) : (
        <Table columns={columns} data={rows} />
      )}

      {editing && (
        <Modal
          isOpen
          onClose={() => setEditing(null)}
          title={editing.id ? 'Edit branch' : 'Add branch'}
          size="large"
        >
          <div className="form-grid">
            <Select
              label="Ministry"
              value={editing.ministryCode}
              onChange={(e) => setEditing({ ...editing, ministryCode: e.target.value })}
              options={ministryOptions}
              required
            />
            <Input
              label="Branch name"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              required
            />
            <Select
              label="District"
              value={editing.district}
              onChange={(e) => setEditing({ ...editing, district: e.target.value })}
              options={districtOptions}
              required
            />
            <Input
              label="Phone"
              value={editing.phone}
              onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={editing.email}
              onChange={(e) => setEditing({ ...editing, email: e.target.value })}
            />
            <Input
              label="Opening hours"
              value={editing.openingHours}
              onChange={(e) => setEditing({ ...editing, openingHours: e.target.value })}
              helpText="e.g. Mon–Fri 08:00–16:30"
            />
            <Input
              label="Address"
              value={editing.address}
              onChange={(e) => setEditing({ ...editing, address: e.target.value })}
              full
            />
            <Input
              label="Display order"
              type="number"
              value={editing.displayOrder}
              onChange={(e) => setEditing({ ...editing, displayOrder: e.target.value })}
            />
            <Checkbox
              label="Active"
              checked={editing.isActive}
              onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
            />
          </div>

          <FormActions
            primaryLabel={editing.id ? 'Save changes' : 'Create branch'}
            primaryLoading={saving}
            onPrimary={handleSave}
            onSecondary={() => setEditing(null)}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete this branch?"
        message={`${deleting?.name || 'This branch'} will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        loading={saving}
      />
    </AdminLayout>
  );
}

function labelForMinistry(ministries, code) {
  const m = ministries.find((mm) => mm.code === code);
  return m ? m.name : code || '—';
}

export default BranchManagement;