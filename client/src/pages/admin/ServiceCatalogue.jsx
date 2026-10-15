import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { listAllServices, updateService } from '../../api/serviceApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

const MINISTRIES = [
  { value: '', label: 'All ministries' },
  { value: 'HOME_AFFAIRS', label: 'Home Affairs' },
  { value: 'TRAFFIC', label: 'Traffic' },
  { value: 'POLICE', label: 'Police' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'PENSIONS', label: 'Pensions' },
  { value: 'PASSPORT', label: 'Passport' },
];

function ServiceCatalogue() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ministry, setMinistry] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useNotification();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAllServices({ ministry: ministry || undefined });
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [ministry]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateService(editing.id, {
        name: editing.name,
        description: editing.description,
        is_enabled: editing.is_enabled,
        fee: editing.fee,
        display_order: editing.display_order,
        unavailable_message: editing.unavailable_message,
      });
      success('Service updated');
      setEditing(null);
      load();
    } catch (err) {
      showError(err.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'ministry', label: 'Ministry' },
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'service_type', label: 'Type' },
    {
      key: 'is_enabled',
      label: 'Enabled',
      render: (r) => (r.is_enabled ? 'Yes' : 'No'),
    },
    {
      key: 'fee',
      label: 'Fee',
      render: (r) => formatCurrency(r.fee),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button variant="secondary" size="small" onClick={() => setEditing({ ...r })}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper title="Service Catalogue" showBack backPath="/admin/dashboard">
      <h1>Service catalogue</h1>
      <p className="text-muted">
        Enable, disable, and edit the services each ministry offers.
      </p>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Ministry</label>
            <select
              className="filter-select"
              value={ministry}
              onChange={(e) => setMinistry(e.target.value)}
            >
              {MINISTRIES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <TableSkeleton rows={6} columns={7} />}
      {!loading && error && <Alert type="error" message={error} />}
      {!loading && !error && services.length === 0 && (
        <p className="text-muted">No services found.</p>
      )}
      {!loading && !error && services.length > 0 && (
        <Table columns={columns} data={services} />
      )}

      {editing && (
        <Modal
          isOpen
          onClose={() => setEditing(null)}
          title={`Edit ${editing.name}`}
          size="medium"
        >
          <Input
            label="Name"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          />
          <div className="form-field">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={editing.description || ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </div>
          <Input
            label="Fee"
            type="number"
            value={editing.fee}
            onChange={(e) => setEditing({ ...editing, fee: e.target.value })}
          />
          <Input
            label="Display order"
            type="number"
            value={editing.display_order}
            onChange={(e) => setEditing({ ...editing, display_order: e.target.value })}
          />
          <Select
            label="Enabled"
            value={editing.is_enabled ? 'true' : 'false'}
            onChange={(e) => setEditing({ ...editing, is_enabled: e.target.value === 'true' })}
            options={[
              { value: 'true', label: 'Enabled' },
              { value: 'false', label: 'Disabled' },
            ]}
          />
          <Input
            label="Unavailable message (shown when disabled)"
            value={editing.unavailable_message || ''}
            onChange={(e) => setEditing({ ...editing, unavailable_message: e.target.value })}
          />
          <FormActions
            primaryLabel="Save"
            primaryLoading={saving}
            onPrimary={handleSave}
            onSecondary={() => setEditing(null)}
          />
        </Modal>
      )}
    </PageWrapper>
  );
}

export default ServiceCatalogue;