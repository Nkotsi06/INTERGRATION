import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { updateLanguage } from '../../api/adminApi';

function LanguageConfig() {
  const { languages } = useLanguage();
  const { success, error: showError } = useNotification();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLanguage(editing.id, editing);
      success('Language updated');
      setEditing(null);
    } catch (err) {
      showError('Could not save the language.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'isDefault', label: 'Default', render: (r) => (r.isDefault ? 'Yes' : 'No') },
    { key: 'isActive', label: 'Active', render: (r) => (r.isActive ? 'Yes' : 'No') },
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
    <PageWrapper
      title="Language Configuration"
      showBack
      backPath="/admin/settings"
      accentColour="#2C3E50"
    >
      <h1>Languages</h1>

      <Table columns={columns} data={languages || []} />

      {editing && (
        <Modal
          isOpen
          onClose={() => setEditing(null)}
          title={`Edit ${editing.name}`}
          size="medium"
        >
          <Input
            label="Code"
            value={editing.code}
            onChange={(e) => setEditing({ ...editing, code: e.target.value })}
          />
          <Input
            label="Name"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
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

export default LanguageConfig;