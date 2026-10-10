import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import { useSettings } from '../../context/SettingsContext';
import { useNotification } from '../../context/NotificationContext';
import { updateStatusType } from '../../api/adminApi';

function StatusConfig() {
  const { settings, reload } = useSettings();
  const { success, error: showError } = useNotification();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStatusType(editing.id, editing);
      await reload();
      success('Status updated');
      setEditing(null);
    } catch (err) {
      showError('Could not save the status.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Status' },
    { key: 'code', label: 'Code' },
    {
      key: 'colourHex',
      label: 'Colour',
      render: (r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 16,
              height: 16,
              backgroundColor: r.colourHex,
              borderRadius: 4,
              display: 'inline-block',
            }}
          />
          {r.colourHex}
        </span>
      ),
    },
    { key: 'displayOrder', label: 'Order' },
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
      title="Status Configuration"
      showBack
      backPath="/admin/settings"
      accentColour="#2C3E50"
    >
      <h1>Status types</h1>

      <Table columns={columns} data={settings.statusTypes || []} />

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
            label="Colour hex"
            value={editing.colourHex}
            onChange={(e) =>
              setEditing({ ...editing, colourHex: e.target.value })
            }
          />
          <Input
            label="Display order"
            type="number"
            value={editing.displayOrder}
            onChange={(e) =>
              setEditing({ ...editing, displayOrder: e.target.value })
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

export default StatusConfig;