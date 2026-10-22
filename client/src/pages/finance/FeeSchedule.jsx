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
import { listFees, updateFee } from '../../api/feeScheduleApi';
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

function FeeSchedule() {
  const [fees, setFees] = useState([]);
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
      const data = await listFees({ ministry: ministry || undefined });
      setFees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load fees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [ministry]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFee(editing.id, {
        service_name: editing.service_name,
        amount: editing.amount,
        is_active: editing.is_active,
        notes: editing.notes,
      });
      success('Fee updated');
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
    { key: 'service_code', label: 'Code' },
    { key: 'service_name', label: 'Service' },
    {
      key: 'amount',
      label: 'Fee',
      render: (r) => formatCurrency(r.amount),
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (r) => (r.is_active ? 'Yes' : 'No'),
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
    <PageWrapper title="Fee Schedule" showBack backPath="/finance/dashboard" accentColour="#117864">
      <h1>Fee schedule</h1>
      <p className="text-muted">
        Every fee charged by every ministry. Editing here changes the amount
        citizens see immediately.
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

      {loading && <TableSkeleton rows={8} columns={5} />}
      {!loading && error && <Alert type="error" message={error} />}
      {!loading && !error && fees.length === 0 && (
        <p className="text-muted">No fees found.</p>
      )}
      {!loading && !error && fees.length > 0 && (
        <Table columns={columns} data={fees} />
      )}

      {editing && (
        <Modal
          isOpen
          onClose={() => setEditing(null)}
          title={`Edit ${editing.service_name}`}
          size="medium"
        >
          <Input
            label="Service name"
            value={editing.service_name}
            onChange={(e) => setEditing({ ...editing, service_name: e.target.value })}
          />
          <Input
            label="Amount"
            type="number"
            value={editing.amount}
            onChange={(e) => setEditing({ ...editing, amount: e.target.value })}
          />
          <Select
            label="Active"
            value={editing.is_active ? 'true' : 'false'}
            onChange={(e) => setEditing({ ...editing, is_active: e.target.value === 'true' })}
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
          />
          <div className="form-field">
            <label className="form-label">Notes</label>
            <textarea
              className="form-input"
              rows={3}
              value={editing.notes || ''}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
            />
          </div>
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

export default FeeSchedule;
