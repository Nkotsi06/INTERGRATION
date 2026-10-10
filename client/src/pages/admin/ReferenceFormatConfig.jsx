import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import { useSettings } from '../../context/SettingsContext';
import { useNotification } from '../../context/NotificationContext';
import { updateReferenceFormat } from '../../api/adminApi';

function ReferenceFormatConfig() {
  const { settings, reload } = useSettings();
  const { success, error: showError } = useNotification();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateReferenceFormat(editing.id, editing);
      await reload();
      success('Reference format updated');
      setEditing(null);
    } catch (err) {
      showError('Could not save the reference format.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Format' },
    { key: 'prefix', label: 'Prefix' },
    { key: 'yearFormat', label: 'Year format' },
    { key: 'sequenceLength', label: 'Sequence length' },
    { key: 'example', label: 'Example' },
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
      title="Reference Format Configuration"
      showBack
      backPath="/admin/settings"
      accentColour="#2C3E50"
    >
      <h1>Reference formats</h1>

      <Table columns={columns} data={settings.referenceFormats || []} />

      {editing && (
        <Modal
          isOpen
          onClose={() => setEditing(null)}
          title={`Edit ${editing.name}`}
          size="medium"
        >
          <Input
            label="Prefix"
            value={editing.prefix}
            onChange={(e) => setEditing({ ...editing, prefix: e.target.value })}
          />
          <Input
            label="Year format"
            value={editing.yearFormat}
            onChange={(e) =>
              setEditing({ ...editing, yearFormat: e.target.value })
            }
            helpText="Use YYYY or YY"
          />
          <Input
            label="Sequence length"
            type="number"
            value={editing.sequenceLength}
            onChange={(e) =>
              setEditing({ ...editing, sequenceLength: e.target.value })
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

export default ReferenceFormatConfig;