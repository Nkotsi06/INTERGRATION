import { useCallback, useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import {
  clearGovernmentDebt,
  createGovernmentDebt,
  listGovernmentDebts,
} from '../../api/financeApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PAGE_SIZE = 25;

function GovernmentDebtRegister() {
  const [data, setData] = useState({ rows: [], total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [newDebtOpen, setNewDebtOpen] = useState(false);
  const [form, setForm] = useState({ nationalId: '', debtType: '', amount: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listGovernmentDebts({ search, status, page, pageSize: PAGE_SIZE }));
    } catch (err) {
      setError(err.message || 'Could not load government debt records.');
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);
  useEffect(() => { load(); }, [load]);

  const saveDebt = async () => {
    setSaving(true);
    setError(null);
    try {
      await createGovernmentDebt({ ...form, amount: Number(form.amount) });
      setNewDebtOpen(false);
      setForm({ nationalId: '', debtType: '', amount: '' });
      await load();
    } catch (err) {
      setError(err.message || 'Could not record this debt.');
    } finally {
      setSaving(false);
    }
  };

  const markCleared = async (row) => {
    setError(null);
    try {
      await clearGovernmentDebt(row.id);
      await load();
    } catch (err) {
      setError(err.message || 'Could not clear this debt record.');
    }
  };

  const columns = [
    { key: 'id', label: 'Record ID' },
    { key: 'nationalId', label: 'National ID' },
    { key: 'debtType', label: 'Debt type' },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'status', label: 'Status' },
    { key: 'recordedBy', label: 'Recorded by', render: (row) => row.recordedBy || '—' },
    { key: 'createdAt', label: 'Recorded', render: (row) => formatDate(row.createdAt) },
    { key: 'dateCleared', label: 'Date cleared', render: (row) => row.dateCleared ? formatDate(row.dateCleared) : '—' },
    { key: 'actions', label: 'Actions', render: (row) => row.status === 'OUTSTANDING'
      ? <Button size="small" variant="secondary" onClick={() => markCleared(row)}>Mark cleared</Button>
      : '—' },
  ];
  const pageCount = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <PageWrapper title="Government debt register" showBack backPath="/finance/staff" accentColour="#117864">
      <h1>Government debt register</h1>
      <p className="text-muted">Record and clear government debts. Debt records are retained and cannot be deleted.</p>
      <Button variant="primary" onClick={() => setNewDebtOpen(true)}>Record debt</Button>
      {error && <Alert type="error" message={error} />}
      <div className="filter-bar">
        <div className="filter-controls">
          <Input label="Search records" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="National ID or debt type" />
          <div className="filter-dropdown">
            <label className="filter-label" htmlFor="government-debt-status">Status</label>
            <select id="government-debt-status" className="filter-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              <option value="OUTSTANDING">Outstanding</option>
              <option value="CLEARED">Cleared</option>
            </select>
          </div>
        </div>
      </div>
      {loading && <TableSkeleton rows={8} columns={7} />}
      {!loading && !error && <Table columns={columns} data={data.rows} emptyMessage="No debt records found." />}
      {!loading && data.total > 0 && (
        <div className="pagination">
          <span className="pagination-summary">Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, data.total)} of {data.total}</span>
          <div className="pagination-controls">
            <Button size="small" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
            <Button size="small" variant="secondary" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</Button>
          </div>
        </div>
      )}
      {newDebtOpen && (
        <Modal isOpen onClose={() => setNewDebtOpen(false)} title="Record government debt" size="medium">
          <Input label="National ID" value={form.nationalId} onChange={(event) => setForm({ ...form, nationalId: event.target.value })} required />
          <Input label="Debt type" value={form.debtType} onChange={(event) => setForm({ ...form, debtType: event.target.value })} required />
          <Input label="Amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
          <FormActions primaryLabel="Record debt" primaryLoading={saving} onPrimary={saveDebt} onSecondary={() => setNewDebtOpen(false)} />
        </Modal>
      )}
    </PageWrapper>
  );
}

export default GovernmentDebtRegister;
