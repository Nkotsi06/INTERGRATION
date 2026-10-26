import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import { createGovernmentEmployer, listGovernmentEmployers, updateGovernmentEmployer } from '../../api/financeApi';

function GovernmentEmployers() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setEmployers(await listGovernmentEmployers());
    } catch (err) {
      setError(err.message || 'Could not load employers.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openEditor = (employer) => {
    setEditing(employer || {});
    setForm(employer ? { code: employer.code, name: employer.name, isActive: employer.isActive } : { code: '', name: '', isActive: true });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editing?.id) await updateGovernmentEmployer(editing.id, form);
      else await createGovernmentEmployer(form);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message || 'Could not save the employer.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID (CSV employerId)' },
    { key: 'code', label: 'Employer code' },
    { key: 'name', label: 'Employer name' },
    { key: 'isActive', label: 'Active', render: (row) => row.isActive ? 'Yes' : 'No' },
    { key: 'actions', label: 'Actions', render: (row) => <Button size="small" variant="secondary" onClick={() => openEditor(row)}>Edit</Button> },
  ];

  return (
    <AdminLayout title="Government employers">
      <h1>Government employers</h1>
      <p className="text-muted">Government employers recorded by Home Affairs are added automatically. Manage their codes, names, and active status here.</p>
      <Button variant="primary" onClick={() => openEditor(null)}>Add employer</Button>
      {error && <Alert type="error" message={error} />}
      {loading ? <p role="status">Loading employers…</p> : <Table columns={columns} data={employers} emptyMessage="No employers have been added." />}
      {editing && (
        <Modal isOpen onClose={() => setEditing(null)} title={editing.id ? 'Edit employer' : 'Add employer'} size="medium">
          <Input label="Code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required />
          <Input label="Employer name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          {editing.id && <Select label="Status" value={form.isActive ? 'true' : 'false'} onChange={(event) => setForm({ ...form, isActive: event.target.value === 'true' })} options={[
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ]} />}
          <FormActions primaryLabel="Save employer" primaryLoading={saving} onPrimary={save} onSecondary={() => setEditing(null)} />
        </Modal>
      )}
    </AdminLayout>
  );
}

export default GovernmentEmployers;
