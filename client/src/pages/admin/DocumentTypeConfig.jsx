import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import { useSettings } from '../../context/SettingsContext';
import { useNotification } from '../../context/NotificationContext';
import { updateDocumentType } from '../../api/adminApi';

function DocumentTypeConfig() {
  const { settings, reload } = useSettings();
  const { success, error: showError } = useNotification();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDocumentType(editing.id, editing);
      await reload();
      success('Document type updated');
      setEditing(null);
    } catch (err) {
      showError('Could not save the document type.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Document type' },
    { key: 'code', label: 'Code' },
    { key: 'acceptedFormats', label: 'Accepted formats' },
    { key: 'maxSizeMb', label: 'Max size (MB)' },
    { key: 'isRequired', label: 'Required', render: (r) => (r.isRequired ? 'Yes' : 'No') },
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
      title="Document Type Configuration"
      showBack
      backPath="/admin/settings"
      accentColour="#2C3E50"
    >
      <h1>Document types</h1>

      <Table columns={columns} data={settings.documentTypes || []} />

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
          <Input
            label="Accepted formats"
            value={editing.acceptedFormats}
            onChange={(e) =>
              setEditing({ ...editing, acceptedFormats: e.target.value })
            }
            helpText="Comma separated: pdf,jpg,png"
          />
          <Input
            label="Max size (MB)"
            type="number"
            value={editing.maxSizeMb}
            onChange={(e) =>
              setEditing({ ...editing, maxSizeMb: e.target.value })
            }
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

export default DocumentTypeConfig;