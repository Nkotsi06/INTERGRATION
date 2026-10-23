import { useCallback, useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import {
  createGovernmentEmployee,
  importGovernmentEmployees,
  listGovernmentEmployees,
  listGovernmentEmployers,
  updateGovernmentEmployee,
} from '../../api/financeApi';

const PAGE_SIZE = 25;
const EMPTY_FORM = {
  nationalId: '',
  employerId: '',
  employeeNumber: '',
  startDate: '',
  status: 'ACTIVE',
  endDate: '',
};

function parseCsv(text) {
  const records = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) records.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field.trim());
    if (row.some(Boolean)) records.push(row);
  }
  if (quoted) throw new Error('The CSV contains an unclosed quoted field.');
  const headers = records.shift()?.map((header) => header.toLowerCase());
  const requiredHeaders = ['nationalid', 'employerid', 'employeenumber', 'startdate', 'status'];
  if (!headers || requiredHeaders.some((header) => !headers.includes(header))) {
    throw new Error('CSV headers must include nationalId, employerId, employeeNumber, startDate, and status. endDate is optional.');
  }
  return records.map((record) => Object.fromEntries(
    headers.map((header, index) => [header, record[index] || ''])
  )).map((record) => ({
    nationalId: record.nationalid,
    employerId: record.employerid,
    employeeNumber: record.employeenumber,
    startDate: record.startdate,
    status: record.status,
    endDate: record.enddate || '',
  }));
}

function GovernmentEmployeeRegister() {
  const [data, setData] = useState({ rows: [], total: 0 });
  const [employers, setEmployers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listGovernmentEmployees({ search, status, page, pageSize: PAGE_SIZE });
      setData(result);
    } catch (err) {
      setError(err.message || 'Could not load employee records.');
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    listGovernmentEmployers(true)
      .then(setEmployers)
      .catch((err) => setError(err.message || 'Could not load government employers.'));
  }, []);

  const openEditor = (employee) => {
    setEditing(employee || {});
    setForm(employee ? {
      nationalId: employee.nationalId,
      employerId: employee.employerId,
      employeeNumber: employee.employeeNumber,
      startDate: String(employee.startDate).slice(0, 10),
      status: employee.status,
      endDate: employee.endDate ? String(employee.endDate).slice(0, 10) : '',
    } : EMPTY_FORM);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, endDate: form.status === 'ACTIVE' ? null : form.endDate };
      if (editing?.id) await updateGovernmentEmployee(editing.id, payload);
      else await createGovernmentEmployee(payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message || 'Could not save the employee record.');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImporting(true);
    setImportReport(null);
    setError(null);
    try {
      const rows = parseCsv(await file.text());
      setImportReport(await importGovernmentEmployees(rows));
      await load();
    } catch (err) {
      setError(err.message || 'Could not import this CSV file.');
    } finally {
      setImporting(false);
    }
  };

  const columns = [
    { key: 'id', label: 'Record ID' },
    { key: 'nationalId', label: 'National ID' },
    { key: 'employeeNumber', label: 'Employee number' },
    { key: 'employerName', label: 'Employer' },
    { key: 'employerId', label: 'Employer ID' },
    { key: 'startDate', label: 'Start date' },
    { key: 'status', label: 'Status' },
    { key: 'endDate', label: 'End / retirement date', render: (row) => row.endDate || '—' },
    { key: 'actions', label: 'Actions', render: (row) => <Button size="small" variant="secondary" onClick={() => openEditor(row)}>Edit</Button> },
  ];
  const pageCount = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <PageWrapper title="Government employee register" showBack backPath="/finance/staff" accentColour="#117864">
      <h1>Government employee register</h1>
      <p className="text-muted">Maintain verified government employment records. Records are updated or ended, never deleted.</p>
      <div className="quick-actions">
        <Button variant="primary" onClick={() => openEditor(null)}>Add employee</Button>
        <label className="btn btn-secondary">
          {importing ? 'Importing…' : 'Import CSV'}
          <input type="file" accept=".csv,text/csv" onChange={handleImport} disabled={importing} hidden />
        </label>
      </div>
      {error && <Alert type="error" message={error} />}
      {importReport && (
        <section className="dashboard-section" aria-live="polite">
          <h2>Import report</h2>
          <p>{importReport.imported} imported; {importReport.rejected} rejected out of {importReport.total} rows.</p>
          {importReport.results.some((result) => result.status === 'REJECTED') && (
            <Table
              columns={[
                { key: 'row', label: 'CSV row' },
                { key: 'status', label: 'Result' },
                { key: 'reason', label: 'Reason', render: (row) => row.reason || 'Imported' },
              ]}
              data={importReport.results}
            />
          )}
        </section>
      )}
      <div className="filter-bar">
        <div className="filter-controls">
          <Input label="Search records" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="National ID, employee number, employer" />
          <Select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'RETIRED', label: 'Retired' },
            { value: 'RESIGNED', label: 'Resigned' },
          ]} />
        </div>
      </div>
      {loading && <TableSkeleton rows={8} columns={7} />}
      {!loading && !error && <Table columns={columns} data={data.rows} emptyMessage="No employee records found." />}
      {!loading && data.total > 0 && (
        <div className="pagination">
          <span className="pagination-summary">Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, data.total)} of {data.total}</span>
          <div className="pagination-controls">
            <Button size="small" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
            <Button size="small" variant="secondary" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</Button>
          </div>
        </div>
      )}
      {editing && (
        <Modal isOpen onClose={() => setEditing(null)} title={editing.id ? 'Edit employee record' : 'Add employee record'} size="medium">
          <Input label="National ID" value={form.nationalId} onChange={(event) => setForm({ ...form, nationalId: event.target.value })} required />
          <Select label="Employer" value={form.employerId} onChange={(event) => setForm({ ...form, employerId: event.target.value })} required options={employers.map((item) => ({ value: item.id, label: item.name }))} />
          <Input label="Employee number" value={form.employeeNumber} onChange={(event) => setForm({ ...form, employeeNumber: event.target.value })} required />
          <Input label="Start date" type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required />
          <Select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value, endDate: event.target.value === 'ACTIVE' ? '' : form.endDate })} options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'RETIRED', label: 'Retired' },
            { value: 'RESIGNED', label: 'Resigned' },
          ]} />
          {form.status !== 'ACTIVE' && <Input label="End / retirement date" type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required />}
          <FormActions primaryLabel="Save record" primaryLoading={saving} onPrimary={save} onSecondary={() => setEditing(null)} />
        </Modal>
      )}
    </PageWrapper>
  );
}

export default GovernmentEmployeeRegister;
